const express = require("express");
const router = express.Router();
const { sendMedicationReminderEmail } = require("../controllers/emailController");
const {authenticateToken} = require("../middleware/authenticationToken"); // Ensure correct import

// Route to send medication reminder email
// Authentication middleware is applied
router.post("/", authenticateToken, sendMedicationReminderEmail);

module.exports = router;
