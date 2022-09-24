const express = require("express");
// const dropboxRouter = require("../controllers/dropboxController");
const helloSignController = require("../controllers/helloSignController");

const router = express.Router();

router.post("/getsignurl", helloSignController.get_sign_url);

module.exports = router;