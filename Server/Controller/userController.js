const { StatusCodes } = require("http-status-codes");
const dbConnection = require("../Config/dbConfig");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const {
    checkExistingUser,
    createUserInfo,
    hashAndSavePassword,
    saveUserAddress,
    createUserPayment,
    hashIdForRoute,
    saveEmailVerificationToken,
    sendVerificationForgot,
    verifyTokenRegistration,
    verifyTokenUpdatePassword,
    verifyUpdatePassword,
    updateEmailVerification,
} = require("../Services/userService/userCreateOperation.js");

const {
    getUserByEmail,
    getUserPassByUserId,
    getUserRoleByRoleName,
    getUserRoleByRoleId,
    getUserByUserHashId,
    convertToFormattedData,
    getUserByHashId
} = require("../Services/userService/getUserOperation.js");
const { getCustomerList,
    getCustomer,
    getCustomerListForLoan
} = require("../Services/userService/getCustomer.service.js");
const { getAdminList } = require("../Services/userService/getAdmin.service.js");
const { getCustomerLoanData,
    getLoanNextPaymentData
} = require("../Services/loanService/getCustomerLoan.service.js");
const { updateUserInfo,
    deleteUserByUserHashID
} = require("../Services/userService/updateUserOperation.js");

async function register(req, res) {
    let connection;
    try {
        connection = await dbConnection.getConnection();
        await connection.beginTransaction();
        const data = req.body;
        const userData = convertToFormattedData(data);
        if (req.file) {
            userData.profilePicture = req.file.filename;
        }

        const createdUser = await getUserByUserHashId(userData.createdBy);

        if (createdUser[0]?.UserRoleId !== 1) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ status: "FAIL", msg: "You are not the admin" });
        } else {
            userData.createdBy = createdUser[0]?.UserID;
        }

        const existingUser = await checkExistingUser(userData.email);
        if (existingUser) {
            return res
                .status(StatusCodes.CONFLICT)
                .json({ status: "CONFLICT", msg: "Email already exists" });
        }

        if (userData.password !== userData.confirmPassword) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ status: "FAIL", msg: "Confirmation password must match" });
        }

        if (userData.password.length < 8) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ status: "FAIL", msg: "Password must be at least 8 characters long" });
        }

        const userRole = await getUserRoleByRoleName(userData.roleInformation.userRoleName);

        const userIdCreated = await createUserInfo(
            userData,
            userRole[0].UserRoleId
        );

        const hashedUserId = hashIdForRoute(userIdCreated.toString(), 25);

        await Promise.all([
            hashAndSavePassword(userIdCreated, hashedUserId, userData.password),
            saveUserAddress(userIdCreated, userData),
            createUserPayment(userIdCreated),
        ]);

        await connection.commit();

        return res
            .status(StatusCodes.CREATED)
            .json({ status: "OK", msg: "User registered successfully. Please verify your email." });
    } catch (error) {
        console.error("Error:", error);
        
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Something went wrong" });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
async function verifyEmailRegistration(req, res) {
    const { token } = req.query;
    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Token is missing" });
    }
    const result = await verifyTokenRegistration(token);
    const email = encodeURIComponent(result?.data[0]?.Email);
    if (result.status === 'success') {
        return res.redirect(`${process.env.CLIENT_URL}/confirm?token=${token}&email=${email}&expired=${true}`);
    } else if (result.status === 'error' && result.msg == "Expired token") {

        return res.redirect(`${process.env.CLIENT_URL}/confirm?token=${token}&email=${email}&expired=${false}`);
    } else {

        return res.redirect(`${process.env.CLIENT_URL}/confirm?token=${token}`);
    }
};
async function forgotPassword(req, res) {
    let connection;
    try {
        connection = await dbConnection.getConnection();
        await connection.beginTransaction();

        const { email } = req.body.user;
        const userData = await getUserByEmail(email);
        if (userData.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: "FAIL", msg: "No Account found" });
        }
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpiresAt = new Date(Date.now() + 600000);
        const updated = await saveEmailVerificationToken(userData[0].UserID, verificationToken, verificationExpiresAt);
        if (!updated) {
            return res
                .status(StatusCodes.CONFLICT)
                .json({ status: "CONFLICT", msg: "There is Token and it is removed" });
        }
        await sendVerificationForgot(email, verificationToken);
        await connection.commit();
        return res
            .status(StatusCodes.OK)
            .json({ status: "OK", msg: 'Password reset Email sent' });
    } catch (error) {
        console.error("Error:", error);
        
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ status: "FAIL", msg: "Something went wrong" });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
async function resetPassword(req, res) {

    try {
        const { token } = req.query;

        if (!token) {
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Token is missing" });
        }

        const result = await verifyTokenUpdatePassword(token);

        const email = encodeURIComponent(result[0]?.Email);

        if (result.length !== 0) {
            const redirectUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${email}`;
            return res.redirect(redirectUrl);
        } else {
            const redirectUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
            return res.redirect(redirectUrl);
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Something went wrong" });
    }
};
async function updatePassword(req, res) {

    try {
        const { user } = req.body;

        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "user is missing" });
        }
        if (user?.password !== user?.confirmPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Not Matched Password" });
        }

        const result = await verifyUpdatePassword(user);
        if (result.status === 'success') {
            return res.status(StatusCodes.OK).json({ status: "success", msg: "Password updated sucessfully" });
        } else {
            const redirectUrl = `${process.env.CLIENT_URL}/reset-password?token=${user.token}`;
            res.redirect(redirectUrl);
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "token is expired or Not there" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Something went wrong" });
    }
};
async function updateVerification(req, res) {

    try {
        const email = await req.headers['email'];
        const confirm = await req.headers['confirm'];

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpiresAt = new Date(Date.now() + 86400000);
        const result = await updateEmailVerification(email, verificationToken, verificationExpiresAt, confirm);
        if (result?.status === 'success' && result?.msg == "Verification declined successfully") {
            return res.status(StatusCodes.OK).json({ status: "OK", msg: "Verification declined successfully" });
        } else if (result?.status === 'error' && result?.msg == "Token already sent to the client.") {
            return res.status(StatusCodes.OK).json({ status: "error", msg: `Token already sent to the client.`, data: result?.data });
        } else if (result?.status === 'error' && result?.msg == "Token expired. Contact us to send it again and verify.") {
            return res.status(StatusCodes.OK).json({ status: "error", msg: `Token expired. Contact us to send it again and verify.` });
        } else if (result?.status === 'success' && result?.msg == "Verification added successfully") {
            return res.status(StatusCodes.OK).json({ status: "OK", msg: "Verification added successfully" });
        } else if (result?.status === 'error' && result?.msg == "Token exists but expired.") {
            return res.status(StatusCodes.OK).json({ status: "error", msg: "Token exists but expired." });
        } else if (result?.status === 'error' && result?.msg == "Already Verified account") {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: "error", msg: "Already Verified account" });
        } else if (result?.status === 'error' && result?.msg == "Already Not Verified account") {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: "error", msg: "Already Not Verified account" });
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: "error", msg: "something went wrong" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Something went wrong" });
    }
};
async function update(req, res) {
    let connection;
    try {
        connection = await dbConnection.getConnection();
        await connection.beginTransaction();

        const data = req.body;
        const userData = convertToFormattedData(data)

        if (req.file) {
            userData.profilePicture = req.file.filename;
        }

        const createdUser = await getUserByUserHashId(userData.createdBy);

        if (createdUser[0]?.UserRoleId !== 1) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ status: "UNAUTHORIZED", msg: "You are not the admin" });
        } else {
            userData.createdBy = createdUser[0]?.UserID
        }

        const existingUser = await checkExistingUser(userData.email);
        if (!existingUser) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ status: "FAIL", msg: "Email is not exists" });
        }


        const response = await updateUserInfo(userData)


        await connection.commit();

        if (response)
            return res
                .status(StatusCodes.CREATED)
                .json({ status: "OK", msg: "User updated successfully" });
        else
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ status: "FAIL", msg: "Something went wrong" });

    } catch (error) {
        
        console.error("Error:", error);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ status: "FAIL", msg: "Something went wrong" });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
async function deleteUser(req, res) {
    let connection;
    try {
        connection = await dbConnection.getConnection();
        await connection.beginTransaction();
        const data = req.body;
        const deletedUser = await deleteUserByUserHashID(data);

        if (!deletedUser) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ msg: "User is not exists" });
        } else
            return res
                .status(StatusCodes.CREATED)
                .json({ msg: "User deleted successfully " });

    } catch (error) {
        console.error("Error:", error);
        
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Something went wrong" });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
async function loginUser(req, res) {
    try {
        const { email, password } = req.body.data[0].user;

        const userRows = await getUserByEmail(email);

        if (userRows.length === 0) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ response: { msg: "Invalid email or password" } });
        }
        const userId = userRows[0].UserID;

        const userPass = await getUserPassByUserId(userId);
        if (userPass.length === 0) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                response: {
                    msg: "Hashed password not found in the UserPass table",
                },
            });
        }

        const storedHashedPassword = userPass[0].UserHashPass;

        if (!storedHashedPassword) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                response: {
                    msg: "Hashed password not found in the database",

                },
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            storedHashedPassword
        );

        if (!passwordMatch) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ response: { msg: "Invalid email or password" } });
        }
        const userRole = await getUserRoleByRoleId(userRows[0].UserRoleId);
        const userDetails = {
            userHashId: userPass[0].UserHashID,
            email,
            userRoleId: userRole[0].UserRoleId,
            firstName: userRows[0].FirstName,
            lastName: userRows[0].LastName,
            userImage: userRows[0].UserImage
        };

        const token = jwt.sign(
            userDetails,
            process.env.SECRETE_KEY,
            {
                expiresIn: "10d",
            }
        );

        return res.status(StatusCodes.OK).json({
            response: {
                msg: "User login successfully",
                userData: token,
                status: "OK"
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({
                response: {
                    msg: `Something went wrong.
                    Please try again later.`
                }
            });
    }
}
async function customerListData(req, res) {

    try {

        const customerList = await getCustomerList();
        return res.status(StatusCodes.OK).json({ response: customerList });

    } catch (err) {
        return res.status(StatusCodes.BAD_REQUEST).json({ response: { msg: "Error in fetching customer list data" } });
    }
}
async function customerListDataForLoan(req, res) {
    try {

        const customerList = await getCustomerListForLoan();

        return res.status(StatusCodes.OK).json({ response: customerList });
    } catch (err) {

        return res.status(StatusCodes.BAD_REQUEST).json({ response: { msg: "Error in fetching customer list data" } });
    }
}
async function adminListData(req, res) {
    try {
        const adminList = await getAdminList();
        return res.status(StatusCodes.OK).json({ response: adminList });
    } catch (err) {
        return res.status(StatusCodes.BAD_REQUEST).json({ response: { msg: "Error in fetching admin list data" } });
    }
}
async function customerData(req, res) {
    const hashId = await req.headers['hash-id'];
    try {
        const getCustomerDetail = await getCustomer(hashId);
        const customerLoanList = await getCustomerLoanData(hashId);
        const nextPaymentStatus = await getLoanNextPaymentData(hashId)
        const customerInfo = {
            customerLoanList,
            getCustomerDetail,
            nextPaymentStatus
        }
        return res.status(StatusCodes.OK).json({ response: customerInfo });
    } catch (err) {
        return res.status(StatusCodes.BAD_REQUEST).json({ response: { msg: "Error in fetching customer data" } });
    }
}
async function getUserDataForUpdate(req, res) {
    const hashId = await req.headers['hash-id'];
    try {
        const userData = await getUserByHashId(hashId);
        return res.status(StatusCodes.OK).json({ response: userData });
    } catch (err) {
        return res.status(StatusCodes.BAD_REQUEST).json({ response: { msg: "Error in fetching user list data for update" } });
    }
}


module.exports = {
    register,
    verifyEmailRegistration,
    forgotPassword,
    resetPassword,
    updatePassword,
    updateVerification,
    update,
    deleteUser,
    loginUser,
    customerListData,
    customerListDataForLoan,
    adminListData,
    customerData,
    getUserDataForUpdate
};
