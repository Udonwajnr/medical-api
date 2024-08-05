const asyncHandler = require("express-async-handler")
const Medication = require("../model/medication")
const mongoose = require("mongoose")

const getAllMedications=asyncHandler(async(req,res)=>{
    const medications = await Medication.find()
    return res.status(200).json(medications)
})

const getMedication=asyncHandler(async(req,res)=>{
    const { id } = req.params;
    // Validate the ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }
          // Fetch the medication from the database
        const medication = await Medication.findById(id);
    
        // Check if medication exists
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Return the Medication
        return res.status(200).json(medication);
})

const createMedication = asyncHandler(async(req,res)=>{
 const {} = req.body;
})


module.exports={getAllMedications,getMedication}