const express = require("express")
const router = express.Router()
const {getAllMedications,getMedication,createMedication,deleteMedication,updateMedication,addDrugsToUser,addMedicationToUser,removeMedicationFromUser,findUsersWithDrug} = require("../controllers/medicationController")

router.route("/").get(getAllMedications)
router.route("/:id").get(getMedication)
router.route("/").post(createMedication)
router.route("/:id").put(updateMedication)
router.route("/:id").delete(deleteMedication)


module.exports = router