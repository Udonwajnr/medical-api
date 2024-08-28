const express = require("express")
const router = express.Router()
const {createHospital,verifyEmail,loginHospital,forgotPassword,resetPassword} = require("../controllers/HospitalAuthenticationController")

router.route("/").post(createHospital)
router.route("/verify-email/:token").get(verifyEmail)
router.route("/login").post(loginHospital)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password').post(resetPassword)

module.exports=router