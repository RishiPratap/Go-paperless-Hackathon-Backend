const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

// /api/users/........
router.post("/createnewuser", userController.user_register);
router.post("/getmyapplications", userController.get_my_applications);



// CONTACTS ///// ////// ////////////////////////////////////////////////////////
router.post("/getmycontacts", userController.getContacts);
router.post("/addcontact", userController.create_new_contact);
router.post("/getusersinorg", userController.get_contacts_in_same_org);
router.post("/deletecontact", userController.delete_contact);
////////////////////////////////////////////////////////////////////////////////



// router.post("/updateroomstatus", userController.updateUser);
// router.post("/addfloor", userController.addFloor);
// just made it in case we decide to make a admin portal
// router.post("/all", userController.getAllUsers);
module.exports = router;