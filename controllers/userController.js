const asyncHandler = require("express-async-handler")
const User = require("../model/user")
const mongoose = require("mongoose")
const Medication=require("../model/medication")

const getAllUsers = asyncHandler(async(req,res)=>{
    const users = await User.find().populate("medication")
    return res.status(200).json(users)
})

const getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    // Validate the ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
        // Fetch the user from the database
      const user = await User.findById(id);
  
      // Check if user exists
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Return the user
      return res.status(200).json(user);
     
  });

const createUser = asyncHandler(async(req,res)=>{
    const {fullName,dateOfBirth,gender,phoneNumber,email,medication} = req.body
    const user = new User({fullName,dateOfBirth,gender,phoneNumber,email,medication})
    await user.save()
    res.status(200).json(user)
})

const updateUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
      
        // Validate the ObjectID
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: 'Invalid user ID format' });
        }
      
          // Check if the user exists
          const user = await User.findById(id);
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
      
          // Update the user
          const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      
          // Return the updated user
          return res.status(200).json(updatedUser);
})

const deleteUser =asyncHandler(async(req,res)=>{
    const {id} = req.params
    
    const user = await User.findById(id)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }    

    await User.findByIdAndDelete(id)
    return res.status(200).json({msg:`${id} has been deleted`})
})


const addMedicationToUser=asyncHandler(async(req,res)=>{
  const { userId, medicationId } = req.params;
  
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { medication: medicationId } },
        { new: true }
      );
      
      await Medication.findByIdAndUpdate(
        medicationId,
        { $addToSet: { user: userId } },
        { new: true }
      );
      res.status(200).json({ message: 'Medication added to user successfully' });
})

const removeMedicationFromUser = async (req, res) => {
  const { userId, medicationId} = req.params;

  // Remove the drug reference from the user's drugs array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { medication: medicationId } }, // $pull removes the specified value
      { new: true }
    );
    
    // Remove the user reference from the drug's users array
    await Medication.findByIdAndUpdate(
      medicationId,
      { $pull: { user: userId } }, // $pull removes the specified value
      { new: true }
    );

    console.log('Drug removed from user and vice versa successfully');
    return res.status(200).json({msg:"Drug removed from user and vice versa successfully"})
  }

  const findUsersWithDrug =  async (req, res) => {
      const { medicationId } = req.params;
      try {
        const medication = await Medication.findById(medicationId).populate('user');
        
        if (!medication) {
          return res.status(404).json({ message: 'Drug not found' });
        }
        res.status(200).json(medication.user);
      } catch (err) {
        res.status(500).json({ message: 'Error finding users with drug', error: err.message });
      }
    };

module.exports = {getUser,getAllUsers,createUser,updateUser,deleteUser,addMedicationToUser,removeMedicationFromUser,findUsersWithDrug}