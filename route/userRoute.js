const express = require("express")
const router = express.Router()
const {getUser,getAllUsers,createUser,updateUser,deleteUser} = require("../controllers/userController")

router.route("/:id").get(getUser)
router.route("/").get(getAllUsers)
router.route("/").post(createUser)
router.route("/:id").put(updateUser)
router.route("/:id").delete(deleteUser)


module.exports = router