const express = require("express")
const router = express.Router()
const {sendMedicationReminderEmail} = require("../controllers/emailController")

router.route("/").post(sendMedicationReminderEmail)

module.exports = router