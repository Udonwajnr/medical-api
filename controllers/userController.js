const asyncHandler = require("express-async-handler")
const User = require("../model/user")
const mongoose = require("mongoose")

const getAllUsers = asyncHandler(async(req,res)=>{
    const users = await User.find()
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


module.exports = {getUser,getAllUsers,createUser,updateUser,deleteUser}