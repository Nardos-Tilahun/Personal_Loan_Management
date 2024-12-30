const fs = require('fs');
const dbConnection = require("../Config/dbConfig.js");
const { hashIdForRoute, hashAndSavePassword, saveUserAddress, createUserPayment } = require('../Services/userService/userCreateOperation')
async function registerAdmin() {
    try {
        const userData = {
            "contactInformation": {
                "phoneNumber": "",
                "secondPhoneNumber": "",
                "streetAddress": "",
                "city": "",
                "state": "",
                "country": "",
                "zipCode": ""
            },
            "roleInformation": {
                "userRoleName": "Admin"
            }
        }

        const email = "admin@email.com";

        const emailExistsQuery = "SELECT COUNT(*) AS count FROM UserInfo WHERE Email = ?";
        const [rows] = await dbConnection.query(emailExistsQuery, [email]);


        const emailExists = rows[0].count > 0;

        if (emailExists) {
            return;
        }

        const createAdminQuery = `INSERT INTO UserInfo (FirstName, LastName, Email, Date_Created, UserRoleId, UserImage, CreatedBy) VALUES ('admin', 'admin', ?, CURRENT_TIMESTAMP, 1, null, 1)`;

        try {
            [result] = await dbConnection.query(createAdminQuery, [email]);
        } catch (error) {
            console.error("Error creating admin:", error);
            throw error;
        }

        let adminId;
        if (result && result.insertId) {
            const adminId = result.insertId;

            const hashedUserId = hashIdForRoute(adminId.toString(), 25);

            try {
                await createUserPayment(adminId);
                await saveUserAddress(adminId, userData);
                await hashAndSavePassword(adminId, hashedUserId, "admin");
            } catch (err) {
                console.error(err);
            }
        } else {
            throw new Error("Failed to create Admin");
        }

        return;
    } catch (error) {
        throw new Error(error);
    }
}
async function install() {
    const queryfile = __dirname + '/sql/initial-queries.sql';
    let queries = [];
    let finalMessage = {};
    let templine = '';
    const lines = fs.readFileSync(queryfile, 'utf-8').split('\n');
    const executed = await new Promise((resolve, reject) => {
        lines.forEach((line) => {
            if (line.trim().startsWith('--') || line.trim() === '') {
                return;
            }
            templine += line;
            if (line.trim().endsWith(';')) {

                const sqlQuery = templine.trim();
                queries.push(sqlQuery);
                templine = '';
            }
        });
        resolve("Queries are added to the list");
    });

    try {
        for (let i = 0; i < queries.length; i++) {
            let result = await dbConnection.query(queries[i]);

        }
        await registerAdmin();


    } catch (err) {
        finalMessage.message = "Not all tables are created";
    }

    if (!finalMessage.message) {
        finalMessage.message = "All tables are created";
        finalMessage.status = 200;
    } else {
        finalMessage.status = 500;
    }
    return finalMessage;
}
module.exports = { install };