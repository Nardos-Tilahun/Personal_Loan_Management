const dbConnection = require("../../Config/dbConfig");

async function updateUserPaymentStatus(userId, isActive) {
    try {
        const updateQuery = `
            UPDATE UserPayment
            SET IsActive = ?
            WHERE UserID = ?;
        `;
        const [result] = await dbConnection.query(updateQuery, [isActive, userId]);

        if (result.affectedRows > 0) {
            return "User payment status updated successfully";
        } else {
            throw new Error("User payment not found for the provided UserID");
        }
    } catch (error) {
        console.error("Error updating user payment status:", error);
        throw error;
    }
}
async function updateUserInfo(userData) {

    const updateUserInfoQuery = `
        UPDATE UserInfo AS u1
        INNER JOIN UserRole AS u2 ON u1.UserRoleId = u2.UserRoleId
        SET u1.FirstName = ?,
            u1.LastName = ?,
            u1.UserImage = ?,
            u1.UserRoleId = u2.UserRoleId
        WHERE u1.Email = ?;
    `;

    const updateUserAddressQuery = `
        UPDATE UserAddress
        SET PhoneNumber = ?,
            SecondPhoneNumber = ?,
            StreetAddress = ?,
            City = ?,
            State = ?,
            Country = ?,
            ZipCode = ?
        WHERE UserID = (SELECT UserID FROM UserInfo WHERE Email = ?);
    `;

    try {
        await dbConnection.query(updateUserInfoQuery, [userData.firstName, userData.lastName, userData.profilePicture, userData.email]);

        await dbConnection.query(updateUserAddressQuery, [userData.contactInformation.phoneNumber, userData.contactInformation.secondPhoneNumber, userData.contactInformation.streetAddress, userData.contactInformation.city, userData.contactInformation.state, userData.contactInformation.country, userData.contactInformation.zipCode, userData.email]);

        return true;
    } catch (error) {
        console.error("Error updating user information:", error);
        throw error;
    }
}
async function deleteUserByUserHashID({ selectedIds }) {
    if (!selectedIds || selectedIds.length === 0) {
        throw new Error("No UserHashIDs provided");
    }

    const placeholders = selectedIds?.map(() => '?').join(', ');

    const deleteQuery = `
        UPDATE UserPayment
        SET IsDelete = NOW()
        WHERE UserID IN (
            SELECT UserID
            FROM UserPass
            WHERE UserHashID IN (${placeholders})
        );
    `;

    try {
        await dbConnection.query(deleteQuery, selectedIds);

        return true;
    } catch (error) {
        console.error("Error updating user information:", error);
        throw error;
    }
}

module.exports = {
    updateUserPaymentStatus,
    updateUserInfo,
    deleteUserByUserHashID
};
