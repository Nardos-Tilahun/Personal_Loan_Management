const dbConnection = require("../../Config/dbConfig");

async function updateLoanPayment(loanId, newPayedPayment, newRemainingPayment, newPenalityPayment, prePenalityPayment, statusCheck, latePayment, nextPaymentStatus) {
    let totalPenalityPayment = prePenalityPayment;
    if (newPenalityPayment != 0) {
        totalPenalityPayment = newPenalityPayment + prePenalityPayment;
        latePayment++;
    }
    try {
        const updateQuery = `
            UPDATE LoanPayment
            SET PayedPayment = ?,
                RemainingPayment = ?,
                NextPaymentExpirationDate = ?,
                NextPaymentAmount = ?,
                PenalityPayment = ?,
                LatePaymentCount = ?,
                Status = ?
            WHERE LoanID = ?
        `;
        const [result] = await dbConnection.execute(updateQuery, [newPayedPayment, newRemainingPayment, nextPaymentStatus.NextExpirationDate, nextPaymentStatus.NextPaymentAmount, totalPenalityPayment, latePayment, statusCheck, loanId]);
        if (result.affectedRows > 0) {
            return "Loan payment status updated successfully";
        } else {
            throw new Error("Loan payment not found for the provided UserID");
        }
    } catch (error) {
        console.error('Error updating Payed and Remaining Payment:', error);
        throw error;
    }
}
async function updateLoanInterest(loanId, preLoanInterest, newInterest) {
    let newTotalInterestPaid = parseFloat(preLoanInterest?.TotalInterestPaid) + parseFloat(newInterest);
    let newInterestLeft;
    if (newTotalInterestPaid > parseFloat(preLoanInterest?.LoanAccrued)) {
        newTotalInterestPaid = newTotalInterestPaid - parseFloat(preLoanInterest?.LoanAccrued);
        newInterestLeft = 0;
    } else {
        newInterestLeft = parseFloat(preLoanInterest?.LoanAccrued) - newTotalInterestPaid;
    }
    try {
        const updateQuery = `
            UPDATE LoanInterest
            SET TotalInterestPaid = ?,
                InterestLeft = ?
            WHERE LoanID = ?
        `;
        const [result] = await dbConnection.execute(updateQuery, [newTotalInterestPaid, newInterestLeft, loanId]);
        if (result.affectedRows > 0) {
            return "Loan Interest status updated successfully";
        } else {
            throw new Error("Loan Interest not found for the provided loanID");
        }
    } catch (error) {
        console.error('Error updating TotalInterestPaid and InterestLeft: ', error);
        throw error;
    }
}
async function updateLoanLatePayment(loanId, newLatePaymentCount, newPenalityPayment) {
    try {
        const updateQuery = `
            UPDATE LoanPayment
            SET LatePaymentCount = ?,
                PenalityPayment = ?
            WHERE LoanID = ?
        `;
        const [result] = await dbConnection.execute(updateQuery, [newLatePaymentCount, newPenalityPayment, loanId]);
        if (result.affectedRows > 0) {
            return "Loan Late payment status updated successfully";
        } else {
            throw new Error("Loan late payment not found for the provided UserID");
        }
    } catch (error) {
        console.error('Error updating late and penality Payment:', error);
        throw error;
    }
}
function getNextPaymentStatus(loanStartDate, LoanTerm, loanPeriod, loanExpirationDate, remainingPayment, paidPayment, fixedPayment, NextTerm, TodayTerm) {
    let NextExpirationDate = new Date(loanStartDate);
    let NextPaymentAmount;
    if (LoanTerm <= NextTerm) {
        NextExpirationDate = new Date(loanExpirationDate.getTime());
        NextPaymentAmount = remainingPayment;
    }
    else {
        if (NextTerm < TodayTerm) {
            if (loanPeriod === "week") {
                NextExpirationDate.setDate(NextExpirationDate.getDate() + (TodayTerm) * 7);
            } else if (loanPeriod === "month") {
                NextExpirationDate.setMonth(NextExpirationDate.getMonth() + TodayTerm);
            } else if (loanPeriod === "year") {
                NextExpirationDate.setFullYear(NextExpirationDate.getFullYear() + TodayTerm);
            } else if (loanPeriod === "bi-week") {
                NextExpirationDate.setDate(NextExpirationDate.getDate() + TodayTerm * 14);
            } else if (loanPeriod === "half-year") {
                NextExpirationDate.setMonth(NextExpirationDate.getMonth() + TodayTerm * 6);
            }
        } else {
            if (loanPeriod === "week") {
                NextExpirationDate.setDate(NextExpirationDate.getDate() + (NextTerm) * 7);
            } else if (loanPeriod === "month") {
                NextExpirationDate.setMonth(NextExpirationDate.getMonth() + NextTerm);
            } else if (loanPeriod === "year") {
                NextExpirationDate.setFullYear(NextExpirationDate.getFullYear() + NextTerm);
            } else if (loanPeriod === "bi-week") {
                NextExpirationDate.setDate(NextExpirationDate.getDate() + NextTerm * 14);
            } else if (loanPeriod === "half-year") {
                NextExpirationDate.setMonth(NextExpirationDate.getMonth() + NextTerm * 6);
            }
        }
        NextPaymentAmount = NextTerm * fixedPayment - paidPayment;
    }

    const NextPaymentStatus = { NextPaymentAmount, NextExpirationDate }

    return NextPaymentStatus;
}
async function updateLoanByLoanHashId(updateData) {
    const updateQuery = `
        UPDATE LoanDetail LD
        JOIN LoanInfo LI ON LD.LoanID = LI.LoanID
        JOIN UserInfo UI ON LI.UserID = UI.UserID
        JOIN LoanInterest LII ON LI.LoanID = LII.LoanID
        JOIN LoanPayment LP ON LI.LoanID = LP.LoanID
        SET
            LI.LoanAmount = ?,
            LI.LoanCurrency = ?,
            LI.LoanStartDate = ?,
            LD.LoanExpirationDate = ?,
            LD.LoanPeriod = ?,
            LD.LoanTerm = ?,
            LD.Collateral = ?,
            LD.LoanPurpose = ?,
            LII.LoanInterestRate = ?,
            LII.LoanAccrued = ?,
            LP.LoanPaymentMethod = ?,
            LI.GivenBy = (SELECT UserID FROM UserPass WHERE UserHashID = ?)
        WHERE
            LD.LoanHashID = ?;
    `;

    const {
        loanAmount,
        loanCurrency,
        loanStartDate,
        loanExpireDate,
        loanPeriod,
        loanTerm,
        collateral,
        loanPurpose,
        loanInterestRate,
        loanAccrued,
        loanPaymentMethod,
        createdBy,
        loanHashId
    } = updateData;
    const formatDateForMySQL = (date) => {
        const d = new Date(date);
        const pad = (n) => n < 10 ? '0' + n : n;
        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
    };

    const formattedLoanStartDate = formatDateForMySQL(loanStartDate);
    const formattedLoanExpireDate = formatDateForMySQL(loanExpireDate);

    const queryParams = [
        loanAmount,
        loanCurrency,
        formattedLoanStartDate,
        formattedLoanExpireDate,
        loanPeriod,
        loanTerm,
        collateral,
        loanPurpose,
        loanInterestRate,
        loanAccrued,
        loanPaymentMethod,
        createdBy,
        loanHashId
    ];

    try {
        const [result] = await dbConnection.query(updateQuery, queryParams);
        if (result.affectedRows > 0) {
            return { message: "Loan information updated successfully" };
        } else {
            throw new Error("Loan not found or no changes made");
        }
    } catch (error) {
        throw new Error(`Error updating loan: ${error.message}`);
    }
}

module.exports = {
    updateLoanLatePayment,
    updateLoanPayment,
    updateLoanInterest,
    getNextPaymentStatus,
    updateLoanByLoanHashId

};