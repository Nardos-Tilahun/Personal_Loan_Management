const dbConnection = require("../../Config/dbConfig");

async function addPaymentInfo(paymentData, LoanID, paymentTerm, approvedBy) {
    const insertQuery = `INSERT INTO PaymentInfo (PaymentAmount, PaymentCurrency, PaymentConversionRate, PaymentDate, PaymentTerm, ApprovedBy,  LoanID) VALUES (?, ?, ?, NOW(), ?, ?, ?)`;
    const values = [
        paymentData.paymentAmount,
        paymentData.paymentCurrency,
        paymentData.paymentConversionRate,
        paymentTerm,
        approvedBy,
        LoanID,
    ];
    
    try {
        const [result] = await dbConnection.query(insertQuery, values);

        if (result.insertId) {
            return result.insertId;
        } else {
            throw new Error("Failed to add payment information");
        }
    } catch (error) {
        throw new Error("Failed to add payment information");
    }
}
async function addPaymentDetail(paymentData, PaymentID, paymentHashID, nextPaymentTerm, interestPaid, principalPaid) {
    const insertQuery = `INSERT INTO PaymentDetail (PaymentID, PaymentMethod, NextPaymentTerm, InterestPaid, PrincipalPaid, PaymentNote, PaymentHashID) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
        PaymentID,
        paymentData.paymentMethod,
        nextPaymentTerm,
        interestPaid,
        principalPaid,
        paymentData.paymentNote,
        paymentHashID,
    ];
    try {
        const [result] = await dbConnection.query(insertQuery, values);

        if (result.insertId) {
            return result.insertId;
        } else {
            throw new Error("Failed to add payment detail");
        }
    } catch (error) {
        throw new Error("Failed to add payment detail");
    }
}
async function addPaymentLate(paymentData, PaymentID, penalityPayment) {
    const insertQuery = `INSERT INTO PaymentLate (PaymentID, LatePaymentReason, PenalityRate, PenalityPayment) VALUES (?, ?, ?, ?)`;
    const values = [
        PaymentID,
        paymentData.latePaymentReason,
        paymentData.penaltyRate,
        penalityPayment,
    ];
    try {
        const [result] = await dbConnection.query(insertQuery, values);

        if (result.insertId) {
            return result.insertId;
        } else {
            throw new Error("Failed to add payment late information");
        }
    } catch (error) {
        throw new Error("Failed to add payment late information");
    }
}

module.exports = {
    addPaymentInfo,
    addPaymentDetail,
    addPaymentLate,
};
