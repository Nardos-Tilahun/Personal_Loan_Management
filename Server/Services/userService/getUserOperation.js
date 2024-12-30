const dbConnection = require("../../Config/dbConfig");

async function getUserById(userId) {
    try {
        const query = `SELECT * FROM UserInfo WHERE UserID = ?`;
        const [rows] = await dbConnection.query(query, [userId]);

        if (rows.length > 0) {
            return rows;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}
async function getUserByUserHashId(userHashId) {
    try {
        const query = `SELECT u.*
                        FROM UserInfo u
                        JOIN UserPass up ON u.UserID = up.UserID
                        WHERE up.UserHashID = ?`;
        const [rows] = await dbConnection.query(query, [userHashId]);
        if (rows.length > 0) {
            return rows;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}
async function getUserByEmail(email) {
    try {
        const query = `
            SELECT ui.*, up.*
            FROM UserInfo ui
            JOIN UserPayment up ON ui.UserID = up.UserID
            WHERE ui.Email = ? AND up.IsDelete IS NULL;
        `;
        const [rows] = await dbConnection.query(query, [email]);
        return rows;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}
async function getUserPassByUserId(userId) {
    try {
        const query = `SELECT * FROM UserPass WHERE UserID = ?`;
        const [rows] = await dbConnection.query(query, [userId]);

        if (rows.length > 0) {
            return rows;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}
async function getUserAddressByUserId(userId) {
    try {
        const query = `SELECT * FROM UserAddress WHERE UserID = ?`;
        const [rows] = await dbConnection.query(query, [userId]);

        if (rows.length > 0) {
            return rows;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}
async function getUserPaymentByUserId(userId) {
    try {
        const query = `SELECT * FROM UserPayment WHERE UserID = ?`;
        const [rows] = await dbConnection.query(query, [userId]);

        if (rows.length > 0) {
            return rows;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}
async function getUserRoleByRoleName(userRoleName) {
    const query = "SELECT * FROM UserRole WHERE UserRoleName = ?";
    const [rows] = await dbConnection.query(query, [userRoleName]);
    if (rows.length > 0) {
        return rows;
    } else {
        throw new Error("Invalid user role");
    }
}
async function getUserRoleByRoleId(userRoleId) {
    try {
        const query = "SELECT * FROM UserRole WHERE UserRoleId = ?";
        const [rows] = await dbConnection.query(query, [userRoleId]);
        if (rows.length > 0) {
            return rows;
        } else {
            throw new Error("Invalid user role");
        }
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}
async function getUserInfo() {
    try {
        const userInfoQuery = `
            SELECT 
                u.FirstName,
                u.LastName,
                u.Email,
                ua.PhoneNumber AS FirstPhoneNumber,
                ua.SecondPhoneNumber AS SecondPhoneNumber
            FROM 
                UserInfo u
            JOIN 
                UserAddress ua ON u.UserID = ua.UserID
        `;

        const result = await dbConnection.query(userInfoQuery);

        return result[0];
    } catch (error) {
        console.error("Error in retrieving user info:", error);
        throw error;
    }
}
async function getDashInfo() {
    try {
        const userInfoQuery = `
            SELECT 
                u.FirstName,
                u.LastName,
                u.Email,
                ua.PhoneNumber AS FirstPhoneNumber,
                ua.SecondPhoneNumber AS SecondPhoneNumber
            FROM 
                UserInfo u
            JOIN 
                UserAddress ua ON u.UserID = ua.UserID
        `;

        const result = await dbConnection.query(userInfoQuery);

        return result[0];
    } catch (error) {
        console.error("Error in retrieving user info:", error);
        throw error;
    }
}
async function getUserNameByLoanId(loanId) {
    const selectQuery =
        `SELECT 
                UI.FirstName,
                UI.LastName
            FROM 
                LoanInfo LI
            JOIN 
                UserInfo UI ON LI.UserID = UI.UserID
            WHERE 
                LI.LoanID = ?;
            `;
    const [rows] = await dbConnection.query(selectQuery, [loanId]);
    if (rows.length > 0) {
        return rows;
    } else {
        throw new Error("user not found");
    }
}
function convertToFormattedData(originalData) {
    try {
        const formattedData = {
            firstName: originalData.firstName,
            lastName: originalData.lastName,
            email: originalData.email,
            password: originalData.password,
            confirmPassword: originalData.confirmPassword,
            createdBy: originalData.createdBy,
            contactInformation: {
                phoneNumber: originalData['contactInformation.phoneNumber'],
                secondPhoneNumber: originalData['contactInformation.secondPhoneNumber'],
                streetAddress: originalData['contactInformation.streetAddress'],
                city: originalData['contactInformation.city'],
                state: originalData['contactInformation.state'],
                country: originalData['contactInformation.country'],
                zipCode: originalData['contactInformation.zipCode']
            },
            roleInformation: {
                userRoleName: originalData['roleInformation.userRoleName']
            }
        }

        return formattedData;
    } catch (error) {
        console.error("Error in converting data:", error);
        throw error;
    }
}

async function getUserByHashId(hashId) {
    try {
        const selectQuery = `
            SELECT
                UserInfo.FirstName AS firstName,
                UserInfo.LastName AS lastName,
                UserInfo.Email AS email,
                UserRole.UserRoleName AS roleName,
                UserAddress.PhoneNumber AS phoneNumber,
                UserAddress.SecondPhoneNumber AS secondPhoneNumber,
                UserAddress.Country AS selectedCountry,
                UserAddress.City AS selectedCity,
                UserAddress.State AS selectedState,
                UserAddress.StreetAddress AS streetAddress,
                UserAddress.ZipCode AS zipCode,
                UserInfo.UserImage AS name
            FROM
                UserPass
            INNER JOIN UserInfo ON UserPass.UserID = UserInfo.UserID
            INNER JOIN UserRole ON UserInfo.UserRoleId = UserRole.UserRoleId
            INNER JOIN UserAddress ON UserInfo.UserID = UserAddress.UserID
            WHERE
                UserPass.UserHashID = ?
                AND EXISTS (SELECT 1 FROM UserPass WHERE UserPass.UserID = UserInfo.UserID);
        `;
        const [rows] = await dbConnection.query(selectQuery, [hashId]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            throw new Error("User Information not found");
        }
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}

module.exports = {
    getUserById,
    getUserByUserHashId,
    getUserByEmail,
    getUserPassByUserId,
    getUserAddressByUserId,
    getUserPaymentByUserId,
    getUserRoleByRoleName,
    getUserRoleByRoleId,
    getDashInfo,
    getUserInfo,
    getUserNameByLoanId,
    convertToFormattedData,
    getUserByHashId
};
