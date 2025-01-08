const dbConnection = require("../../Config/dbConfig");
const { getNextPaymentStatus } = require("../loanService/updateLoanOperation");
const { getPaymentTerm } = require("./getPaymentOperation");

async function deletePaymentByPaymentHashId({ hashIds, paymentHashIds: customHashIds }) {
    const ids = Array.isArray(hashIds) ? hashIds : customHashIds || [];

    try {
        for (const hashId of ids) {
            const loanIdQuery = `
                SELECT p.LoanID, p.PaymentID FROM PaymentInfo p
                INNER JOIN PaymentDetail d ON p.PaymentID = d.PaymentID
                WHERE d.PaymentHashID = ?;
            `;
            const [loanIdRows] = await dbConnection.query(loanIdQuery, [hashId]);
            if (loanIdRows.length === 0) {
                continue;
            }
            const loanId = loanIdRows[0].LoanID;
            const paymentId = loanIdRows[0].PaymentID;

            const recentPaymentQuery = `
                SELECT p.PaymentID FROM PaymentInfo p
                INNER JOIN PaymentDetail d ON p.PaymentID = d.PaymentID
                WHERE p.LoanID = ? ORDER BY p.PaymentDate DESC LIMIT 1;
            `;
            const [recentPaymentRows] = await dbConnection.query(recentPaymentQuery, [loanId]);
            const recentPaymentHashId = recentPaymentRows[0].PaymentID;

            if (paymentId !== recentPaymentHashId) {
                continue;
            }

            const allPaymentsQuery = `
                SELECT p.PaymentID, p.PaymentDate, pl.PenalityPayment 
                FROM PaymentInfo p
                LEFT JOIN PaymentLate pl ON p.PaymentID = pl.PaymentID
                WHERE p.LoanID = ? 
                ORDER BY p.PaymentDate DESC;
            `;
            const [allPaymentsRows] = await dbConnection.query(allPaymentsQuery, [loanId]);

            const paymentCount = allPaymentsRows.length;
            let paymentDate, penalityPayment;
            if (paymentCount > 1) {
                paymentDate = allPaymentsRows[1].PaymentDate;
                penalityPayment = parseFloat(allPaymentsRows[1].PenalityPayment)
            } else {
                const loanBeginQuery = `
                    SELECT LoanBegin FROM LoanInfo WHERE LoanID = ?;
                `;
                const [loanBeginRows] = await dbConnection.query(loanBeginQuery, [loanId]);
                paymentDate = loanBeginRows[0].LoanBegin;
                penalityPayment = 0;
            }

            const paymentDetailQuery = `
                SELECT 
                    p.PaymentAmount,
                    p.PaymentDate,
                    p.PaymentCurrency,
                    p.PaymentConversionRate,
                    l.LoanStartDate,
                    l.LoanCurrency,
                    ld.LoanExpirationDate,
                    ld.LoanTerm,
                    ld.LoanPeriod,
                    lp.FixedTermPayment,
                    lp.PayedPayment,
                    lp.RemainingPayment
                FROM PaymentInfo p
                INNER JOIN LoanInfo l ON p.LoanID = l.LoanID
                INNER JOIN LoanDetail ld ON l.LoanID = ld.LoanID
                INNER JOIN LoanPayment lp ON p.LoanID = lp.LoanID
                WHERE p.PaymentID = ?;
            `;
            const [paymentDetailRows] = await dbConnection.query(paymentDetailQuery, [recentPaymentHashId]);
            if (paymentDetailRows.length === 0) {
                continue;
            }
            const loanInterestQuery = `
                SELECT InterestPaid FROM PaymentDetail WHERE PaymentHashID = ?;
            `;
            const [loanInterestRows] = await dbConnection.query(loanInterestQuery, [hashId]);
            let interestPaid = loanInterestRows[0].InterestPaid;


            const paymentDetail = paymentDetailRows[0];
            if (paymentDetail.PaymentCurrency !== paymentDetail?.LoanCurrency) {

                if (paymentDetail.PaymentCurrency === "USD") {
                    paymentDetail.PaymentAmount =
                        parseFloat(paymentDetail.PaymentAmount.replace(/,/g, '')) * parseFloat(paymentDetail.PaymentConversionRate);
                    interestPaid =
                        parseFloat(interestPaid.replace(/,/g, '')) * parseFloat(paymentDetail.PaymentConversionRate);
                }
                else {
                    if (!parseFloat(paymentDetail.PaymentConversionRate) == 0) {
                        paymentDetail.PaymentAmount =
                            parseFloat(paymentDetail.PaymentAmount.replace(/,/g, '')) / parseFloat(paymentDetail.PaymentConversionRate);
                        interestPaid =
                            parseFloat(interestPaid.replace(/,/g, '')) / parseFloat(paymentDetail.PaymentConversionRate);
                    }
                }
            } else {
                paymentDetail.PaymentConversionRate = 1;
            }

            const previousPaymentTerm = getPaymentTerm(paymentDetail.LoanStartDate, paymentDate, paymentDetail.LoanPeriod);

            let predictTerm;
            const newPayedPayment = parseFloat(paymentDetail.PayedPayment) - parseFloat(paymentDetail.PaymentAmount);
            const termFactor = newPayedPayment % parseFloat(paymentDetail?.FixedTermPayment);
            if (termFactor != 0)
                predictTerm = Math.ceil(newPayedPayment / parseFloat(paymentDetail.FixedTermPayment));
            else
                predictTerm = newPayedPayment / parseFloat(paymentDetail.FixedTermPayment) + 1;
            const newRemainingPayment = parseFloat(paymentDetail?.RemainingPayment) + parseFloat(paymentDetail.PaymentAmount) + parseFloat(penalityPayment ? penalityPayment : "0");

            const nextPaymentStatus = getNextPaymentStatus(
                paymentDetail.LoanStartDate,
                paymentDetail.LoanTerm,
                paymentDetail.LoanPeriod,
                paymentDetail.LoanExpirationDate,
                newRemainingPayment,
                newPayedPayment,
                paymentDetail.FixedTermPayment,
                predictTerm,
                previousPaymentTerm
            );
            const updateLoanPaymentQuery = `
                UPDATE LoanPayment 
                SET NextPaymentExpirationDate = ?,
                    NextPaymentAmount = ?,
                    PayedPayment = ?,
                    RemainingPayment = ?
                WHERE LoanID = ?;
            `;
            await dbConnection.query(updateLoanPaymentQuery, [nextPaymentStatus.NextExpirationDate, nextPaymentStatus.NextPaymentAmount, newPayedPayment, newRemainingPayment, loanId]);


            const updateLoanInterestQuery = `
                UPDATE LoanInterest 
                SET TotalInterestPaid = TotalInterestPaid - ?,
                    InterestLeft = InterestLeft + ?
                WHERE LoanID = ?;
            `;
            await dbConnection.query(updateLoanInterestQuery, [interestPaid, interestPaid, loanId]);

            const deletePaymentLateQuery = `
                DELETE FROM PaymentLate WHERE PaymentID = (
                    SELECT PaymentID FROM PaymentDetail WHERE PaymentHashID = ?
                );
            `;
            await dbConnection.query(deletePaymentLateQuery, [hashId]);

            const deletePaymentDetailQuery = `
                DELETE FROM PaymentDetail WHERE PaymentHashID = ?;
            `;
            await dbConnection.query(deletePaymentDetailQuery, [hashId]);

            const deletePaymentInfoQuery = `
                DELETE FROM PaymentInfo WHERE PaymentID = ?;
            `;
            await dbConnection.query(deletePaymentInfoQuery, [paymentId]);
            let statusCheck = "Active";
            if (paymentCount === 1) {
                statusCheck = "Pending"
            }
            const updateLoanPaymentStatusQuery = `
                    UPDATE LoanPayment
                    SET Status = ?
                    WHERE LoanID = ?;
                `;
            await dbConnection.query(updateLoanPaymentStatusQuery, [statusCheck, loanId]);
        }
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

module.exports = {
    deletePaymentByPaymentHashId
};