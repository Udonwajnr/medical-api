const express = require("express");
const router = express.Router();
const {
    getAllRegimensForHospital,
    createRegimen,
    updateRegimen,
    deleteRegimen
} = require("../controllers/userSpecificMedicationRegimenController");

// Get all regimens for a specific hospital
router.get("/hospitals/:hospitalId/regimens", getAllRegimensForHospital);

// Create a new regimen
router.post("/regimens", createRegimen);

// Update an existing regimen
router.put("/regimens/:regimenId", updateRegimen);

// Delete a regimen
router.delete("/regimens/:regimenId", deleteRegimen);

module.exports = router;
