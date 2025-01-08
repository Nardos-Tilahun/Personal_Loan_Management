const dbConnection = require("../../Config/dbConfig");

async function updatePaymentByPaymentHashId(payment, PredictTerm, principalPaid, interestPaid, approvedBy) {
    try {

        const selectPaymentIdQuery = `
            SELECT p.PaymentID
            FROM PaymentInfo p
            JOIN PaymentDetail pd ON p.PaymentID = pd.PaymentID
            WHERE pd.PaymentHashID = ?;
        `;

        const [paymentIdRow] = await dbConnection.query(selectPaymentIdQuery, [payment.paymentHashId]);
        if (!paymentIdRow || !paymentIdRow.length) {
            throw new Error('Payment not found');
        }
        const paymentId = paymentIdRow[0].PaymentID;


        const updatePaymentInfoQuery = `
            UPDATE PaymentInfo
            SET PaymentAmount = ?,
                PaymentCurrency = ?,
                PaymentConversionRate = ?,
                ApprovedBy = ?
            WHERE PaymentID = ?;
        `;


        const updatePaymentDetailQuery = `
            UPDATE PaymentDetail
            SET PaymentMethod = ?,
                NextPaymentTerm = ?,
                InterestPaid = ?,
                PrincipalPaid = ?,
                PaymentNote = ?
            WHERE PaymentHashID = ?;
        `;

        const valuesInfo = [
            payment.paymentAmount,
            payment.paymentCurrency,
            payment.paymentConversionRate ? payment.paymentConversionRate : 1.00,
            approvedBy,
            paymentId
        ];

        const valuesDetail = [
            payment.paymentMethod,
            PredictTerm,
            interestPaid,
            principalPaid,
            payment.paymentNote,
            payment.paymentHashId
        ];


        await Promise.all([
            dbConnection.query(updatePaymentInfoQuery, valuesInfo),
            dbConnection.query(updatePaymentDetailQuery, valuesDetail)
        ]);

        const updatedPaymentQuery = `
            SELECT * FROM PaymentInfo WHERE PaymentID = ?;
        `;
        const [updatedPaymentRows] = await dbConnection.query(updatedPaymentQuery, [paymentId]);
        const updatedPayment = updatedPaymentRows[0];


        return updatedPayment;
    } catch (error) {
        console.error('Error updating payment:', error);
        throw error;
    }
}
async function updatePaymentLate(paymentData, PaymentID, penalityPayment) {
    const updateQuery = `UPDATE PaymentLate SET LatePaymentReason = ?, PenalityRate = ?, PenalityPayment = ? WHERE PaymentID = ?`;
    const values = [
        paymentData.latePaymentReason,
        paymentData.penalityRate,
        penalityPayment,
        PaymentID,
    ];
    try {
        const [result] = await dbConnection.query(updateQuery, values);

        if (result.affectedRows > 0) {
            return true;
        } else {
            throw new Error("Failed to update payment late information");
        }
    } catch (error) {
        console.error('Error updating payment late:', error);
        throw error;
    }
}

module.exports = {
    updatePaymentByPaymentHashId,
    updatePaymentLate
};