const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../Middlewares/authMiddleware");
const { upload } = require("../Middlewares/uploadProfilePicture");

const { register, loginUser,
    customerListData, adminListData,
    customerData, customerListDataForLoan,
    update, getUserDataForUpdate,
    deleteUser, forgotPassword,
    resetPassword, updatePassword,
    updateVerification, verifyEmailRegistration }
    = require("../Controller/userController");

const { dashboardData } = require("../Controller/dashboardController");
router.get("/ping", (req, res) => {
    res.status(200).json({ message: "Server is alive", timestamp: new Date() });
});
router.post(process.env.REGISTER, upload.single('profilePicture'), authMiddleware, register);
router.get(process.env.GETUSERDATAFORUPDATE, authMiddleware, getUserDataForUpdate);
router.put(process.env.GETUSERDATAFORUPDATE, upload.single('profilePicture'), authMiddleware, update);
router.put(process.env.UPDATEVERIFICATION, authMiddleware, updateVerification);
router.get(process.env.DASHBOARDDATA, authMiddleware, dashboardData);
router.get(process.env.CUSTOMERLISTDATA, authMiddleware, customerListData);
router.get(process.env.CUSTOMERLISTDATAFORLOAN, authMiddleware, customerListDataForLoan);
router.get(process.env.ADMINLISTDATA, authMiddleware, adminListData);
router.get(process.env.CUSTOMERDATA, authMiddleware, customerData);
router.put(process.env.DELETEUSER, authMiddleware, deleteUser);


router.post(process.env.LOGINUSER, loginUser);
router.get(process.env.VERIFYEMAILREGISTRATION, verifyEmailRegistration);
router.post(process.env.FORGOTPASSWORD, forgotPassword);
router.get(process.env.RESETPASSWORD, resetPassword);
router.put(process.env.UPDATEPASSWORD, updatePassword);

module.exports = router;
