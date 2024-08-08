const asyncHandler = require("express-async-handler")
const Medication = require("../model/medication")
const User = require("../model/user")
const mongoose = require("mongoose")

const getAllMedications=asyncHandler(async(req,res)=>{
    const medications = await Medication.find().populate("user")
    return res.status(200).json(medications)
})

const getMedication=asyncHandler(async(req,res)=>{
    const { id } = req.params;
    // Validate the ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Medication ID format' });
      }
          // Fetch the medication from the database
        const medication = await Medication.findById(id);
    
        // Check if medication exists
        if (!medication) {
          return res.status(404).json({ message: 'Medication not found' });
        }
        // Return the Medication
        return res.status(200).json(medication);
})

const createMedication = asyncHandler(async(req,res)=>{
   const {nameOfDrugs,dosage,frequency,time,user,notes,reminderSent} = req.body;
   const medication = new Medication({nameOfDrugs,dosage,frequency,time,user,notes,reminderSent})
   await medication.save()
   res.status(200).json(medication)
})

const updateMedication = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    // Validate the ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Medication ID format' });
    }
  
      // Check if the Medication exists
      const medication = await Medication.findById(id);
      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }
      // Update the Medication
      const updatedMedication = await Medication.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  
      // Return the updated Medication
      return res.status(200).json(updatedMedication);
})

const deleteMedication =asyncHandler(async(req,res)=>{
    const {id} = req.params
    
    const medication = await Medication.findById(id)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Medication ID format' });
    }

    if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }   
    await Medication.findByIdAndDelete(id)
    return res.status(200).json({msg:`${id} has been deleted`})
})


const getUserMedicationData = asyncHandler(async(req,res)=>{
    const {id} = req.params
    const user = await User.findById(id);
    const medications = await Medication.find({ id: user._id });
    res.status(200).json({ user, medications });
  })

module.exports={getAllMedications,getMedication,createMedication,deleteMedication,updateMedication,getUserMedicationData}