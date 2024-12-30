const dbConnection = require("../../Config/dbConfig");

async function getLoanInfoByLoanId(loanId) {
    const selectQuery = `
        SELECT 
            LoanInfo.*, 
            UserInfo.Email AS UserEmail,
            UserInfo.FirstName AS firstName,
            UserPayment.IsVerified
        FROM 
            LoanInfo 
        JOIN 
            UserInfo ON LoanInfo.UserID = UserInfo.UserID
        JOIN 
            UserPayment ON LoanInfo.UserID = UserPayment.UserID
        WHERE 
            LoanID = ?
    `;
    try {
        const [rows] = await dbConnection.query(selectQuery, [loanId]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            throw new Error("Loan information not found");
        }
    } catch (error) {
        throw error;
    }
}
async function getLoanDetailByLoanId(loanId) {
    try {
        const selectQuery = `SELECT * FROM LoanDetail WHERE LoanID = ?`;
        const [rows] = await dbConnection.query(selectQuery, [loanId]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            throw new Error("Loan detail not found");
        }
    } catch (error) {
        throw error;
    }
}
async function getLoanDetailByLoanHashId(loanHashId) {
    async function getLoanDetailByLoanHashId(loanHashId) {
        try {
            const selectQuery = `SELECT * FROM LoanDetail WHERE LoanHashID = ?`;
            const [rows] = await dbConnection.query(selectQuery, [loanHashId]);
            if (rows.length > 0) {
                return rows[0];
            } else {
                throw new Error("Loan information not found");
            }
        } catch (error) {
            console.error("Error in getLoanDetailByLoanHashId:", error.message);
            throw error;
        }
    }
}
async function getLoanInterestByLoanId(loanId) {
    try {
        const selectQuery = `SELECT * FROM LoanInterest WHERE LoanID = ?`;
        const [rows] = await dbConnection.query(selectQuery, [loanId]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            throw new Error("Loan interest not found");
        }
    } catch (error) {
        console.error("Error in getLoanInterestByLoanId:", error.message);
        throw error;
    }
}
async function getLoanPaymentByLoanId(loanId) {
    try {
        const selectQuery = `SELECT * FROM LoanPayment WHERE LoanID = ?`;
        const [rows] = await dbConnection.query(selectQuery, [loanId]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            throw new Error("Loan payment not found");
        }
    } catch (error) {
        console.error("Error in getLoanPaymentByLoanId:", error.message);
        throw error;
    }
}
function getLoanAccrued(LoanAmount, LoanInterestRate) {
    try {
        return (LoanAmount * LoanInterestRate) / 100;
    } catch (error) {
        console.error("Error in getLoanAccrued:", error.message);
        throw error; 
    }
}
function getTermPayment(TotalPayment, loanData, fixedTermPayment, LastTermPayment) {
    try {
        let x = 1;
        while (TotalPayment - (fixedTermPayment * (loanData.loanTerm - 1)) > 0) {
            fixedTermPayment = Math.ceil(TotalPayment / loanData.loanTerm / x) * x;
            x *= 10;
        }
        x == 10 ? x : x /= 100;
        fixedTermPayment = Math.ceil(TotalPayment / loanData.loanTerm / x) * x;
        LastTermPayment = TotalPayment - (fixedTermPayment * (loanData.loanTerm - 1));
        return { fixedTermPayment, LastTermPayment }
    } catch (error) {
        console.error("Error in getTermPayment", error.message);
        throw error;
    }
}
async function getAllLoanInfoByLoanHashId(loanHashId) {

    const selectQuery = `
            SELECT
                UI.FirstName AS firstName,
                UI.LastName AS lastName,
                CONCAT(UI.FirstName, ' ', UI.LastName) AS name,
                UI.Email As email,
                FORMAT(LI.LoanAmount, 2, 'en_US') AS loanAmount,
                LI.LoanAmount AS loanAmounted,
                LI.LoanCurrency AS loanCurrency,
                DATE_FORMAT(LI.LoanBegin, '%M %d, %Y') AS loanBegin,
                DATE_FORMAT(LI.LoanBegin, '%M %e, %Y %h:%i %p') AS loanDate,
                DATE_FORMAT(LI.LoanStartDate, '%M %d, %Y') AS loanStartDate,
                DATE_FORMAT(LD.LoanExpirationDate, '%M %d, %Y') AS loanExpirationDate,
                LD.LoanPeriod AS loanPeriod,
                LD.LoanTerm AS loanTerm,
                LD.Collateral AS collateral,
                LD.LoanPurpose AS loanPurpose,
                LII.LoanInterestRate AS loanInterestRate,
                FORMAT(LII.LoanAccrued, 2, 'en_US') AS totalInterest,
                FORMAT(LII.TotalInterestPaid, 2, 'en_US') AS totalInterestPaid,
                FORMAT(LII.InterestLeft, 2, 'en_US') AS interestLeft,
                LP.LoanPaymentMethod AS loanPaymentMethod,
                FORMAT(LP.FixedTermPayment, 2, 'en_US') AS fixedTermPayment,
                FORMAT(LP.LastTermPayment, 2, 'en_US') AS lastTermPayment,
                FORMAT(LP.PayedPayment, 2, 'en_US') AS payedPayment,
                FORMAT(LP.RemainingPayment, 2, 'en_US') AS remainingPayment,
                LP.LatePaymentCount AS latePaymentCount,
                FORMAT(LP.PenalityPayment, 2, 'en_US') AS penalityPayment,
                DATE_FORMAT(LP.NextPaymentExpirationDate, '%M %d, %Y') AS nextPaymentExpirationDate,
                FORMAT(LP.NextPaymentAmount, 2, 'en_US') AS nextPaymentAmount,
                LP.NextPaymentAmount AS nextPayment,
                LD.LoanHashID,
                LP.status,
                CASE
                    WHEN CURDATE() <= LP.NextPaymentExpirationDate THEN FALSE
                    ELSE TRUE
                END AS isLate
            FROM
                LoanDetail LD
            JOIN
                LoanInfo LI ON LD.LoanID = LI.LoanID
            JOIN
                UserInfo UI ON LI.UserID = UI.UserID
            JOIN
                LoanInterest LII ON LI.LoanID = LII.LoanID
            JOIN
                LoanPayment LP ON LI.LoanID = LP.LoanID
            WHERE
                LD.LoanHashID = ?;
    `;
    try {
        const [data] = await dbConnection.query(selectQuery, [loanHashId]);

        if (data.length > 0) {
            return data;
        } else {
            throw new Error("Loan payment not found");
        }
    } catch (error) {
        console.error("Error in getAllLoanInfoByLoanHashId:", error.message);
        throw error;
    }
}
async function getLoanByLoanHashId(loanHashId) {

    const selectQuery = `
            SELECT
                LI.LoanID As loanId,
                LI.LoanAmount AS loanAmount,
                LI.LoanCurrency AS loanCurrency,
                LI.LoanBegin AS loanBegin,
                LI.LoanStartDate AS loanStartDate,
                LD.LoanExpirationDate AS loanExpirationDate,
                LD.LoanPeriod AS loanPeriod,
                LD.LoanTerm AS loanTerm,
                LD.Collateral AS collateral,
                LD.LoanPurpose AS loanPurpose,
                LII.LoanInterestRate AS loanInterestRate,
                LII.LoanAccrued AS totalInterest,
                LII.TotalInterestPaid AS totalInterestPaid,
                LII.InterestLeft AS interestLeft,
                LP.LoanPaymentMethod AS loanPaymentMethod,
                LP.FixedTermPayment AS fixedTermPayment,
                LP.LastTermPayment AS lastTermPayment,
                LP.PayedPayment AS payedPayment,
                LP.RemainingPayment AS remainingPayment,
                LP.LatePaymentCount AS latePaymentCount,
                LP.PenalityPayment AS penalityPayment,
                LP.NextPaymentExpirationDate AS nextPaymentExpirationDate,
                LP.NextPaymentAmount AS nextPaymentAmount,
                LP.status
            FROM
                LoanDetail LD
            JOIN
                LoanInfo LI ON LD.LoanID = LI.LoanID
            JOIN
                UserInfo UI ON LI.UserID = UI.UserID
            JOIN
                LoanInterest LII ON LI.LoanID = LII.LoanID
            JOIN
                LoanPayment LP ON LI.LoanID = LP.LoanID
            WHERE
                LD.LoanHashID = ?;
    `;
    try {
        const [data] = await dbConnection.query(selectQuery, [loanHashId]);

        if (data.length > 0) {
            return data[0];
        } else {
            throw new Error("Loan payment not found");
        }
    } catch (error) {
        console.error("Error in getLoanByLoanHashId:", error.message);
        throw error;
    }
}
async function getLoanIdByLoanHashId(loanHashId) {
    try {
        const selectQuery = `SELECT LoanID FROM LoanDetail WHERE LoanHashID = ?;`;
        const [rows] = await dbConnection.query(selectQuery, [loanHashId]);
        if (rows.length > 0) {
            return rows[0].LoanID;
        } else {
            throw new Error("Loan Detail not found");
        }
    } catch (error) {
        console.error("Error in getLoanIdByLoanHashId:", error.message);
        throw error;
    }
}
async function getLoanList() {
    try {
        const loanListQuery = `
            SELECT
                CONCAT_WS(' ', UI.FirstName, UI.LastName) AS fullName,
                DATE_FORMAT(LI.LoanBegin, '%M %e, %Y %l:%i %p') AS loanGivenDate,
                LP.Status AS status,
                LI.LoanCurrency AS currency,
                LI.LoanAmount AS amount,
                LD.LoanHashID AS hashId
            FROM
                LoanInfo LI
            INNER JOIN
                UserInfo UI ON LI.UserID = UI.UserID
            LEFT JOIN
                LoanPayment LP ON LI.LoanID = LP.LoanID
            LEFT JOIN
                LoanDetail LD ON LI.LoanID = LD.LoanID
            LEFT JOIN
                UserPayment UP ON UI.UserID = UP.UserID
            WHERE
                UI.UserID NOT IN (SELECT UserID FROM UserInfo WHERE IsDelete IS NOT NULL)
                AND (UP.IsDelete IS NULL OR UP.IsDelete = 0)
            ORDER BY
                LI.LoanBegin DESC;

        `;
        const [result] = await dbConnection.query(loanListQuery);
        return result;
    } catch (error) {
        console.error("Error in retrieving loan list:", error);
        throw error;
    }
}
async function getLoanListForPayment() {
    try {
        const loanListQuery = `
            SELECT 
                CONCAT(ui.FirstName, ' ', ui.LastName) AS name,
                ui.Email AS email,
                DATE_FORMAT(li.LoanBegin, '%M %e, %Y %h:%i %p') AS loanDate,
                li.LoanAmount AS loanAmounted,
                li.LoanCurrency AS loanCurrency,
                lp.NextPaymentAmount AS nextPayment,
                ld.LoanHashID,
                CASE
                    WHEN CURDATE() <= lp.NextPaymentExpirationDate THEN FALSE
                    ELSE TRUE
                END AS isLate
            FROM LoanInfo li
            JOIN UserInfo ui ON li.UserID = ui.UserID
            JOIN LoanPayment lp ON li.LoanID = lp.LoanID
            JOIN LoanDetail ld ON li.LoanID = ld.LoanID
            JOIN UserPayment up ON ui.UserID = up.UserID
            WHERE (up.IsDelete IS NULL OR up.IsDelete = 0)
            AND up.IsActive = TRUE
            AND lp.Status IN ('Active', 'Pending', 'Late');

        `;
        const [result] = await dbConnection.query(loanListQuery);
        return result;
    } catch (error) {
        console.error("Error in retrieving loan list:", error);
        throw error;
    }
}

module.exports = {
    getLoanInfoByLoanId,
    getLoanDetailByLoanId,
    getLoanDetailByLoanHashId,
    getLoanInterestByLoanId,
    getLoanPaymentByLoanId,
    getLoanAccrued,
    getTermPayment,
    getAllLoanInfoByLoanHashId,
    getLoanByLoanHashId,
    getLoanIdByLoanHashId,
    getLoanList,
    getLoanListForPayment
};
