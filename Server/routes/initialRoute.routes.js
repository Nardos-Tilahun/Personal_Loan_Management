const express = require("express");
const router = express.Router();
const { install } = require("../Controller/install");

router.get(process.env.INSTALL, install);


module.exports = router;