const dbConnection = require("../../Config/dbConfig");
async function getAdminList() {
    try {
        const selectQuery = `SELECT
                                UP.UserHashID AS hashId,
                                CONCAT(UI.FirstName, ' ', UI.LastName) AS fullName,
                                UI.Email AS email,
                                UI.UserImage AS UserImage,
                                DATE_FORMAT(UI.Date_Created, '%M %d, %Y %l:%i %p') AS createdDate,
                                UA.PhoneNumber,
                                UA.SecondPhoneNumber,
                                UA.StreetAddress,
                                UA.City,
                                UA.State,
                                UA.Country,
                                UA.ZipCode,
                                CONCAT(CR.FirstName, ' ', CR.LastName) AS createdBy
                            FROM
                                UserInfo UI
                            JOIN
                                UserPass UP ON UI.UserID = UP.UserID
                            JOIN
                                UserPayment UPay ON UI.UserID = UPay.UserID
                            JOIN
                                UserRole UR ON UI.UserRoleId = UR.UserRoleId
                            LEFT JOIN
                                UserAddress UA ON UI.UserID = UA.UserID
                            LEFT JOIN
                                UserInfo CR ON UI.CreatedBy = CR.UserID
                            WHERE
                                UR.UserRoleName = 'Admin'
                                AND UPay.IsDelete Is NULL;

                            `;
        const [rows] = await dbConnection.query(selectQuery);
        if (rows.length > 0) {
            return rows;
        } else {
            throw new Error("Admin not found");
        }
    } catch (error) {
        throw new Error("Failed to get admin list: " + error.message);
    }
}
module.exports = {
    getAdminList
};
