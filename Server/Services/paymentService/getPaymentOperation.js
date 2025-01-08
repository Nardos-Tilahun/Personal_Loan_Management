const dbConnection = require("../../Config/dbConfig");
async function getPaymentInfoByLoanId(loanId) {
    try {
        const selectQuery = `SELECT * FROM PaymentInfo WHERE LoanID = ?`;
        const [rows] = await dbConnection.query(selectQuery, [loanId]);
        if (rows.length > 0) {
            return rows;
        } else {
            throw new Error("Payment information not found for the specified loan");
        }
    } catch (error) {
        throw new Error("Failed to fetch payment information: " + error.message);
    }
}
async function getPaymentDetailByLoanId(loanId) {
    try {
        const selectQuery = `SELECT pd.* FROM PaymentDetail pd INNER JOIN PaymentInfo pi ON pd.PaymentID = pi.PaymentID WHERE pi.LoanID = ?`;
        const [rows] = await dbConnection.query(selectQuery, [loanId]);
        if (rows.length > 0) {
            return rows;
        } else {
            throw new Error("Payment details not found for the specified loan");
        }
    } catch (error) {
        throw new Error("Failed to fetch payment details: " + error.message);
    }
}
async function getPaymentLateByLoanId(loanId) {
    async function getPaymentLateByLoanId(loanId) {
        try {
            const selectQuery = `SELECT pl.* FROM PaymentLate pl INNER JOIN PaymentInfo pi ON pl.PaymentID = pi.PaymentID WHERE pi.LoanID = ?`;
            const [rows] = await dbConnection.query(selectQuery, [loanId]);
            if (rows.length > 0) {
                return rows;
            } else {
                throw new Error(
                    "Late payment information not found for the specified loan"
                );
            }
        } catch (error) {
            throw new Error("Failed to fetch late payment information: " + error.message);
        }
    }
}
async function getPaymentInfoByPaymentId(paymentId) {
    try {
        const selectQuery = `SELECT * FROM PaymentInfo WHERE PaymentID = ?`;
        const [rows] = await dbConnection.query(selectQuery, [paymentId]);
        if (rows.length > 0) {
            return rows;
        } else {
            throw new Error(
                "Payment information not found for the specified payment"
            );
        }
    } catch (error) {
        throw new Error("Failed to fetch payment information: " + error.message);
    }
}
async function getPaymentDetailByPaymentId(paymentId) {
    try {
        const selectQuery = `SELECT * FROM PaymentDetail WHERE PaymentID = ?`;
        const [rows] = await dbConnection.query(selectQuery, [paymentId]);
        if (rows.length > 0) {
            return rows;
        } else {
            return 0;
        }
    } catch (error) {
        throw new Error("Failed to fetch payment details: " + error.message);
    }
}
async function getPaymentLateByPaymentId(paymentId) {
    try {
        const selectQuery = `SELECT * FROM PaymentLate WHERE PaymentID = ?`;
        const [rows] = await dbConnection.query(selectQuery, [paymentId]);
        if (rows.length > 0) {
            return rows;
        } else {
            throw new Error(
                "Late payment information not found for the specified payment"
            );
        }
    } catch (error) {
        throw new Error("Failed to fetch late payment information: " + error.message);
    }
}
function getPaymentTerm(startDate, endDate, period) {

    const startingDate = new Date(startDate);
    const expiredDate = new Date(endDate);

    function isValidDate(date) {
        return date instanceof Date && !isNaN(date);
    }

    if (!isValidDate(startingDate) || !isValidDate(expiredDate)) {
        throw new Error("Invalid date provided.");
    }

    if (startingDate > expiredDate) {
        return 1;
    }
    const currentPaymentTerm =
        period === "year"
            ? expiredDate.getFullYear() - startingDate.getFullYear()
            : period === "month"
                ? expiredDate.getMonth() -
                startingDate.getMonth() +
                12 * (expiredDate.getFullYear() - startingDate.getFullYear())
                : period === "week"
                    ? Math.floor(
                        (expiredDate - startingDate) / (1000 * 60 * 60 * 24 * 7)
                    )
                    : 1;

    return currentPaymentTerm;
}
async function countPaymentsByLoanId(loanId) {
    try {
        const selectQuery = `
            SELECT COUNT(PaymentID) AS TotalPayments
            FROM PaymentInfo
            WHERE LoanID = ?;
        `;
        const [rows] = await dbConnection.query(selectQuery, [loanId]);
        if (rows.length > 0) {
            return rows[0].TotalPayments;
        } else {
            throw new Error("Failed to count payments for the specified LoanID.");
        }
    } catch (error) {
        throw new Error("Failed to count payments: " + error.message);
    }
}
async function getLastPaymentIdByLoanId(loanId) {
    try {
        const selectQuery = `
            SELECT PaymentID
            FROM PaymentInfo
            WHERE LoanID = ?
            ORDER BY PaymentDate DESC
            LIMIT 1;
        `;
        const [rows] = await dbConnection.query(selectQuery, [loanId]);
        if (rows.length > 0) {
            return rows[0].PaymentID;
        } else {
            return null;
        }
    } catch (error) {
        throw new Error("Failed to get last payment ID: " + error.message);
    }
}
function getPredictedTerm(newPayedPayment, termPayment) {
    Term = newPayedPayment / termPayment + 1;
    if (rows.length > 0) {
        return rows[0].PaymentID;
    } else {
        return null;
    }
}
async function getAllPaymentInfoByLoanHashId(loanHashId) {
    const selectQuery = `
        SELECT
            PD.PaymentHashID,
            PI.PaymentAmount,
            PI.PaymentCurrency,
            DATE_FORMAT(PI.PaymentDate, '%M %d, %Y %h:%i %p') AS PaymentDate,
            PD.PaymentMethod,
            PI.PaymentTerm AS Term,
            CASE
                WHEN PL.PaymentLateID IS NOT NULL THEN 'Late'
                ELSE 'OnTime'
            END AS Status,
            PD.NextPaymentTerm,
            PD.InterestPaid,
            PD.PrincipalPaid,
            PD.PaymentHashID,
            PD.PaymentNote,
            CASE
                WHEN PL.PaymentLateID IS NOT NULL THEN true
                ELSE false
            END AS IsLate,
            PL.LatePaymentReason,
            PL.PenalityRate,
            PL.PenalityPayment,
            CASE
                WHEN PI.PaymentDate = (
                    SELECT MAX(PaymentDate)
                    FROM PaymentInfo
                    WHERE LoanID = LI.LoanID
                ) THEN 'Recent'
                ELSE 'Not Recent'
            END AS isRecent
        FROM
            PaymentDetail PD
        JOIN
            PaymentInfo PI ON PD.PaymentID = PI.PaymentID
        LEFT JOIN
            PaymentLate PL ON PD.PaymentID = PL.PaymentID
        JOIN
            LoanInfo LI ON PI.LoanID = LI.LoanID
        JOIN
            LoanDetail LD ON LI.LoanID = LD.LoanID
        WHERE
            LD.LoanHashID = ?
        ORDER BY
            PI.PaymentDate DESC;

    `;
    try {
        const [rows] = await dbConnection.query(selectQuery, [loanHashId]);

        if (rows.length > 0) {
            return rows;
        } else {
            return null;
        }
    } catch (error) {
        throw new Error("Failed to fetch payment information: " + error.message);
    }
}
async function getAllPaymentInfoByPaymentHashId(paymentHashId) {
    try {
        const selectQuery = `
            SELECT
                PI.PaymentID AS paymentId,
                PD.PaymentHashID AS paymentHashId,
                FORMAT(PI.PaymentAmount, 2, 'en_US') AS paymentAmount,
                PI.PaymentCurrency AS paymentCurrency,
                PI.PaymentConversionRate AS paymentConversionRate,
                DATE_FORMAT(PI.PaymentDate, '%M %e, %Y %l:%i%p') AS paymentDate,
                PD.PaymentMethod AS paymentMethod,
                CASE LD.LoanPeriod
                    WHEN 'week' THEN DATEDIFF(PI.PaymentDate, LI.LoanStartDate) DIV 7 + 1
                    WHEN 'bi-week' THEN (DATEDIFF(PI.PaymentDate, LI.LoanStartDate) DIV 14) + 1
                    WHEN 'month' THEN TIMESTAMPDIFF(MONTH, LI.LoanStartDate, PI.PaymentDate) + 1
                    WHEN 'half-year' THEN TIMESTAMPDIFF(MONTH, LI.LoanStartDate, PI.PaymentDate) DIV 6 + 1
                    WHEN 'year' THEN TIMESTAMPDIFF(YEAR, LI.LoanStartDate, PI.PaymentDate) + 1
                END AS term,
                LP.Status AS status,
                PD.NextPaymentTerm AS nextPaymentTerm,
                LP.NextPaymentAmount AS nextPaymentAmount,
                LP.NextPaymentExpirationDate AS nextPaymentExpirationDate,
                PD.InterestPaid AS interestPaid,
                PD.PrincipalPaid AS principalPaid,
                PD.PaymentNote AS paymentNote,
                CASE
                    WHEN PL.PaymentLateID IS NOT NULL THEN 1
                    ELSE 0
                END AS IsLate,
                PL.LatePaymentReason AS latePaymentReason,
                PL.PenalityRate AS penalityRate,
                PL.PenalityPayment AS penalityPayment,
                LD.LoanHashID AS loanHashId,
                LI.LoanAmount AS loanAmount,  
                LI.LoanCurrency AS loanCurrency,
                CONCAT(UI.FirstName, ' ', UI.LastName) AS fullName 
            FROM
                PaymentDetail PD
            JOIN
                PaymentInfo PI ON PD.PaymentID = PI.PaymentID
            LEFT JOIN
                LoanInfo LI ON PI.LoanID = LI.LoanID
            LEFT JOIN
                LoanDetail LD ON LI.LoanID = LD.LoanID
            LEFT JOIN
                LoanPayment LP ON LI.LoanID = LP.LoanID
            LEFT JOIN
                PaymentLate PL ON PD.PaymentID = PL.PaymentID
            LEFT JOIN
                UserInfo UI ON LI.UserID = UI.UserID
            WHERE
                PD.PaymentHashID = ?;
        `;
        const [data] = await dbConnection.query(selectQuery, [paymentHashId]);

        if (data.length > 0) {
            return data[0];
        } else {
            throw new Error("All payment not found");
        }
    } catch (error) {
        console.error("Error occurred while fetching payment info:", error);
        throw error;
    }
}
async function getPaymentList() {

    try {
        const paymentsQuery = `
            SELECT
                CONCAT('P', PI.PaymentID) AS id,
                CONCAT_WS(' ', UI.FirstName, UI.LastName) AS fullName,
                DATE_FORMAT(PI.PaymentDate, '%M %e, %Y %l:%i %p') AS receivedDate,
                CASE
                    WHEN PL.PaymentLateID IS NOT NULL THEN 'Late'
                    ELSE 'On Time'
                END AS status,
                PI.PaymentCurrency AS currency,
                PI.PaymentAmount AS amount,
                PD.PaymentHashID AS hashId,
                CASE
                    WHEN PI.PaymentDate = (
                        SELECT MAX(PaymentDate)
                        FROM PaymentInfo
                        WHERE LoanID = LI.LoanID
                    ) THEN 'Recent'
                    ELSE 'Not Recent'
                END AS isRecent
            FROM
                PaymentInfo PI
            INNER JOIN
                LoanInfo LI ON PI.LoanID = LI.LoanID
            INNER JOIN
                UserInfo UI ON LI.UserID = UI.UserID
            LEFT JOIN
                PaymentLate PL ON PI.PaymentID = PL.PaymentID
            LEFT JOIN
                PaymentDetail PD ON PI.PaymentID = PD.PaymentID
            LEFT JOIN
                UserPayment UP ON UI.UserID = UP.UserID
            WHERE
                UI.UserID NOT IN (SELECT UserID FROM UserInfo WHERE IsDelete IS NOT NULL)
                AND (UP.IsDelete IS NULL OR UP.IsDelete = 0)
            ORDER BY
                PI.PaymentDate DESC;
        `;
        const [result] = await dbConnection.query(paymentsQuery);
        return result;
    } catch (error) {
        console.error("Error in retrieving payments:", error);
        throw error;
    }
}
async function checkRecentPayment(loanId, paymentId) {

    try {
        const recentPaymentQuery = `
            SELECT p.PaymentID FROM PaymentInfo p
            INNER JOIN PaymentDetail d ON p.PaymentID = d.PaymentID
            WHERE p.LoanID = ? ORDER BY p.PaymentDate DESC LIMIT 1;
        `;
        const [recentPaymentRows] = await dbConnection.query(recentPaymentQuery, [loanId]);
        const recentPaymentHashId = recentPaymentRows[0].PaymentID;

        if (paymentId !== recentPaymentHashId) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error("Error occurred while checking recent payment:", error);
        throw error;
    }
}

module.exports = {
    getPaymentInfoByLoanId,
    getPaymentDetailByLoanId,
    getPaymentLateByLoanId,
    getPaymentInfoByPaymentId,
    getPaymentDetailByPaymentId,
    getPaymentLateByPaymentId,
    getPaymentTerm,
    countPaymentsByLoanId,
    getLastPaymentIdByLoanId,
    getPredictedTerm,
    getAllPaymentInfoByLoanHashId,
    getAllPaymentInfoByPaymentHashId,
    getPaymentList,
    checkRecentPayment
};
