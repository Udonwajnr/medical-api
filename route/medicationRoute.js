const express = require("express");
const router = express.Router();
const {
    getAllMedicationsAcrossHospitals,
    getAllMedicationsOfHospital,
    getMedicationOfHospital,
    createMedicationForHospital,
    updateMedicationOfHospital,
    deleteMedicationOfHospital,
    getUserMedicationDataOfHospital,
    searchMedicationsOfHospital
} = require("../controllers/medicationController");

// Route to get all medications across all hospitals
router.get("/all", getAllMedicationsAcrossHospitals);

// Route to search medications within a specific hospital
router.get("/:hospitalId/search", searchMedicationsOfHospital);

// Route to get all medications for a specific hospital
router.get("/:hospitalId/medications", getAllMedicationsOfHospital);

// Route to get a specific medication by ID within a specific hospital
router.get("/:hospitalId/medications/:id", getMedicationOfHospital);

// Route to get all medications for a specific user within a specific hospital
router.get("/:hospitalId/user/:userId/medications", getUserMedicationDataOfHospital);

// Route to create a new medication for a specific hospital
router.post("/:hospitalId/medications", createMedicationForHospital);

// Route to update a medication by ID within a specific hospital
router.put("/:hospitalId/medications/:id", updateMedicationOfHospital);

// Route to delete a medication by ID within a specific hospital
router.delete("/:hospitalId/medications/:id", deleteMedicationOfHospital);

module.exports = router;
