const express = require("express");
// const dropboxRouter = require("../controllers/dropboxController");
const dropboxRouter = require("../controllers/dropboxController");

const router = express.Router();

router.post("/getfiles", dropboxRouter.getFileList);
router.post("/createapplication", dropboxRouter.createApplication);
router.post("/downloadfile", dropboxRouter.downloadFile);
router.post("/sharefile", dropboxRouter.shareFile);

module.exports = router;