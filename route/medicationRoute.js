const express = require("express");
const router = express.Router();
const {
    getAllMedications,
    getMedication,
    getUserMedicationData,
    createMedication,
    updateMedication,
    deleteMedication,
    searchMedications
} = require("../controllers/medicationController");

router.get("/search", searchMedications);
// Route to get all medications
router.get("/", getAllMedications);

// Route to get a specific medication by ID
router.get("/:id", getMedication);

// Route to get all medications for a specific user
router.get("/user/:id/medications", getUserMedicationData);

// Route to create a new medication
router.post("/", createMedication);

// Route to update a medication by ID
router.put("/:id", updateMedication);

// Route to delete a medication by ID
router.delete("/:id", deleteMedication);

module.exports = router;
