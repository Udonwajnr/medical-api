const asyncHandler = require("express-async-handler");
const User = require("../model/user");
const Medication = require("../model/medication");
const Hospital = require("../model/hospital"); // Import the Hospital model
const mongoose = require("mongoose");
const Purchase = require("../model/purchase")
const sendEmailWithICS = require("../middleware/calenderEmail")
const generateICSFile = require("../middleware/generateICSFile")

// Get all users for a specific hospital
const getUsersByHospital = asyncHandler(async (req, res) => {
  const { hospitalId } = req.params;
  const users = await User.find({ hospital: hospitalId }).populate({path:"medications",populate:{path:"medication"}}).populate("purchases");
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
  const user = await User.findOne({ _id: userId, hospital: hospitalId }).populate({path:"medications",populate:{path:"medication"}}).populate("purchases");

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
  const { fullName, dateOfBirth, gender, phoneNumber, email, medications } = req.body;

  // Validate the ObjectID for hospital
  if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
    return res.status(400).json({ message: 'Invalid Hospital ID format' });
  }

  // Check if the hospital exists
  const hospitalDoc = await Hospital.findById(hospitalId);
  if (!hospitalDoc) {
    return res.status(404).json({ message: 'Hospital not found' });
  }

  // Check if a user with the same full name already exists in the hospital
  const existingUser = await User.findOne({ fullName, hospital: hospitalId });
  if (existingUser) {
    return res.status(409).json({ message: 'User with this full name already exists in this hospital' });
  }

  // Validate that medications is an array and has the correct structure
  if (!Array.isArray(medications)) {
    return res.status(400).json({ message: 'Medications must be an array' });
  }

  // Ensure each medication object has a valid structure and check availability
  const medicationObjects = [];
  let totalPurchase = 0; // Initialize total purchase cost to 0
  for (const med of medications) {
    if (!med.medication || !mongoose.Types.ObjectId.isValid(med.medication)) {
      return res.status(400).json({ message: 'Invalid medication ID' });
    }

    // Find the medication in the database
    const medicationDetails = await Medication.findById(med.medication);
    if (!medicationDetails) {
      return res.status(404).json({ message: `Medication with ID ${med.medication} not found` });
    }

    // Check if the medication is associated with the hospital
    if (!medicationDetails.hospital.includes(hospitalId)) {
      return res.status(404).json({ message: `Medication ${medicationDetails.nameOfDrugs} is not available in this hospital` });
    }

    // Check if the medication is in stock and available in the required quantity
    const quantityRequested = med.quantity || 1;
    if (medicationDetails.quantityInStock < quantityRequested) {
      return res.status(400).json({ message: `Not enough stock for medication ${medicationDetails.nameOfDrugs}` });
    }

    // Create the medication object to push to the user
    medicationObjects.push({
      medication: med.medication,
      quantity: quantityRequested,
      startDate: med.startDate || Date.now(),
      endDate: med.endDate,
      current: med.current !== undefined ? med.current : true,
    });

    // Calculate the total purchase cost (price * quantity) for each medication
    totalPurchase += medicationDetails.price * quantityRequested;

    // Reduce the medication stock
    medicationDetails.quantityInStock -= quantityRequested;
    await medicationDetails.save(); // Save the updated medication stock
  }

  // Create the new user
  const user = new User({
    fullName,
    dateOfBirth,
    gender,
    phoneNumber,
    email,
    medications: medicationObjects,
    hospital: [hospitalId],
  });

  try {
    // Save the new user to the database
    const savedUser = await user.save();

    // Create a purchase for the user
    const purchase = new Purchase({
      user: savedUser._id,
      medications: medicationObjects.map(med => ({
        medication: med.medication,
        quantity: med.quantity,
        startTime: Date.now(),
      })),
      hospital: hospitalId,
      totalPurchase: totalPurchase, // Use the correctly calculated total cost
    });

    // Save the purchase to the database
    const savedPurchase = await purchase.save();

    // Push the purchase ID into the user's purchases array
    savedUser.purchases.push(savedPurchase._id);
    await savedUser.save(); // Save the updated user document

    // Email logic
    if (savedUser.email) {
      // Generate the ICS file for the user
      const icsFilePath = await generateICSFile(purchase._id);

      if (icsFilePath) {
        // Send the email with ICS attachment
        await sendEmailWithICS(savedUser.email, icsFilePath, medications);
      }
    }

    // Add the user and purchase to the hospital's respective lists
    hospitalDoc.users.push(savedUser._id);
    hospitalDoc.purchaseHistory.push(savedPurchase._id); // Ensure purchaseHistory field exists in the hospital schema

    // Save the updated hospital document
    await hospitalDoc.save();

    // Return the newly created user info
    res.status(201).json({
      user: savedUser,
    });
  } catch (error) {
    console.error('Error saving user and purchase:', error);
    res.status(500).json({ message: 'Failed to create user and purchase' });
  }
});

// Update a user in a specific hospital
const updateUserInHospital = asyncHandler(async (req, res) => {
  const { hospitalId, userId } = req.params;
  const { fullName, dateOfBirth, gender, phoneNumber, email, medications, newMedications } = req.body;

  console.log(medications, newMedications)
  // Validate the ObjectIDs for hospital and user
  if (!mongoose.Types.ObjectId.isValid(hospitalId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid Hospital ID or User ID format' });
  }

  // Check if the hospital exists
  const hospitalDoc = await Hospital.findById(hospitalId);
  if (!hospitalDoc) {
    return res.status(404).json({ message: 'Hospital not found' });
  }

  // Check if the user exists in the hospital
  const userDoc = await User.findOne({ _id: userId, hospital: hospitalId });
  if (!userDoc) {
    return res.status(404).json({ message: 'User not found in this hospital' });
  }

  // Update user details if provided
  if (fullName) userDoc.fullName = fullName;
  if (dateOfBirth) userDoc.dateOfBirth = dateOfBirth;
  if (gender) userDoc.gender = gender;
  if (phoneNumber) userDoc.phoneNumber = phoneNumber;
  if (email) userDoc.email = email;

  // Handle existing medications update if provided
  if (Array.isArray(medications)) {
    for (const med of medications) {
      if (!med.medication || !mongoose.Types.ObjectId.isValid(med.medication)) {
        return res.status(400).json({ message: 'Invalid medication ID' });
      }

      const existingMedication = userDoc.medications.find(
        (m) => m.medication.toString() === med.medication
      );

      if (!existingMedication) {
        return res.status(404).json({ message: `Medication with ID ${med.medication} not found in user's list` });
      }
      // Update or remove the medication
      if (med.remove) {
        userDoc.medications = userDoc.medications.filter(
          (m) => m.medication.toString() !== med.medication
        );
      } else {
        existingMedication.quantity = med.quantity || existingMedication.quantity;
        existingMedication.startDate = med.startDate || existingMedication.startDate;
        existingMedication.endDate = med.endDate || existingMedication.endDate;
        existingMedication.current = med.current !== undefined ? med.current : existingMedication.current;
      }
    }
  }
  
  // Handle new medications if provided
  if (Array.isArray(newMedications)) {
    for (const med of newMedications) {
      if (!med.medication || !mongoose.Types.ObjectId.isValid(med.medication)) {
        return res.status(400).json({ message: 'Invalid medication ID' });
      }

      // Check if the medication exists in the hospital's medication list
      const medicationExistsInHospital = hospitalDoc.medication.includes(med.medication);
      if (!medicationExistsInHospital) {
        return res.status(404).json({ message: `Medication with ID ${med.medication} does not exist in this hospital` });
      }

      const medicationDetails = await Medication.findById(med.medication);
      if (!medicationDetails) {
        return res.status(404).json({ message: `Medication with ID ${med.medication} not found` });
      }

      const quantityRequested = med.quantity || 1;

      // Check stock availability for the requested quantity
      if (medicationDetails.quantityInStock < quantityRequested) {
        return res.status(400).json({ message: `Not enough stock for medication ${medicationDetails.nameOfDrugs}` });
      }

      // Reduce the medication stock
      medicationDetails.quantityInStock -= quantityRequested;
      await medicationDetails.save(); // Save the updated medication stock

      // Create the new medication object
      const newMedication = {
        medication: med.medication,
        quantity: quantityRequested,
        startDate: med.startDate || Date.now(),
        endDate: med.endDate,
        current: med.current !== undefined ? med.current : true,
      };

      // Add the new medication to the user's medications
      userDoc.medications.push(newMedication);

      // Calculate total cost for the purchase
      const totalPurchase = medicationDetails.price * quantityRequested;

      // Only create a purchase when adding new medication
      const purchase = new Purchase({
        user: userDoc._id,
        medications: [{
          medication: med.medication,
          quantity: quantityRequested,
          startTime: Date.now(),
        }],
        hospital: hospitalId,
        totalPurchase: totalPurchase, // Save the total cost
      });

      // Save the purchase to the database
      const savedPurchase = await purchase.save();

      // Update the hospital's purchase history
      hospitalDoc.purchaseHistory = hospitalDoc.purchaseHistory || []; // Ensure purchaseHistory field exists
      hospitalDoc.purchaseHistory.push(savedPurchase._id);
      await hospitalDoc.save(); // Save the updated hospital document

      // Generate the ICS file for the purchase
      const icsFilePath = await generateICSFile(savedPurchase._id);

      if (icsFilePath) {
          // Send the email with ICS attachment
          await sendEmailWithICS(userDoc.email, icsFilePath, newMedication);
      }
    }
  }

  try {
    // Save the updated user document
    const updatedUser = await userDoc.save();

    // Return the updated user info
    res.status(200).json({
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
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
