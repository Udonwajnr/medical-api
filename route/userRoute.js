const express = require("express");
const router = express.Router();
const {
    getUsersByHospital,
    getUserInHospital,
    createUserInHospital,
    updateUserInHospital,
    deleteUserInHospital,
    addMedicationToUserInHospital,
    removeMedicationFromUserInHospital,
    getUsersWithMedicationInHospital,
    searchUsersInHospital,
    searchUsersAcrossHospitals,
} = require("../controllers/userController");
const {authenticateToken} = require("../middleware/authenticationToken");

// Apply authentication to all routes
router.use(authenticateToken);

// Get all users for a specific hospital
router.get('/hospitals/:hospitalId/users', getUsersByHospital);

// Get a single user in a specific hospital
router.get('/hospitals/:hospitalId/users/:userId', getUserInHospital);

// Route to get all users associated with a specific hospital
router.get("/hospital/:hospitalId/users", getUsersByHospital);

// This route retrieves details of a single user identified by 'userId' within the hospital specified by 'hospitalId'.
router.get("/hospital/:hospitalId/users/:userId", getUserInHospital);

// This route creates a new user associated with the hospital specified by 'hospitalId'.
router.post("/hospital/:hospitalId/users", createUserInHospital);

// This route updates details of an existing user identified by 'userId' within the hospital specified by 'hospitalId'.
router.put("/hospital/:hospitalId/users/:userId", updateUserInHospital);

// This route deletes the user identified by 'userId' from the hospital specified by 'hospitalId'.
router.delete("/hospital/:hospitalId/users/:userId", deleteUserInHospital);

// This route adds a specific medication identified by 'medicationId' to a user identified by 'userId' in the hospital specified by 'hospitalId'.
router.post("/hospital/:hospitalId/users/:userId/medication/:medicationId", addMedicationToUserInHospital);

// This route removes a specific medication identified by 'medicationId' from a user identified by 'userId' in the hospital specified by 'hospitalId'.
router.delete("/hospital/:hospitalId/users/:userId/medication/:medicationId", removeMedicationFromUserInHospital);

// This route retrieves a list of all users associated with a specific medication identified by 'medicationId' within the hospital specified by 'hospitalId'.
router.get("/hospital/:hospitalId/medication/:medicationId/users", getUsersWithMedicationInHospital);

module.exports = router;
