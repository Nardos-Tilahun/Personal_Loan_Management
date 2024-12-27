const { StatusCodes } = require("http-status-codes");
const { verifyMyToken } = require("../Utilities/tokenVerifcation");

async function authMiddleware(req, res, next) {
    try {
        const token = req.headers['x-access-token'];
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Token is missing" });
        }

        const decodedToken = await verifyMyToken(token, process.env.SECRETE_KEY);
        if (!decodedToken) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid token" });
        }

        req.decodedToken = decodedToken;
        next();
    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Authentication failed" });
    }
}

module.exports = { authMiddleware };
