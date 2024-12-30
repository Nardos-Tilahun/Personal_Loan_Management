const { StatusCodes } = require("http-status-codes");

const jwt = require("jsonwebtoken");
const {
    addLoanInfo,
    addLoanDetail,
    addLoanInterest,
    addLoanPayment,
    getNextPaymentStatus,
    updateLoanPay,
} = require("../Services/loanService/loanCreateOperation");
const {
    updateUserPaymentStatus,
} = require("../Services/userService/updateUserOperation");
const {
    getLoanAccrued,
    getTermPayment,
    getLoanIdByLoanHashId,
    getAllLoanInfoByLoanHashId,
    getLoanList,
    getLoanListForPayment,
} = require("../Services/loanService/getLoanOperation");
const {
    getUserByEmail,
    getUserPassByUserId,
    getUserByUserHashId
} = require("../Services/userService/getUserOperation");
const { hashIdForRoute, sendNotificationForAddLoan } = require("../Services/userService/userCreateOperation");
const { getAllPaymentInfoByLoanHashId } = require("../Services/paymentService/getPaymentOperation");
const { updateLoanByLoanHashId } = require("../Services/loanService/updateLoanOperation");
const { deleteLoanByLoanHashId } = require("../Services/loanService/deleteLoanOperation");
const { verifyMyToken } = require("../Utilities/tokenVerifcation");

async function addLoan(req, res) {
    try {
        const loanData = await req.body.data[0].loan;
        const UserInfo = await getUserByEmail(loanData.userEmail);
        const UserID = UserInfo[0].UserID;
        const givenUser = await getUserByUserHashId(loanData.createdBy);
        const givenBy = givenUser[0].UserID;
        const loanIdCreated = await addLoanInfo(loanData, UserID, givenBy);
        const hashedLoanId = hashIdForRoute(loanIdCreated.toString(), 25);
        await addLoanDetail(loanData, loanIdCreated, hashedLoanId);
        const loanAccrued = getLoanAccrued(
            loanData.loanAmount,
            loanData.loanInterestRate
        );
        await addLoanInterest(loanData, loanIdCreated, loanAccrued);
        const TotalPayment = loanData.loanAmount + loanAccrued;
        const remainingPayment = TotalPayment;
        const fixedTermPay = Math.ceil(TotalPayment / loanData.loanTerm);
        let LastTermPay;
        let fixedPayment = {};

        if (loanData.loanTerm > 1) {
            LastTermPay = TotalPayment - (fixedTermPay * (loanData.loanTerm - 1));
            fixedPayment = getTermPayment(TotalPayment, loanData, fixedTermPay, LastTermPay)
        }
        else {
            fixedPayment["fixedTermPayment"] = fixedTermPay;
            fixedPayment["LastTermPayment"] = 0;
        }

        const fixedTermPayment = fixedPayment["fixedTermPayment"];
        const LastTermPayment = fixedPayment["LastTermPayment"];



        const NextPaymentStatus = getNextPaymentStatus(loanData, 1, fixedTermPayment)
        await addLoanPayment(loanData, loanIdCreated, fixedTermPayment, LastTermPayment, remainingPayment, NextPaymentStatus);
        await updateUserPaymentStatus(UserID, true);

        const userHashId = await getUserPassByUserId(UserID);
        loanData.NextPaymentStatus = NextPaymentStatus;
        loanData.firstName = UserInfo[0].FirstName
        if (UserInfo[0].IsVerified) {
            await sendNotificationForAddLoan(loanData);
        }
        const loanInformation = {
            hashedLoanId,
            userHashId,
        };

        const token = jwt.sign(
            loanInformation,
            process.env.SECRETE_KEY,
            {
                expiresIn: "1d",
            }
        );

        return res.status(StatusCodes.CREATED).json({
            response: {
                status: "OK",
                msg: "Loan created successfully",
                hashedLoanId,
                loanInformation: token,
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Something went wrong" });
    }
}
async function updateLoan(req, res) {
    try {
        const loanData = await req.body.data[0].loan;
        const UserInfo = await getUserByEmail(loanData.userEmail);
        const UserID = UserInfo[0].UserID;
        const givenUser = await getUserByUserHashId(loanData.createdBy);
        loanData.loanId = getLoanIdByLoanHashId(loanData.loanHashId)
        const givenBy = givenUser[0].UserID;

        loanData.loanAccrued = (loanData.loanAmount * loanData.loanInterestRate) / 100;
        const message = await updateLoanByLoanHashId(loanData);

        const TotalPayment = loanData.loanAmount + loanData.loanAccrued;
        const remainingPayment = TotalPayment;
        const fixedTermPay = Math.ceil(TotalPayment / loanData.loanTerm);
        let LastTermPay;
        let fixedPayment = {};

        if (loanData.loanTerm > 1) {
            LastTermPay = TotalPayment - (fixedTermPay * (loanData.loanTerm - 1));
            fixedPayment = getTermPayment(TotalPayment, loanData, fixedTermPay, LastTermPay)
        }
        else {
            fixedPayment["fixedTermPayment"] = fixedTermPay;
            fixedPayment["LastTermPayment"] = 0;
        }

        const fixedTermPayment = fixedPayment["fixedTermPayment"];
        const LastTermPayment = fixedPayment["LastTermPayment"];


        const NextPaymentStatus = getNextPaymentStatus(loanData, 1, fixedTermPayment)
        await updateLoanPay(loanData, fixedTermPayment, LastTermPayment, remainingPayment, NextPaymentStatus);
        await updateUserPaymentStatus(UserID, true);

        await getUserPassByUserId(UserID);

        const loanInformation = {
            loanData
        };

        const token = jwt.sign(
            loanInformation,
            process.env.SECRETE_KEY,
            {
                expiresIn: "1d",
            }
        );

        return res.status(StatusCodes.CREATED).json({
            response: {
                status: "OK",
                msg: "Loan updated successfully",
                loanInformation: token,
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Something went wrong" });
    }
}
async function deleteLoan(req, res) {
    try {
        const token = await req.headers['x-access-token'];
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Token is missing" });
        }

        const decodedToken = await verifyMyToken(token, process.env.SECRETE_KEY);
        if (!decodedToken) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid token" });
        }
        const deletedLoan = await req.body;
        await deleteLoanByLoanHashId(deletedLoan);


        return res.status(StatusCodes.CREATED).json({
            response: {
                msg: "Loan deleted successfully",
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Something went wrong" });
    }
}

async function LoanInfoData(req, res) {
    try {

        const hashId = req.headers['hash-id'];
        const loanList = await getAllLoanInfoByLoanHashId(hashId);

        const allPaymentInfo = await getAllPaymentInfoByLoanHashId(hashId);


        return res.status(StatusCodes.OK).json({
            response: {
                msg: "Loan detail fetched successfully",
                loanList,
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
async function LoanListData(req, res) {
    try {
        const loanList = await getLoanList();


        return res.status(StatusCodes.OK).json({
            response: {
                msg: "Loan list fetched successfully",
                loanList
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Something went wrong" });
    }
}
async function LoanListDataForPayment(req, res) {
    try {
        const loanList = await getLoanListForPayment();


        return res.status(StatusCodes.OK).json({
            response: {
                msg: "Loan list fetched successfully",
                loanList
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Something went wrong" });
    }
}




module.exports = { addLoan, updateLoan, deleteLoan, LoanInfoData, LoanListData, LoanListDataForPayment };
