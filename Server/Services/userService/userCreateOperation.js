const dbConnection = require("../../Config/dbConfig");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_SERVER,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
    }
});
async function sendEmail({ to, from, subject, text, html }) {
    if (process.env.NODE_ENV === 'development') {
        await transporter.sendMail({
            from,
            to,
            subject,
            text,
            html
        });
    } else {
        const msg = {
            to,
            from,
            subject,
            text,
            html,
        };
        await sgMail.send(msg);
    }
}
async function checkExistingUser(email) {
    const query = "SELECT Email FROM UserInfo WHERE Email = ?";
    const [rows] = await dbConnection.query(query, [email]);
    return rows.length > 0;
}
async function saveEmailVerificationToken(userId, token, expiresAt) {
    try {
        const checkQuery = 'SELECT token, token_expires_at FROM UserPass WHERE UserID = ?';
        const [rows] = await dbConnection.execute(checkQuery, [userId]);

        if (rows.length > 0) {
            const currentTimestamp = new Date();
            const tokenExpirationTime = new Date(rows[0].token_expires_at);
            if (rows[0].token && tokenExpirationTime > currentTimestamp) {
                return false;
            }
        }

        const encryptedToken = crypto.createHash('sha256').update(token).digest('hex');

        const updateQuery = 'UPDATE UserPass SET token = ?, token_expires_at = ? WHERE UserID = ?';
        await dbConnection.execute(updateQuery, [encryptedToken, expiresAt, userId]);
        return true;
    } catch (error) {
        console.error('Error saving email verification token:', error);
        throw error;
    }
}
async function sendVerificationRegister(userData, verificationToken) {
    const verificationLink = `${process.env.SERVER_URL}/api/user/verify-email?token=${verificationToken}`;
    userData.email = userData.Email
    userData.firstName = userData.FirstName
    const msg = {
        to: userData.email,
        from: {
            name: "PERSONAL LOAN",
            email: process.env.VERIFIED_SENDER_EMAIL
        },
        subject: 'Welcome to Financial Lending! Verify Your Email',
        text: `Hi ${userData.firstName},

            Thank you for joining Financial Lending! Please verify your email address to complete your registration.

            Click the link below to verify your email:
            ${verificationLink}

            If you didn't request this email, please ignore it.

            Best regards,
            The Financial Lending Team
            `,
        html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #333;">Welcome to Financial Lending!</h2>
                    <p>Hi ${userData.firstName}</p>
                    <p>Thank you for joining Financial Lending! We're excited to have you with us. Please verify your email address to complete your registration by clicking the link below:</p>
                    <p style="text-align: center;">
                        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                    </p>
                    <p>If the button above doesn't work, you can also verify your email by clicking the link below:</p>
                    <p style="text-align: center;">
                        <a href="${verificationLink}" style="color: #4CAF50;">${verificationLink}</a>
                    </p>
                    <p>If you didn't request this email, please ignore it.</p>
                    <p>Best regards,<br>The Financial Lending Team</p>
                    <hr>
                    <p style="font-size: 0.9em; color: #555;">If you have any questions, feel free to contact our support team.</p>
                </div>
        `,
    };

    sendEmail(msg).then(() => {
    }).catch((error) => {
        console.error('Error sending email:', error);
    });

}
async function sendNotificationForAddLoan(loanDetails) {
    const loanPeriodLy = loanDetails?.loanPeriod + 'ly';

    const formatNumber = (number) => {
        return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const interestAmount = (parseFloat(loanDetails?.loanAmount) * parseFloat(loanDetails?.loanInterestRate) / 100);
    const totalAmount = parseFloat(interestAmount) + parseFloat(loanDetails?.loanAmount)

    const msg = {
        to: loanDetails?.userEmail,
        from: {
            name: "Financial Lending",
            email: process.env.VERIFIED_SENDER_EMAIL
        },
        subject: 'Your New Loan Has Been Created!',
        text: `Hi ${loanDetails?.firstName},

            We are pleased to inform you that a new loan has been successfully created under your account with the following details:

            - Loan Amount: ${loanDetails?.loanCurrency} ${formatNumber(loanDetails?.loanAmount)}
            - Interest Rate: ${loanDetails?.loanInterestRate}%  (Your calculated interest amount is ${loanDetails?.loanCurrency} ${formatNumber(interestAmount)}) 
            - Total Amount: ${loanDetails?.loanCurrency} ${formatNumber(totalAmount)}  (You are expected to repay  this excluding penality payments)
            - Loan Term: ${loanDetails?.loanTerm} ${loanDetails?.loanPeriod} (You are expected to pay ${loanPeriodLy})
            - Loan Start Date: ${formatDate(loanDetails?.loanStartDate)} (You need to start payment on this date)
            - Loan Expiry Date: ${formatDate(loanDetails?.loanExpireDate)} (Your payment for the loan will expire on this date)

            Next Payment Details:
            - Next Payment Amount: ${loanDetails?.loanCurrency} ${formatNumber(loanDetails?.NextPaymentStatus.NextPaymentAmount)}
            - Next Payment Due Date: ${formatDate(loanDetails?.NextPaymentStatus.NextPaymentExpirationDate)} (Due date for your next payment)

            Please log in to your account to review the details of your loan and to manage your repayments.

            If you have any questions or concerns, please feel free to contact us at <a href="mailto:${process.env.VERIFIED_SENDER_EMAIL}" style="color: #4CAF50; text-decoration: none;"><strong>${process.env.VERIFIED_SENDER_EMAIL}</strong></a>.
            Note: Delayed payments or payments made after the due date may incur a penalty.
            Best regards,
            The Financial Lending Team
        `,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50; text-align: center;">Your New Loan Has Been Created!</h2>
                <p>Hi ${loanDetails?.firstName},</p>
                <p>We are pleased to inform you that a new loan has been successfully created under your account with the following details:</p>
                <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Loan Amount:</strong> ${loanDetails?.loanCurrency} ${formatNumber(loanDetails?.loanAmount)}</li>
                    <li><strong>Interest Rate:</strong> ${loanDetails?.loanInterestRate}% </li>
                    <li> <strong> Total Repayment Amount: </strong> ${loanDetails?.loanCurrency} ${formatNumber(totalAmount)} <em>(You are expected to repay  this amount excluding penality payments)</em></li>
                    <li><strong>Loan Term:</strong> ${loanDetails?.loanTerm} ${loanDetails?.loanPeriod} <em>(You are expected to pay ${loanPeriodLy})</em></li>
                    <li><strong>Loan Start Date:</strong> ${formatDate(loanDetails?.loanStartDate)} <em>(You need to start payment on this date)</em></li>
                    <li><strong>Loan Expiry Date:</strong> ${formatDate(loanDetails?.loanExpireDate)} <em>(Your payment for the loan will expire on this date)</em></li>
                </ul>
                <h3 style="color: #4CAF50;">Next Payment Details</h3>
                <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Next Payment Amount:</strong> ${loanDetails?.loanCurrency} ${formatNumber(loanDetails?.NextPaymentStatus.NextPaymentAmount)}</li>
                    <li><strong>Next Payment Due Date:</strong> ${formatDate(loanDetails?.NextPaymentStatus.NextPaymentExpirationDate)} <em>(Due date for your next payment)</em></li>
                </ul>
                <p>Please <a href="${process.env.CLIENT_URL}/login" style="color: #4CAF50; text-decoration: none;"><strong>log in to your account</strong></a> to review the details of your loan and to manage your repayments.</p>
                <p>If you have any questions or concerns, please feel free to contact us at <a href="mailto:${process.env.VERIFIED_SENDER_EMAIL}" style="color: #4CAF50; text-decoration: none;"><strong>${process.env.VERIFIED_SENDER_EMAIL}</strong></a>.</p>
                <p style="color: #FF0000;"><strong>Note:</strong> Delayed payments or payments made after the due date may incur a penalty.</p>
                <p>Best regards,<br><strong>The Financial Lending Team</strong></p>
                <hr>
                <p style="font-size: 0.9em; color: #555;">If you have any questions, feel free to contact our support team.</p>
            </div>
        `,
    };

    sendEmail(msg).then(() => {
    }).catch((error) => {
        console.error('Error sending email:', error);
    });
}
async function sendNotificationForPayment(paymentData) {

    const formatNumber = (number) => {
        return number?.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const msg = {
        to: paymentData?.email,
        from: {
            name: "Financial Lending",
            email: process.env.VERIFIED_SENDER_EMAIL
        },
        subject: 'Payment Received Successfully!',
        text: `Hi ${paymentData?.firstName},

            We are pleased to inform you that your payment has been successfully received. Here are the details:

            - Payment Amount: ${paymentData?.paymentCurrency} ${formatNumber(paymentData?.paymentAmount)}
            - Total Paid to Date: ${paymentData?.paymentCurrency} ${formatNumber(paymentData?.newPayedPayment)}
            - Remaining Balance: ${paymentData?.paymentCurrency} ${formatNumber(paymentData?.newRemainingPayment)}

            Next Payment Details:
            - Next Payment Amount: ${paymentData?.paymentCurrency} ${formatNumber(paymentData?.nextPaymentStatus.NextPaymentAmount)}
            - Next Payment Due Date: ${formatDate(paymentData?.nextPaymentStatus.NextExpirationDate)}

            Please log in to your account to review the details of your loan and to manage your repayments.

            If you have any questions or concerns, please feel free to contact us at <a href="mailto:${process.env.VERIFIED_SENDER_EMAIL}" style="color: #4CAF50; text-decoration: none;"><strong>${process.env.VERIFIED_SENDER_EMAIL}</strong></a>.

            Best regards,
            The Financial Lending Team
        `,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50; text-align: center;">Payment Received Successfully!</h2>
                <p>Hi ${paymentData?.firstName},</p>
                <p>We are pleased to inform you that your payment has been successfully received. Here are the details:</p>
                <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Payment Amount:</strong> ${paymentData?.paymentCurrency} ${formatNumber(paymentData?.paymentAmount)}</li>
                    <li><strong>Total Paid to Date:</strong> ${paymentData?.paymentCurrency} ${formatNumber(paymentData?.newPayedPayment)}</li>
                    <li><strong>Remaining Balance:</strong> ${paymentData?.paymentCurrency} ${formatNumber(paymentData?.newRemainingPayment)}</li>
                </ul>
                <h3 style="color: #4CAF50;">Next Payment Details</h3>
                <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Next Payment Amount:</strong> ${paymentData?.paymentCurrency} ${formatNumber(paymentData?.nextPaymentStatus.NextPaymentAmount)}</li>
                    <li><strong>Next Payment Due Date:</strong> ${formatDate(paymentData?.nextPaymentStatus.NextExpirationDate)}</li>
                </ul>
                <p>Please <a href="${process.env.CLIENT_URL}/login" style="color: #4CAF50; text-decoration: none;"><strong>log in to your account</strong></a> to review the details of your loan and to manage your repayments.</p>
                <p>If you have any questions or concerns, please feel free to contact us at <a href="mailto:${process.env.VERIFIED_SENDER_EMAIL}" style="color: #4CAF50; text-decoration: none;"><strong>${process.env.VERIFIED_SENDER_EMAIL}</strong></a>.</p>
                <p>Best regards,<br><strong>The Financial Lending Team</strong></p>
                <hr>
                <p style="font-size: 0.9em; color: #555;">If you have any questions, feel free to contact our support team.</p>
            </div>
        `,
    };

    sendEmail(msg).then(() => {
    }).catch((error) => {
        console.error('Error sending email:', error);
    });
}
async function sendVerificationForgot(email, token) {
    const verificationLink = `${process.env.SERVER_URL}/api/user/reset-password?token=${token}`;

    const msg = {
        to: email,
        from: process.env.VERIFIED_SENDER_EMAIL,
        subject: 'Password Reset Request',
        text: `Hi there,

            We received a request to reset your password. Please click the link below to choose a new password:

            ${verificationLink}

            If you did not request a password reset, please ignore this email or contact our support team.

            Best regards,
            The Financial Lending Team
            `,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>Hi there,</p>
                <p>We received a request to reset your password. Please click the link below to choose a new password:</p>
                <p style="text-align: center;">
                    <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </p>
                <p>If the button above doesn't work, you can also reset your password by clicking the link below:</p>
                <p style="text-align: center;">
                    <a href="${verificationLink}" style="color: #4CAF50;">${verificationLink}</a>
                </p>
                <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
                <p>Best regards,<br>The Financial Lending Team</p>
                <hr>
                <p style="font-size: 0.9em; color: #555;">If you have any questions, feel free to contact our support team.</p>
            </div>
            `,
    };
    sendEmail(msg).then(() => {
    }).catch((error) => {
        console.error('Error sending email:', error);
    });
}
async function verifyTokenRegistration(token) {
    let connection;
    try {
        connection = await dbConnection.getConnection();
        await connection.beginTransaction();

        const encryptedToken = crypto.createHash('sha256').update(token).digest('hex');

        const query = `
            SELECT UserPass.*, UserInfo.Email
            FROM UserPass 
            INNER JOIN UserInfo ON UserPass.UserID = UserInfo.UserID 
            WHERE UserPass.token = ?
        `;
        const [results] = await connection.execute(query, [encryptedToken]);
        if (results.length === 0) {
            await connection.rollback();
            return { status: 'error', msg: "Token Doesn't exist", data: [] };
        } else if (results?.[0]?.token_expires_at > new Date()) {
            await connection.rollback();
            return { status: 'error', msg: 'Expired token', data: results };
        }

        const verification = results[0];

        const updateUserQuery = 'UPDATE UserPayment SET IsVerified = NOW() WHERE UserID = ?';
        await connection.execute(updateUserQuery, [verification.UserID]);

        const deleteTokenQuery = 'UPDATE UserPass SET token = NULL, token_expires_at = NULL WHERE UserID = ?';
        await connection.execute(deleteTokenQuery, [verification.UserID]);

        await connection.commit();
        return { status: 'success', msg: 'Email verified successfully', data: results };
    } catch (error) {
        console.error("Error:", error);
        if (connection) {
            await connection.rollback();
        }
        return { status: 'error', message: 'Something went wrong' };
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
async function verifyTokenUpdatePassword(token) {
    let connection;
    try {
        connection = await dbConnection.getConnection();
        await connection.beginTransaction();

        const encryptedToken = crypto.createHash('sha256').update(token).digest('hex');
        const query = `
            SELECT UserPass.*, UserInfo.Email 
            FROM UserPass 
            INNER JOIN UserInfo ON UserPass.UserID = UserInfo.UserID 
            WHERE UserPass.token = ? AND UserPass.token_expires_at > NOW()
            `;
        const [results] = await connection.execute(query, [encryptedToken]);
        return results
    } catch (error) {
        console.error("Error:", error);
        if (connection) {
            await connection.rollback();
        }
        return { status: 'error', message: 'Something went wrong' };
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
async function verifyUpdatePassword(user) {
    let connection;
    try {
        connection = await dbConnection.getConnection();
        await connection.beginTransaction();

        const encryptedToken = crypto.createHash('sha256').update(user.token).digest('hex');
        const query = `
        SELECT *
            FROM UserPass 
            WHERE UserPass.token = ? AND UserPass.token_expires_at > NOW()
            `;
        const [results] = await connection.execute(query, [encryptedToken]);

        if (results.length === 0) {
            await connection.rollback();
            return { status: 'error', message: 'Invalid or expired token' };
        }
        const verification = results[0];


        const updatePasswordQuery = 'UPDATE UserPass SET UserHashPass = ?, token = NULL, token_expires_at = NULL WHERE UserID = ?';
        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(user.password, salt);
        await connection.execute(updatePasswordQuery, [hashPass, verification.UserID]);

        await connection.commit();
        return { status: 'success', message: 'Password updated successfully' };
    } catch (error) {
        console.error("Error:", error);
        if (connection) {
            await connection.rollback();
        }
        return { status: 'error', message: 'Something went wrong' };
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
async function updateEmailVerification(email, verificationToken, verificationExpiresAt, confirm) {
    let connection;
    try {
        connection = await dbConnection.getConnection();
        await connection.beginTransaction();

        const query = `
            SELECT UserPayment.*, UserPass.*, UserInfo.*
            FROM UserPayment
            JOIN UserInfo ON UserPayment.UserID = UserInfo.UserID
            JOIN UserPass ON UserPayment.UserID = UserPass.UserID
            WHERE UserInfo.Email = ?
        `;
        const [results] = await connection.execute(query, [email]);

        if (!results || !results[0]) {
            await connection.rollback();
            return { status: 'error', msg: 'Invalid or expired token' };
        }

        const verification = results[0];

        const isVerifiedNotNull = verification.IsVerified !== null && verification.IsVerified !== undefined;

        if (isVerifiedNotNull && !verification.token && confirm === "Verified") {
            const isVerifiedQuery = `UPDATE UserPayment SET IsVerified = NULL WHERE UserID = ?`;
            const [result] = await connection.query(isVerifiedQuery, [verification.UserID]);
            await connection.commit();
            return { status: 'success', msg: 'Verification declined successfully' };
        } else if (verification?.token && new Date(verification?.token_expires_at) > new Date() && confirm === "NotVerified") {
            const remainingTimeMs = new Date(verification.token_expires_at) - new Date();
            const remainingHours = Math.floor(remainingTimeMs / (1000 * 60 * 60));
            const remainingMinutes = Math.floor((remainingTimeMs % (1000 * 60 * 60)) / (1000 * 60));
            return {
                status: 'error',
                msg: "Token already sent to the client.",
                data: [remainingHours, remainingMinutes]
            };
        } else if (verification?.IsVerified && confirm === "Verified") {
            return {
                status: 'error',
                msg: 'Token expired. Contact us to send it again and verify.'
            };
        } else if (!verification?.IsVerified && confirm === "NotVerified") {
            const saved = await saveEmailVerificationToken(verification?.UserID, verificationToken, verificationExpiresAt);
            if (saved) {
                await sendVerificationRegister(verification, verificationToken);
                await connection.commit();
                return { status: 'success', msg: 'Verification added successfully' };
            } else {
                return { status: 'error', msg: 'Token exists but expired.' };
            }
        } else if (confirm === "NotVerified") {
            return { status: 'error', msg: 'Already Verified account' };
        } else if (confirm !== "NotVerified") {
            return { status: 'error', msg: 'Already Not Verified account' };
        }
        return { status: 'error', msg: 'Something went wrong' };
    } catch (error) {
        console.error('Error:', error);
        if (connection) {
            await connection.rollback();
        }
        return { status: 'error', msg: 'Something went wrong.' };
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
async function createUserInfo(userData, userRoleId) {
    try {
        const query = `INSERT INTO UserInfo(FirstName, LastName, Email, Date_Created, UserRoleId, UserImage, CreatedBy) VALUES(?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)`;
        const [result] = await dbConnection.query(query, [
            userData.firstName,
            userData.lastName,
            userData.email,
            userRoleId,
            userData.profilePicture,
            userData.createdBy,
        ]);

        if (result.insertId) {
            return result.insertId;
        } else {
            throw new Error("Failed to create user info");
        }
    } catch (error) {
        console.error("Error creating user info:", error);
        throw error;
    }
}
async function hashAndSavePassword(userId, hashedUserId, password) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(password, salt);

        const query = `INSERT INTO UserPass(UserID, UserHashID, UserHashPass) VALUES(?, ?, ?)`;
        await dbConnection.query(query, [userId, hashedUserId, hashPass]);
    } catch (error) {
        console.error(error);
    }
}
async function saveUserAddress(userId, userData) {
    try {
        const query = `INSERT INTO UserAddress(UserID, PhoneNumber, SecondPhoneNumber, StreetAddress, City, State, Country, ZipCode) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
        await dbConnection.query(query, [
            userId,
            userData.contactInformation.phoneNumber,
            userData.contactInformation.secondPhoneNumber,
            userData.contactInformation.streetAddress,
            userData.contactInformation.city,
            userData.contactInformation.state,
            userData.contactInformation.country,
            userData.contactInformation.zipCode,
        ]);
    } catch (error) {
        console.error(error);
    }
}
async function createUserPayment(userId) {
    try {
        const query = `INSERT INTO UserPayment(UserID, IsActive, IsVerified, score) VALUES(?, FALSE, ?, 0)`;
        const IsVerified = userId === 1 ? new Date() : null;
        await dbConnection.query(query, [userId, IsVerified]);
    } catch (error) {
        console.error(error);
    }
}
function hashIdForRoute(userIdAsString, length) {
    try {
        const hash = crypto.createHash("sha256");
        hash.update(userIdAsString);
        const fullHash = hash.digest("hex");
        return fullHash.substring(0, length);
    } catch (error) {
        console.error("Error in hashIdForRoute:", error.message);
        throw error;
    }
}

module.exports = {
    checkExistingUser,
    saveEmailVerificationToken,
    sendVerificationRegister,
    sendNotificationForAddLoan,
    sendNotificationForPayment,
    sendVerificationForgot,
    verifyTokenRegistration,
    verifyTokenUpdatePassword,
    verifyUpdatePassword,
    updateEmailVerification,
    createUserInfo,
    hashAndSavePassword,
    saveUserAddress,
    createUserPayment,
    hashIdForRoute,
};

