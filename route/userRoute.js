const express = require("express")
const router = express.Router()
const {getUser,getAllUsers,createUser,updateUser,deleteUser,addMedicationToUser,removeMedicationFromUser,findUsersWithDrug} = require("../controllers/userController")

router.route("/:id").get(getUser)
router.route("/").get(getAllUsers)
router.route("/").post(createUser)
router.route("/:id").put(updateUser)
router.route("/:id").delete(deleteUser)
router.route("/:userId/medication/:medicationId").post(addMedicationToUser)
router.route("/:userId/medication/:medicationId").delete(removeMedicationFromUser)
router.route("/medication/:medicationId/").get(findUsersWithDrug)


module.exports = router