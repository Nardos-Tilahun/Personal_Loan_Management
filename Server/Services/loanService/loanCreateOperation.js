const dbConnection = require("../../Config/dbConfig");

async function addLoanInfo(loanData, UserID, GivenBy) {
    try {
        const insertQuery = `INSERT INTO LoanInfo (LoanAmount, LoanCurrency, LoanBegin, LoanStartDate, GivenBy, UserID) VALUES (?, ?, NOW(), STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ'), ?, ?)`;
        const values = [loanData.loanAmount, loanData.loanCurrency, loanData.loanStartDate, GivenBy, UserID];
        const [result] = await dbConnection.query(insertQuery, values);

        if (result.insertId) {
            return result.insertId;
        } else {
            throw new Error("Failed to add loan information");
        }
    } catch (error) {
        console.error("Error adding loan information:", error);
        throw new Error(`Failed to add loan information: ${error.message}`);
    }
}
async function addLoanDetail(loanData, loanId, hashedLoanId) {
    const insertQuery = `INSERT INTO LoanDetail (LoanID, LoanPeriod, LoanTerm, Collateral, LoanPurpose, LoanExpirationDate, LoanHashID) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const loanExpirationDate = new Date(loanData.loanExpireDate).toISOString().slice(0, 19).replace('T', ' ');

    const values = [
        loanId,
        loanData.loanPeriod,
        loanData.loanTerm,
        loanData.collateral,
        loanData.loanPurpose,
        loanExpirationDate,
        hashedLoanId,
    ];
    try {
        const [result] = await dbConnection.query(insertQuery, values);

        if (result.insertId) {
            return result.insertId;
        } else {
            throw new Error("Failed to add loan detail");
        }
    } catch (error) {
        console.error("Error adding loan detail:", error);
        throw new Error(`Failed to add loan detail: ${error.message}`);
    }
}
async function addLoanInterest(loanData, loanId, loanAccrued) {
    const insertQuery = `INSERT INTO LoanInterest (LoanID, LoanInterestRate, LoanAccrued, TotalInterestPaid, InterestLeft) VALUES (?, ?, ?, 0, ?)`;
    const values = [
        loanId,
        loanData.loanInterestRate,
        loanAccrued,
        loanAccrued,
    ];
    try {
        const [result] = await dbConnection.query(insertQuery, values);

        if (result.insertId) {
            return result.insertId;
        } else {
            throw new Error("Failed to add loan interest");
        }
    } catch (error) {
        console.error("Error adding loan interest:", error);
        throw new Error(`Failed to add loan interest: ${error.message}`);
    }
}
async function addLoanPayment(loanData, loanId, FixedTermPayment, LastTermPayment, RemainingPayment, NextPaymentStatus) {


    const insertQuery = `INSERT INTO LoanPayment (LoanID, LoanPaymentMethod,
        FixedTermPayment, LastTermPayment, PayedPayment, RemainingPayment, NextPaymentExpirationDate, NextPaymentAmount, LatePaymentCount, PenalityPayment, Status) VALUES (?, ?, ?, ?, 0, ?, ?, ?, 0, 0, ?)`;
    const values = [
        loanId,
        loanData.loanPaymentMethod,
        FixedTermPayment,
        LastTermPayment,
        RemainingPayment,
        NextPaymentStatus?.NextPaymentExpirationDate,
        NextPaymentStatus?.NextPaymentAmount,
        "Pending",
    ];
    try {
        const [result] = await dbConnection.query(insertQuery, values);

        if (result.insertId) {
            return result.insertId;
        } else {
            throw new Error("Failed to add loan payment");
        }
    } catch (error) {
        console.error("Error adding loan payment:", error);
        throw new Error(`Failed to add loan payment: ${error.message}`);
    }
} async function updateLoanPay(loanData, FixedTermPayment, LastTermPayment, RemainingPayment, NextPaymentStatus) {
    const updateQuery = `UPDATE LoanPayment SET 
        LoanPaymentMethod = ?, 
        FixedTermPayment = ?, 
        LastTermPayment = ?, 
        RemainingPayment = ?, 
        NextPaymentExpirationDate = ?, 
        NextPaymentAmount = ?, 
        Status = ? 
        WHERE LoanID = ?`;

    const loanId = await Promise.resolve(loanData.loanId);

    const values = [
        loanData.loanPaymentMethod,
        FixedTermPayment,
        LastTermPayment,
        RemainingPayment,
        NextPaymentStatus?.NextPaymentExpirationDate,
        NextPaymentStatus?.NextPaymentAmount,
        "Pending",
        loanId
    ];

    try {
        const [result] = await dbConnection.query(updateQuery, values);

        if (result.affectedRows) {
            return result.affectedRows;
        } else {
            console.error("No rows affected. Result:", result);
            throw new Error("Failed to update loan payment. No rows affected.");
        }
    } catch (error) {
        console.error("Error updating loan payment:", error);
        throw new Error(`Failed to update loan payment: ${error.message}`);
    }
}
function adjustStartingDate(startingDate, period) {
    const currentDate = new Date(startingDate);
    let adjustedDate;
    switch (period) {
        case "year":
            adjustedDate = new Date(currentDate.getFullYear(), 0, 1);
            break;
        case "month":
            adjustedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            break;
        case "week":
            const dayOfWeek = currentDate.getDay();
            const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            adjustedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - daysUntilMonday);
            break;
        case "day":
            adjustedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
            break;
        case "bi-week":
            adjustedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - (currentDate.getDay() === 0 ? 13 : currentDate.getDay() - 1));
            break;
        case "half-year":
            adjustedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (currentDate.getMonth() % 6), 1);
            break;
        default:
            return null;
    }

    return adjustedDate;
}
function adjustDate(date, period) {
    const currentDate = new Date(date);
    let adjustedDate;
    switch (period) {
        case "year":
            adjustedDate = new Date(currentDate.getFullYear() + 1, 0, 1);
            break;
        case "month":
            adjustedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            break;
        case "week":
            const dayOfWeek = currentDate.getDay();
            const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            adjustedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - daysUntilMonday + 7);
            break;
        case "bi-week":
            adjustedDate = new Date(currentDate);
            const nextMonday = new Date(currentDate);
            nextMonday.setDate(nextMonday.getDate() + (14 - nextMonday.getDay() + 1) % 7);
            adjustedDate.setDate(adjustedDate.getDate() === nextMonday.getDate() ? nextMonday.getDate() + 7 : nextMonday.getDate());
            break;
        case "half-year":
            adjustedDate = new Date(currentDate);
            const currentMonth = adjustedDate.getMonth();
            const currentYear = adjustedDate.getFullYear();
            if (currentMonth < 6) {
                adjustedDate.setFullYear(currentYear, 6, 1);
            } else {
                adjustedDate.setFullYear(currentYear + 1, 0, 1);
            }
            break;
        default:
            return null;
    }
    return adjustedDate;
}
function calculateExpirationDate(loanStartDate, loanPeriod, loanTerm) {
    let expirationDate = new Date(loanStartDate);

    if (loanPeriod === "week") {
        expirationDate.setDate(expirationDate.getDate() + loanTerm * 7);
    } else if (loanPeriod === "month") {
        expirationDate.setMonth(expirationDate.getMonth() + parseInt(loanTerm));
    } else if (loanPeriod === "year") {
        expirationDate.setFullYear(expirationDate.getFullYear() + parseInt(loanTerm));
    } else if (loanPeriod === "bi-week") {
        expirationDate.setDate(expirationDate.getDate() + loanTerm * 14);
    } else if (loanPeriod === "half-year") {
        expirationDate.setMonth(expirationDate.getMonth() + loanTerm * 6);
    }

    return expirationDate;
}
function calculateLoanTerm(loanStartDate, loanExpireDate, loanPeriod) {
    let start = new Date(loanStartDate);
    let end = new Date(loanExpireDate);

    let diffTime = end - start;
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (loanPeriod === "week") {
        return Math.ceil(diffDays / 7);
    } else if (loanPeriod === "month") {
        let diffMonths = (end.getFullYear() - start.getFullYear()) * 12;
        diffMonths -= start.getMonth() + 1;
        diffMonths += end.getMonth() + 1;
        return diffMonths <= 0 ? 0 : diffMonths;
    } else if (loanPeriod === "year") {
        let diffYears = end.getFullYear() - start.getFullYear();
        if (end.getMonth() < start.getMonth() || (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())) {
            diffYears--;
        }
        return diffYears;
    } else if (loanPeriod === "bi-week") {
        return Math.ceil(diffDays / 14);
    } else if (loanPeriod === "half-year") {
        let diffMonths = (end.getFullYear() - start.getFullYear()) * 12;
        diffMonths -= start.getMonth() + 1;
        diffMonths += end.getMonth() + 1;
        return diffMonths <= 0 ? 0 : diffMonths / 6;
    } else {
        return 0;
    }
}
function getNextPaymentStatus(loanData, thisTerm, fixedtermpay) {
    const { loanStartDate, loanPeriod } = loanData
    let NextPaymentExpirationDate = new Date(loanStartDate);
    if (loanPeriod === "week") {
        NextPaymentExpirationDate.setDate(NextPaymentExpirationDate.getDate() + thisTerm * 7);
    } else if (loanPeriod === "month") {
        NextPaymentExpirationDate.setMonth(NextPaymentExpirationDate.getMonth() + thisTerm);
    } else if (loanPeriod === "year") {
        NextPaymentExpirationDate.setFullYear(NextPaymentExpirationDate.getFullYear() + thisTerm);
    } else if (loanPeriod === "bi-week") {
        NextPaymentExpirationDate.setDate(NextPaymentExpirationDate.getDate() + thisTerm * 14);
    } else if (loanPeriod === "half-year") {
        NextPaymentExpirationDate.setMonth(NextPaymentExpirationDate.getMonth() + thisTerm * 6);
    }

    const NextPaymentAmount = thisTerm * fixedtermpay;
    const NextPaymentStatus = {
        NextPaymentAmount, NextPaymentExpirationDate
    }
    return NextPaymentStatus;
}

module.exports = {
    addLoanInfo,
    addLoanDetail,
    addLoanInterest,
    addLoanPayment,
    adjustStartingDate,
    adjustDate,
    calculateExpirationDate,
    calculateLoanTerm,
    getNextPaymentStatus,
    updateLoanPay
};
