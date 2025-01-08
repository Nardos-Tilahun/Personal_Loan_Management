const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const {
    addPaymentInfo,
    addPaymentDetail,
    addPaymentLate,
} = require("../Services/paymentService/paymentCreateOperation");
const {
    countPaymentsByLoanId,
    getPaymentTerm,
    getAllPaymentInfoByPaymentHashId,
    getPaymentList,
    checkRecentPayment,
} = require("../Services/paymentService/getPaymentOperation");
const {
    getLoanPaymentByLoanId,
    getLoanInfoByLoanId,
    getLoanInterestByLoanId,
    getLoanIdByLoanHashId,
    getLoanDetailByLoanId,
    getAllLoanInfoByLoanHashId,
    getLoanByLoanHashId,
} = require("../Services/loanService/getLoanOperation");
const {
    adjustDate,
} = require("../Services/loanService/loanCreateOperation");
const {
    updateLoanInterest,
    updateLoanPayment,
    getNextPaymentStatus,
} = require("../Services/loanService/updateLoanOperation");
const {
    hashIdForRoute,
    sendNotificationForPayment
} = require("../Services/userService/userCreateOperation");
const { getUserByUserHashId } = require("../Services/userService/getUserOperation");
const { updatePaymentByPaymentHashId, updatePaymentLate } = require("../Services/paymentService/updatePaymentOperation");
const { deletePaymentByPaymentHashId } = require("../Services/paymentService/deletePaymentOperation");
const { verifyMyToken } = require("../Utilities/tokenVerifcation");

async function addPayment(req, res) {
    try {
        const paymentData = await req.body.data[0].payment;
        const LoanID = await getLoanIdByLoanHashId(paymentData.loanHashId);
        const approvedUser = await getUserByUserHashId(paymentData.approvedBy);
        const approvedBy = approvedUser[0].UserID;
        const loanInfo = await getLoanInfoByLoanId(LoanID);
        const loanPayment = await getLoanPaymentByLoanId(LoanID);
        const loanDetail = await getLoanDetailByLoanId(LoanID);
        const loanInterest = await getLoanInterestByLoanId(LoanID);

        if (loanPayment?.Status == "Completed" || loanPayment?.Status == "Late Completed") {
            console.error("Already Completed Loan");
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ msg: "Trying to pay on the settled Loan, Already Completed Loan" });
        }
        let statusCheck = "Active", returnPayment = 0;
        if (paymentData.paymentCurrency === loanInfo?.LoanCurrency && loanPayment?.RemainingPayment < paymentData.paymentAmount) {
            returnPayment = paymentData.paymentAmount - loanPayment?.RemainingPayment;
            paymentData.paymentAmount = loanPayment?.RemainingPayment;
            statusCheck = "Completed";
        } else if (paymentData.paymentCurrency !== loanInfo?.LoanCurrency && loanPayment?.RemainingPayment < paymentData.paymentConversionAmount) {
            returnPayment = paymentData.paymentConversionAmount - loanPayment?.RemainingPayment;
            paymentData.paymentAmount = loanPayment?.RemainingPayment;
            paymentData.paymentConversionAmount = loanPayment?.RemainingPayment;
            statusCheck = "Completed";
        } else if (loanPayment?.RemainingPayment == paymentData.paymentAmount) {
            statusCheck = "Completed";
        }

        let addedAmount = parseFloat(paymentData.paymentAmount);

        if (paymentData.paymentCurrency !== loanInfo?.LoanCurrency) {

            if (paymentData.paymentCurrency === "USD") {
                addedAmount =
                    parseFloat(paymentData.paymentAmount) * parseFloat(paymentData.paymentConversionRate);
            }
            else {
                if (!parseFloat(paymentData.paymentConversionRate) == 0)
                    addedAmount =
                        parseFloat(paymentData.paymentAmount) / parseFloat(paymentData.paymentConversionRate);
            }
        } else {
            paymentData.paymentConversionRate = 1;
        }

        const countPreviousPayment = await countPaymentsByLoanId(LoanID);

        const adjustedCurrentDate = adjustDate(new Date(), loanDetail?.LoanPeriod)

        const generatedPaymentTerm = getPaymentTerm(loanInfo?.LoanStartDate, adjustedCurrentDate, loanDetail?.LoanPeriod);

        const PaymentIdCreated = await addPaymentInfo(
            paymentData,
            LoanID,
            generatedPaymentTerm,
            approvedBy,
        );
        const hashedPaymentId = hashIdForRoute(PaymentIdCreated.toString(), 15); ``
        const loanInterestRate = parseFloat(loanInterest?.LoanInterestRate);
        const interestPaid =
            parseFloat(paymentData.paymentAmount) *
            ((loanInterestRate / 100) / (1 + (loanInterestRate / 100)));
        const principalPaid =
            parseFloat(paymentData.paymentAmount) / (1 + loanInterestRate / 100);
        const newPayedPayment = parseFloat(addedAmount) + parseFloat(loanPayment?.PayedPayment);
        const termFactor = newPayedPayment % parseFloat(loanPayment?.FixedTermPayment);
        let PredictTerm;
        if (termFactor != 0)
            PredictTerm = Math.ceil(newPayedPayment / parseFloat(loanPayment?.FixedTermPayment));
        else
            PredictTerm = newPayedPayment / parseFloat(loanPayment?.FixedTermPayment) + 1;
        await addPaymentDetail(
            paymentData,
            PaymentIdCreated,
            hashedPaymentId,
            PredictTerm,
            interestPaid,
            principalPaid,
            loanInfo
        );
        let latePayment;
        if (loanDetail?.LoanTerm > generatedPaymentTerm && loanPayment?.NextPaymentExpirationDate < adjustedCurrentDate) {
            minAmountToPayForTerm = generatedPaymentTerm * parseFloat(loanPayment?.FixedTermPayment) + parseFloat(loanPayment?.penalityPayment ? loanPayment?.penalityPayment : 0);
            latePayment = parseFloat(loanPayment?.NextPaymentAmount) - newPayedPayment;
        }
        else {
            latePayment = loanInfo?.LoanAmount + loanInterest?.LoanAccrued + loanInterest?.PenalityPayment - newPayedPayment;
            if (generatedPaymentTerm > loanDetail?.LoanTerm) {
                if (statusCheck == "Active")
                    statusCheck = "Late";
                else if (statusCheck = "Completed")
                    statusCheck = "Late Completed"
            }
        }
        let penalityPayment = 0;
        if (latePayment > 0 || paymentData.penalityAmount) {
            LateTerm = Math.ceil((latePayment) / loanPayment?.FixedTermPayment);
            if (latePayment > 0)
                penalityPayment = latePayment * paymentData.penalityRate / 100;
            else
                penalityPayment = paymentData.penalityAmount
            await addPaymentLate(paymentData, PaymentIdCreated, penalityPayment);
        }
        const interestPaidAdded =
            parseFloat(addedAmount) *
            (loanInterestRate / 100 / (1 + loanInterestRate / 100));

        await updateLoanInterest(LoanID, loanInterest, interestPaidAdded)
        const newRemainingPayment = loanPayment?.RemainingPayment - addedAmount + penalityPayment;

        const nextPaymentStatus = getNextPaymentStatus(loanInfo?.LoanStartDate, loanDetail?.LoanTerm, loanDetail?.LoanPeriod, loanDetail?.LoanExpirationDate, newRemainingPayment, newPayedPayment, loanPayment?.FixedTermPayment, PredictTerm, generatedPaymentTerm)

        await updateLoanPayment(LoanID, newPayedPayment, newRemainingPayment, penalityPayment, loanPayment?.PenalityPayment, statusCheck, loanPayment?.LatePaymentCount, nextPaymentStatus);
        currentPaymentNo = countPreviousPayment + 1;
        paymentData.nextPaymentStatus = nextPaymentStatus;
        paymentData.newRemainingPayment = newRemainingPayment;
        paymentData.returnPayment = returnPayment;
        paymentData.newPayedPayment = newPayedPayment;
        paymentData.email = loanInfo.UserEmail;
        paymentData.firstName = loanInfo.firstName;
        paymentData.status = statusCheck;
        if (loanInfo.IsVerified) {
            await sendNotificationForPayment(paymentData)
        }
        const paymentInformation = {
            currentPaymentNo,
            nextPaymentStatus,
            newRemainingPayment,
            newPayedPayment,
            returnPayment,
            loanInfo,
            statusCheck
        };

        const token = jwt.sign(
            paymentInformation,
            process.env.SECRETE_KEY,
            {
                expiresIn: "1d",
            }
        );

        return res.status(StatusCodes.CREATED).json({
            status: "OK",
            msg: "Payment created successfully",
            paymentInformation: token,
        });
    } catch (error) {
        console.error("Error:", error);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Something went wrong" });
    }
}
async function updatePayment(req, res) {
    try {
        const paymentData = await req.body.data[0].payment;
        const previousPayment = await getAllPaymentInfoByPaymentHashId(paymentData.paymentHashId);
        const approvedUser = await getUserByUserHashId(paymentData.approvedBy);
        const approvedBy = approvedUser[0].UserID;
        const loanData = await getLoanByLoanHashId(paymentData.loanHashId);
        if (!await checkRecentPayment(loanData?.loanId, previousPayment.paymentId)) {
            return;
        }

        let preTotalInterestPaid, prepayedPayment, preremainingPayment;

        preInterestLeft = parseFloat(loanData?.interestLeft) + parseFloat(previousPayment?.interestPaid);
        if (previousPayment.paymentCurrency !== loanData?.loanCurrency) {

            if (previousPayment.paymentCurrency === "USD") {
                previousPayment.paymentAmount =
                    parseFloat(previousPayment?.paymentAmount.replace(/,/g, '')) * parseFloat(previousPayment.paymentConversionRate);
            }
            else {
                if (!parseFloat(previousPayment.paymentConversionRate) == 0)
                    previousPayment.paymentAmount =
                        parseFloat(previousPayment?.paymentAmount.replace(/,/g, '')) / parseFloat(previousPayment.paymentConversionRate);
            }
        } else {
            previousPayment.paymentConversionRate = 1;
        }

        let addedAmount = parseFloat(paymentData.paymentAmount);
        if (paymentData.paymentCurrency !== loanData?.loanCurrency) {

            if (paymentData.paymentCurrency === "USD") {
                addedAmount =
                    parseFloat(paymentData?.paymentAmount.replace(/,/g, '')) * parseFloat(paymentData.paymentConversionRate);
            }
            else {
                if (!parseFloat(paymentData.paymentConversionRate) == 0)
                    addedAmount =
                        parseFloat(String(paymentData?.paymentAmount).replace(/,/g, '')) / parseFloat(paymentData.paymentConversionRate);
            }
        } else {
            paymentData.paymentConversionRate = 1;
        }

        preremainingPayment = parseFloat(loanData?.remainingPayment) +
            (parseFloat(String(previousPayment?.paymentAmount).replace(/,/g, '')) +
                parseFloat(previousPayment?.penalityAmount || "0"));

        if (typeof previousPayment?.paymentAmount === 'string') {
            prepayedPayment = parseFloat(loanData?.payedPayment) - parseFloat(previousPayment?.paymentAmount.replace(/,/g, ''));
        } else {
            prepayedPayment = parseFloat(loanData?.payedPayment) - parseFloat(previousPayment?.paymentAmount);
        }
        let statusCheck = "Active", returnPayment = 0;
        if (paymentData.paymentCurrency === loanData?.loanCurrency && preremainingPayment < addedAmount) {
            returnPayment = addedAmount - preremainingPayment;
            addedAmount = preremainingPayment;
            statusCheck = "Completed";
        } else if (paymentData.paymentCurrency !== loanData?.loanCurrency && preremainingPayment < paymentData.paymentConversionAmount) {
            returnPayment = paymentData.paymentConversionAmount - preremainingPayment;
            addedAmount = preremainingPayment;
            paymentData.paymentConversionAmount = preremainingPayment;
            statusCheck = "Completed";
        } else if (preremainingPayment == addedAmount) {
            statusCheck = "Completed";
        }

        const countPreviousPayment = await countPaymentsByLoanId(loanData?.loanId);

        const adjustedCurrentDate = adjustDate(new Date(), loanData?.loanPeriod)
        const generatedPaymentTerm = previousPayment.term;

        const loanInterestRate = parseFloat(loanData?.loanInterestRate);
        const interestPaid =
            parseFloat(paymentData.paymentAmount) *
            (loanInterestRate / 100 / (1 + loanInterestRate / 100));
        const principalPaid =
            parseFloat(paymentData.paymentAmount) / (1 + loanInterestRate / 100);

        if (addedAmount > preremainingPayment) {
            addedAmount = preremainingPayment;
        }

        const newPayedPayment = parseFloat(addedAmount) + prepayedPayment;



        const termFactor = newPayedPayment % parseFloat(loanData?.fixedTermPayment);
        let PredictTerm;
        if (termFactor != 0)
            PredictTerm = Math.ceil(newPayedPayment / parseFloat(loanData?.fixedTermPayment));
        else
            PredictTerm = newPayedPayment / parseFloat(loanData?.fixedTermPayment) + 1;

        let minAmountToPayForTerm, latePayment;
        if (loanData?.loanTerm > generatedPaymentTerm && loanData?.nextPaymentExpirationDate < adjustedCurrentDate) {
            minAmountToPayForTerm = generatedPaymentTerm * loanData?.fixedTermPayment + loanData?.penalityPayment;
            latePayment = loanData?.nextPaymentAmount - newPayedPayment;
        }
        else {
            latePayment = loanData?.loanAmount + loanData?.loanAccrued + loanData?.penalityPayment - newPayedPayment;
            if (generatedPaymentTerm > loanData?.loanTerm) {
                if (statusCheck == "Active")
                    statusCheck = "Late";
                else if (statusCheck = "Completed")
                    statusCheck = "Late Completed"
            }
        }
        let penalityPayment = 0, LateTerm;

        if (latePayment > 0 || paymentData.penalityAmount) {
            LateTerm = Math.ceil((latePayment) / loanData?.fixedTermPayment);
            if (latePayment > 0)
                penalityPayment = latePayment * paymentData.penalityRate / 100;
            else
                penalityPayment = paymentData.penalityAmount
            previousPayment.penalityPayment ?
                await updatePaymentLate(paymentData, previousPayment.paymentId, penalityPayment)
                :
                await addPaymentLate(paymentData, previousPayment.paymentId, penalityPayment);
        }

        const updatedPayment = await updatePaymentByPaymentHashId(paymentData, PredictTerm, principalPaid, interestPaid, approvedBy)

        let addedInterest = parseFloat(previousPayment?.interestPaid);
        if (previousPayment.paymentCurrency !== loanData?.loanCurrency) {

            if (previousPayment.paymentCurrency === "USD") {
                addedInterest =
                    parseFloat(previousPayment.interestPaid) * parseFloat(previousPayment.paymentConversionRate);
            }
            else {
                if (!parseFloat(previousPayment.paymentConversionRate) == 0)
                    addedInterest =
                        parseFloat(previousPayment.interestPaid) / parseFloat(previousPayment.paymentConversionRate);
            }
        }

        preTotalInterestPaid = parseFloat(loanData?.totalInterestPaid) - addedInterest;
        loanData.TotalInterestPaid = preTotalInterestPaid
        const interestPaidAdded =
            parseFloat(addedAmount) *
            (loanInterestRate / 100 / (1 + loanInterestRate / 100));
        await updateLoanInterest(loanData?.loanId, loanData, interestPaidAdded)
        let newRemainingPayment = preremainingPayment - addedAmount + penalityPayment;

        const nextPaymentStatus = getNextPaymentStatus(loanData?.loanStartDate, loanData?.loanTerm, loanData?.loanPeriod, loanData?.loanExpirationDate, newRemainingPayment, newPayedPayment, loanData?.fixedTermPayment, PredictTerm, generatedPaymentTerm)
        await updateLoanPayment(loanData?.loanId, newPayedPayment, newRemainingPayment, penalityPayment, loanData?.penalityPayment, statusCheck, loanData?.latePaymentCount, nextPaymentStatus);
        currentPaymentNo = countPreviousPayment + 1;
        paymentData.nextPaymentStatus = nextPaymentStatus;
        const paymentInformation = {
            currentPaymentNo,
            newRemainingPayment,
            returnPayment
        };

        const token = jwt.sign(
            paymentInformation,
            process.env.SECRETE_KEY,
            {
                expiresIn: "1d",
            }
        );


        return res.status(StatusCodes.CREATED).json({
            status: "OK",
            msg: "Payment updated successfully",
            paymentInformation: token,
        });
    } catch (error) {
        console.error("Error:", error);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Something went wrong" });
    }
}

async function deletePayment(req, res) {
    try {
        const token = await req.headers['x-access-token'];
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Token is missing" });
        }

        const decodedToken = await verifyMyToken(token, process.env.SECRETE_KEY);
        if (!decodedToken) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid token" });
        }
        const deletedPayment = await req.body;
        await deletePaymentByPaymentHashId(deletedPayment);


        return res.status(StatusCodes.CREATED).json({
            response: {
                msg: "Payment deleted successfully",
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Something went wrong" });
    }
}

async function PaymentInfoData(req, res) {
    try {
        const hashId = req.headers['hash-id'];
        const allPaymentInfo = await getAllPaymentInfoByPaymentHashId(hashId);
        const allLoanInfo = await getAllLoanInfoByLoanHashId(allPaymentInfo.loanHashId);

        return res.status(StatusCodes.OK).json({
            response: {
                msg: "Loan detail fetched successfully",
                allLoanInfo,
                allPaymentInfo

            },
        });
    } catch (error) {
        console.error("Error:", error);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Something went wrong" });
    }
}
async function PaymentListData(req, res) {
    try {
        const paymentList = await getPaymentList();


        return res.status(StatusCodes.OK).json({
            response: {
                msg: "Payment List fetched successfully",
                paymentList
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Something went wrong" });
    }
}

module.exports = { addPayment, updatePayment, deletePayment, PaymentInfoData, PaymentListData };
