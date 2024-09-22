const express = require("express")
const router = express.Router()
const {purchaseMedication} = require("../controllers/purchaseController")

router.post('/',purchaseMedication)

module.exports=router