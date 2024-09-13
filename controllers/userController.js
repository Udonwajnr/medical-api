const asyncHandler = require("express-async-handler");
const User = require("../model/user");
const Medication = require("../model/medication");
const Hospital = require("../model/hospital"); // Import the Hospital model
const mongoose = require("mongoose");

// Get all users for a specific hospital
const getUsersByHospital = asyncHandler(async (req, res) => {
  const { hospitalId } = req.params;
  const users = await User.find({ hospital: hospitalId }).populate("medication");
  return res.status(200).json(users);
});

// Get a single user in a specific hospital
const getUserInHospital = asyncHandler(async (req, res) => {
  const { hospitalId, userId } = req.params;

  // Validate ObjectIDs
  if (!mongoose.Types.ObjectId.isValid(hospitalId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // Fetch the user within the specified hospital
  const user = await User.findOne({ _id: userId, hospital: hospitalId });

  // Check if user exists
  if (!user) {
    return res.status(404).json({ message: "User not found in the specified hospital" });
  }

  // Return the user
  return res.status(200).json(user);
});

// Create a new user for a specific hospital
const createUserInHospital = asyncHandler(async (req, res) => {
  const { hospitalId } = req.params;
  const { fullName, dateOfBirth, gender, phoneNumber, email, medication } = req.body;

  // Validate the ObjectID for hospital
  if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
    return res.status(400).json({ message: 'Invalid Hospital ID format' });
  }

   // Check if the hospital exists
   const hospitalDoc = await Hospital.findById(hospitalId);
   if (!hospitalDoc) {
       return res.status(404).json({ message: 'Hospital not found' });
   }

  // Create the new user
  const user = new User({
    fullName,
    dateOfBirth,
    gender,
    phoneNumber,
    email,
    medication,
    hospital: hospitalId,
  });

  await user.save();


  hospitalDoc.users.push(user._id);

    // Save the updated hospital document
  await hospitalDoc.save();

    // return the newly created user
  res.status(201).json(user);
});

// Update a user in a specific hospital
const updateUserInHospital = asyncHandler(async (req, res) => {
  const { hospitalId, userId } = req.params;

  // Validate ObjectIDs
  if (!mongoose.Types.ObjectId.isValid(hospitalId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // Check if the user exists within the specified hospital
  const user = await User.findOne({ _id: userId, hospital: hospitalId });
  if (!user) {
    return res.status(404).json({ message: "User not found in the specified hospital" });
  }

  // Update the user
  const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  });

  // Return the updated user
  return res.status(200).json(updatedUser);
});

// Delete a user in a specific hospital
const deleteUserInHospital = asyncHandler(async (req, res) => {
  const { hospitalId, userId } = req.params;

  // Validate ObjectIDs
  if (!mongoose.Types.ObjectId.isValid(hospitalId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // Check if the user exists within the specified hospital
  const user = await User.findOne({ _id: userId, hospital: hospitalId });
  if (!user) {
    return res.status(404).json({ message: "User not found in the specified hospital" });
  }

  // Delete the user

  const hospital = await Hospital.findById(hospitalId);
  if (hospital) {
      hospital.users.pull(user._id);
      await hospital.save();
  }

  await User.findByIdAndDelete(userId);
  return res.status(200).json({ msg: `User with ID ${userId} has been deleted from hospital ${hospitalId}` });
});

// Add medication to a user in a specific hospital
const addMedicationToUserInHospital = asyncHandler(async (req, res) => {
  const { hospitalId, userId, medicationId } = req.params;

  // Validate ObjectIDs
  if (!mongoose.Types.ObjectId.isValid(hospitalId) || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(medicationId)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  await User.findOneAndUpdate(
    { _id: userId, hospital: hospitalId },
    { $addToSet: { medication: medicationId } },
    { new: true }
  );

  await Medication.findByIdAndUpdate(
    medicationId,
    { $addToSet: { user: userId } },
    { new: true }
  );

  res.status(200).json({ message: "Medication added to user successfully" });
});

// Remove medication from a user in a specific hospital
const removeMedicationFromUserInHospital = asyncHandler(async (req, res) => {
  const { hospitalId, userId, medicationId } = req.params;

  // Validate ObjectIDs
  if (!mongoose.Types.ObjectId.isValid(hospitalId) || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(medicationId)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  await User.findOneAndUpdate(
    { _id: userId, hospital: hospitalId },
    { $pull: { medication: medicationId } },
    { new: true }
  );

  await Medication.findByIdAndUpdate(
    medicationId,
    { $pull: { user: userId } },
    { new: true }
  );

  res.status(200).json({ message: "Medication removed from user successfully" });
});

// Get all users associated with a specific medication in a hospital
const getUsersWithMedicationInHospital = asyncHandler(async (req, res) => {
  const { hospitalId, medicationId } = req.params;

  // Validate ObjectIDs
  if (!mongoose.Types.ObjectId.isValid(hospitalId) || !mongoose.Types.ObjectId.isValid(medicationId)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  const medication = await Medication.findById(medicationId).populate({
    path: "user",
    match: { hospital: hospitalId },
  });

  if (!medication) {
    return res.status(404).json({ message: "Medication not found" });
  }

  res.status(200).json(medication.user);
});

// Search users by name or other criteria within a specific hospital
const searchUsersInHospital = asyncHandler(async (req, res) => {
  const { hospitalId } = req.params;
  const { query } = req.query;

  // Validate the ObjectID for hospital
  if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ message: 'Invalid Hospital ID format' });
  }

  // Find users associated with the specified hospital
  const users = await User.find({
      hospital: hospitalId,
      $or: [
          { name: { $regex: query, $options: 'i' } },
          // Add other fields if needed
      ]
  });

  if (!users.length) {
      return res.status(404).json({ message: 'No users found for the specified hospital' });
  }

  res.status(200).json(users);
});

// Search users by name or other criteria across all hospitals
const searchUsersAcrossHospitals = asyncHandler(async (req, res) => {
  const { query } = req.query;

  // Find users across all hospitals
  const users = await User.find({
      $or: [
          { name: { $regex: query, $options: 'i' } },
          // Add other fields if needed
      ]
  });

  if (!users.length) {
      return res.status(404).json({ message: 'No users found across all hospitals' });
  }

  res.status(200).json(users);
});



module.exports = {
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
};
