const express = require("express");
// const dropboxRouter = require("../controllers/dropboxController");
const dropboxRouter = require("../controllers/dropboxController");

const router = express.Router();

router.post("/getprogress", dropboxRouter.getFileList);
router.post("/createapplication", dropboxRouter.createApplication);
router.post("/downloadfile", dropboxRouter.downloadFile);
router.post("/sharefile", dropboxRouter.shareFile);
router.post("/getfilebinary", dropboxRouter.downloadIndividualFile);
router.post("/viewapplication", dropboxRouter.viewApplications);

module.exports = router;