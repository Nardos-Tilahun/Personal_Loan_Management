const express = require("express");
const router = express.Router();
const { addPayment, PaymentInfoData, PaymentListData, updatePayment, deletePayment } = require("../Controller/paymentController");
const { authMiddleware } = require("../Middlewares/authMiddleware");

router.post(process.env.ADDPAYMENT, addPayment);
router.post(process.env.UPDATEPAYMENT, updatePayment);
router.delete(process.env.DELETEPAYMENT, deletePayment);
router.get(process.env.PAYMENTINFODATA, authMiddleware, PaymentInfoData);
router.get(process.env.PAYMENTLISTDATA, authMiddleware, PaymentListData);


module.exports = router;
