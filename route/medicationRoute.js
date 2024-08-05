const express = require("express")
const router = express.Router()
const {getAllMedications} = require("../controllers/medicationController")

router.route("/").get(getAllMedications)


module.exports = router