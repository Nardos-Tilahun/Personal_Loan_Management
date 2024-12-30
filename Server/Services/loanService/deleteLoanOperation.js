const dbConnection = require("../../Config/dbConfig");

async function deleteLoanByLoanHashId({ hashIds, loanHashIds: customHashIds }) {
    const ids = Array.isArray(hashIds) ? hashIds : customHashIds || [];
    try {

        for (const hashId of ids) {
            const loanIdQuery = `
                SELECT LoanID FROM LoanDetail WHERE LoanHashID = ?;
            `;
            const [loanIdRows] = await dbConnection.query(loanIdQuery, [hashId]);
            if (loanIdRows.length === 0) {
                continue; 
            }
            const loanId = loanIdRows[0].LoanID;

            const paymentCheckQuery = `
                SELECT COUNT(*) AS paymentCount
                FROM PaymentInfo 
                WHERE LoanID = ?;
            `;
            const [paymentCountRows] = await dbConnection.query(paymentCheckQuery, [loanId]);
            const paymentCount = paymentCountRows[0].paymentCount;

            if (paymentCount > 0) {
                continue;
            }

            const userIdQuery = `
                SELECT UserID FROM LoanInfo WHERE LoanID = ?;
            `;
            const [userIdRows] = await dbConnection.query(userIdQuery, [loanId]);
            const userId = userIdRows[0].UserID;

            const deleteLoanInterestQuery = `
                DELETE FROM LoanInterest WHERE LoanID = ?;
            `;
            await dbConnection.query(deleteLoanInterestQuery, [loanId]);

            const deleteLoanPaymentQuery = `
                DELETE FROM LoanPayment WHERE LoanID = ?;
            `;
            await dbConnection.query(deleteLoanPaymentQuery, [loanId]);

            const deleteLoanDetailQuery = `
                DELETE FROM LoanDetail WHERE LoanHashID = ?;
            `;
            await dbConnection.query(deleteLoanDetailQuery, [hashId]);

            const deleteLoanQuery = `
                DELETE FROM LoanInfo WHERE LoanID = ?;
            `;
            await dbConnection.query(deleteLoanQuery, [loanId]);

            const remainingLoansQuery = `
                SELECT COUNT(*) AS remainingLoans
                FROM LoanInfo 
                WHERE UserID = ?;
            `;
            const [remainingLoansRows] = await dbConnection.query(remainingLoansQuery, [userId]);
            const remainingLoans = remainingLoansRows[0].remainingLoans;

            if (remainingLoans === 0) {
                const updateUserStatusQuery = `
                    UPDATE UserPayment 
                    SET IsActive = false 
                    WHERE UserID = ?;
                `;
                await dbConnection.query(updateUserStatusQuery, [userId]);
            }
        }
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}








module.exports = {
    deleteLoanByLoanHashId

};