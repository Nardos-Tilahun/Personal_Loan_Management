const express = require("express");
const router = express.Router();

const { addLoan, LoanInfoData, LoanListData, LoanListDataForPayment, updateLoan, deleteLoan } = require("../Controller/loanController");
const { authMiddleware } = require("../Middlewares/authMiddleware");

router.post(process.env.ADDLOAN, addLoan);
router.post(process.env.UPDATELOAN, updateLoan);
router.delete(process.env.DELETELOAN, deleteLoan);
router.get(process.env.LOANINFODATA, authMiddleware, LoanInfoData);
router.get(process.env.LOANLISTDATA, authMiddleware, LoanListData);
router.get(process.env.LOANLISTDATAFORPAYMENT, authMiddleware, LoanListDataForPayment);

module.exports = router;