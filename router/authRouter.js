const express = require("express");

const router = express.Router();

const {signUp,vrifyUser, login, forgetPassword, resetPassword} = require("../controllers/authController")

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/forgotpassword").post(forgetPassword);
router.route("/resetpassword/:resetToken").post(resetPassword);
router.route("/verify").post(vrifyUser)



module.exports = router;