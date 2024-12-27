const installService = require('../Services/install.service');
async function install(req, res) {
    try {
        const installMessage = await installService.install();

        if (installMessage.status === 200) {
            res.status(200).json({
                message: installMessage
            });
        } else {
            res.status(500).json({
                message: installMessage
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}
module.exports = { install };
