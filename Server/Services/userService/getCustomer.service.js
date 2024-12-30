const dbConnection = require("../../Config/dbConfig");
async function getCustomerList() {
const selectQuery = `
        SELECT
            UP.UserHashID AS hashId,
            CONCAT(UI.FirstName, ' ', UI.LastName) AS fullName,
            UI.Email AS email,
            UI.Date_Created AS createdDate,
            DATE_FORMAT(UI.Date_Created, '%M %e, %Y %l:%i %p') AS formattedCreatedDate,
            UI.UserImage AS UserImage,
            CASE
                WHEN UPay.IsActive = TRUE AND EXISTS (
                    SELECT 1
                    FROM LoanInfo LI
                    JOIN LoanPayment LP ON LI.LoanID = LP.LoanID
                    WHERE LI.UserID = UI.UserID
                    AND (LP.Status = 'Active' OR LP.Status = 'Pending')
                ) THEN 'Active'
                ELSE 'Pending'
            END AS status,
            CASE
                WHEN UPay.IsVerified IS NULL THEN 'NotVerified'
                ELSE 'Verified'
            END AS verify
        FROM
            UserInfo UI
        JOIN
            UserPass UP ON UI.UserID = UP.UserID
        JOIN
            UserPayment UPay ON UI.UserID = UPay.UserID
        JOIN
            UserRole UR ON UI.UserRoleId = UR.UserRoleId
        WHERE
            UR.UserRoleName = 'Customer'
            AND UPay.IsDelete IS NULL
        ORDER BY
            UI.Date_Created DESC;
    `;
    try {
        const [rows] = await dbConnection.query(selectQuery);
        return rows;
    } catch(error) {
        console.error("Error fetching customers:", error);
        throw error;
    }
}


async function getCustomerListForLoan() {
    const selectQuery = `
        SELECT
            UI.FirstName AS firstName,
            UI.LastName AS lastName,
            UI.Email AS email,
            UA.PhoneNumber AS phoneNumber,
            UA.SecondPhoneNumber AS secondPhoneNumber,
            UP.IsActive AS isActive,
            UPass.UserHashID AS userHashId
        FROM
            UserInfo UI
        JOIN
            UserAddress UA ON UI.UserID = UA.UserID
        JOIN
            UserRole UR ON UI.UserRoleId = UR.UserRoleId
        LEFT JOIN
            UserPayment UP ON UI.UserID = UP.UserID
        JOIN
            UserPass UPass ON UI.UserID = UPass.UserID
        WHERE
            UR.UserRoleName = 'Customer'
            AND UI.UserID NOT IN (SELECT UserID FROM UserInfo WHERE IsDelete IS NOT NULL)
            AND (UP.IsDelete IS NULL OR UP.IsDelete = 0);
    `;

    try {
        const [rows] = await dbConnection.query(selectQuery);

        return rows;
    } catch (error) {
        console.error("Error fetching customer list for loan:", error);
        throw new Error("An error occurred while retrieving the customer list for loan.");
    };
}
async function getCustomer(hashId) {
    const selectQuery = `
        SELECT
            U.FirstName AS firstName,
            U.LastName AS lastName,
            U.Email AS email,
            UA.PhoneNumber AS phoneNumber,
            UA.StreetAddress,
            UA.City,
            UA.State,
            UA.ZipCode,
            UA.Country,
            UA.SecondPhoneNumber AS secondPhoneNumber,
            CONCAT(Creator.FirstName, ' ', Creator.LastName) AS adminFullName,
            CASE
                WHEN UPay.IsActive = FALSE THEN FALSE
                WHEN UPay.IsActive = TRUE AND NOT EXISTS (
                    SELECT 1
                    FROM LoanInfo LI
                    JOIN LoanPayment LP ON LI.LoanID = LP.LoanID
                    WHERE LI.UserID = U.UserID
                    AND (LP.Status = 'Active' OR LP.Status = 'Pending')
                ) THEN FALSE
                ELSE TRUE
            END AS isActive,
            CASE
                WHEN UPay.IsVerified IS NULL THEN 'NotVerified'
                ELSE 'Verified'
            END AS verify,
            UP.UserHashID AS userHashId
        FROM
            UserPass UP
        JOIN
            UserInfo U ON UP.UserID = U.UserID
        JOIN
            UserAddress UA ON U.UserID = UA.UserID
        JOIN
            UserInfo Creator ON U.CreatedBy = Creator.UserID
        JOIN
            UserPayment UPay ON U.UserID = UPay.UserID
        WHERE
            UP.UserHashID = ?;
    `;
    try {
        const [rows] = await dbConnection.query(selectQuery, [hashId])
        if (rows.length > 0) {
            return rows[0];
        } else {
            console.error("Error fetching customer:", error);
            throw error;
        }
    } catch (error) {
        console.error("Error fetching customer:", error);
        throw error;
    }
}



module.exports = {
    getCustomerList,
    getCustomerListForLoan,
    getCustomer,
};
