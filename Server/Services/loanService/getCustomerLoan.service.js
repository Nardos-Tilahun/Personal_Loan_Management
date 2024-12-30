const dbConnection = require("../../Config/dbConfig");
async function getCustomerLoanData(hashId) {
    const selectQuery = `
                SELECT 
                    LoanDetail.LoanHashID,
                    LoanInfo.LoanAmount,
                    LoanInfo.LoanCurrency,
                    DATE_FORMAT(LoanInfo.LoanBegin, '%M %e, %Y %l:%i %p') AS StartDate,
                    LoanDetail.LoanTerm AS Term,
                    LoanDetail.LoanPeriod AS Period,
                    LoanPayment.Status AS status
                FROM 
                    UserInfo 
                JOIN 
                    UserPass ON UserInfo.UserID = UserPass.UserID
                JOIN 
                    LoanInfo ON UserInfo.UserID = LoanInfo.UserID
                JOIN 
                    LoanDetail ON LoanInfo.LoanID = LoanDetail.LoanID
                LEFT JOIN 
                    LoanPayment ON LoanInfo.LoanID = LoanPayment.LoanID
                WHERE 
                    UserPass.UserHashID = ?;

                        `;
    try {
        const [rows] = await dbConnection.query(selectQuery, [hashId]);
        if (rows.length > 0) {
            return rows;
        } else {
            return [];
        }
    } catch (error) {
        throw error;
    }
}
async function getLoanNextPaymentData(hashId) {
    const selectQuery = `
            WITH RecentLoan AS (
                SELECT
                    DATE_FORMAT(DATE_SUB(LoanPayment.NextPaymentExpirationDate, INTERVAL 1 MICROSECOND), '%W: %b %d, %Y %l:%i %p') AS nextPayDate,
                    FORMAT(LoanPayment.NextPaymentAmount, 2) AS nextPayAmount
                FROM
                    UserPass
                JOIN UserInfo ON UserPass.UserID = UserInfo.UserID
                JOIN LoanInfo ON UserInfo.UserID = LoanInfo.UserID
                JOIN LoanPayment ON LoanInfo.LoanID = LoanPayment.LoanID
                WHERE
                    UserPass.UserHashID = ?
                ORDER BY
                    LoanPayment.NextPaymentExpirationDate ASC
                LIMIT 1
            ),
            TotalRemainingPayments AS (
                SELECT
                    FORMAT(SUM(LoanPayment.RemainingPayment), 2) AS totalRemainingPay
                FROM
                    UserPass
                JOIN
                    UserInfo ON UserPass.UserID = UserInfo.UserID
                JOIN
                    LoanInfo ON UserInfo.UserID = LoanInfo.UserID
                JOIN
                    LoanPayment ON LoanInfo.LoanID = LoanPayment.LoanID
                WHERE
                    UserPass.UserHashID = ?
                GROUP BY
                    LoanInfo.UserID
            ),
            RecentLoanExpiration AS (
                SELECT
                    DATE_FORMAT(DATE_SUB(LoanDetail.LoanExpirationDate, INTERVAL 1 MICROSECOND), '%W: %b %d, %Y %l:%i %p') AS dueDate
                FROM
                    UserPass
                JOIN
                    UserInfo ON UserPass.UserID = UserInfo.UserID
                JOIN
                    LoanInfo ON UserInfo.UserID = LoanInfo.UserID
                JOIN
                    LoanDetail ON LoanInfo.LoanID = LoanDetail.LoanID
                JOIN
                    LoanPayment ON LoanInfo.LoanID = LoanPayment.LoanID
                WHERE
                    UserPass.UserHashID = ?
                ORDER BY
                    LoanDetail.LoanExpirationDate DESC
                LIMIT 1
            )
            SELECT
                RecentLoan.nextPayDate,
                RecentLoan.nextPayAmount,
                TotalRemainingPayments.totalRemainingPay,
                RecentLoanExpiration.dueDate
            FROM
                RecentLoan
            JOIN
                TotalRemainingPayments ON 1=1
            JOIN
                RecentLoanExpiration ON 1=1;


    `;

    try {
        const [rows] = await dbConnection.query(selectQuery, [hashId, hashId, hashId]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return [];
        }
    } catch (error) {
        console.error("An error occurred while fetching loan data:", error);
        throw error;
    }
}

module.exports = {
    getCustomerLoanData,
    getLoanNextPaymentData
};
