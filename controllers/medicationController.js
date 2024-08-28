const asyncHandler = require("express-async-handler");
const Medication = require("../model/medication");
const User = require("../model/user");
const mongoose = require("mongoose");

// Get all medications with populated user and hospital fields
const getAllMedications = asyncHandler(async (req, res) => {
    const medications = await Medication.find()
        .populate("user")
        .populate("hospital"); // Populate hospital field
    return res.status(200).json(medications);
});

// Get a single medication by ID with populated user and hospital fields
const getMedication = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate the ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Medication ID format' });
    }

    // Fetch the medication from the database with populated fields
    const medication = await Medication.findById(id)
        .populate("user")
        .populate("hospital");

    // Check if medication exists
    if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
    }

    // Return the Medication
    return res.status(200).json(medication);
});

// Create a new medication for a specific hospital
const createMedication = asyncHandler(async (req, res) => {
    const { nameOfDrugs, dosage, frequency, time, hospital, notes, reminderSent } = req.body;

    // Validate the ObjectID for hospital
    if (!mongoose.Types.ObjectId.isValid(hospital)) {
        return res.status(400).json({ message: 'Invalid Hospital ID format' });
    }

    // Create the new medication
    const medication = new Medication({ nameOfDrugs, dosage, frequency, time, hospital, notes, reminderSent });
    await medication.save();

    // Return the newly created Medication
    res.status(201).json(medication);
});

// Update a medication by ID
const updateMedication = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate the ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Medication ID format' });
    }

    // Validate the ObjectID for hospital if provided in the update body
    if (req.body.hospital && !mongoose.Types.ObjectId.isValid(req.body.hospital)) {
        return res.status(400).json({ message: 'Invalid Hospital ID format' });
    }

    // Check if the Medication exists
    const medication = await Medication.findById(id);
    if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
    }

    // Update the Medication
    const updatedMedication = await Medication.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        .populate("user")
        .populate("hospital");

    // Return the updated Medication
    return res.status(200).json(updatedMedication);
});

// Delete a medication by ID
const deleteMedication = asyncHandler(async (req, res) => {
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

    await Medication.findByIdAndDelete(id);
    return res.status(200).json({ msg: `Medication with ID ${id} has been deleted` });
});

// Get medications for a specific user
const getUserMedicationData = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate the ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid User ID format' });
    }

    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const medications = await Medication.find({ user: id })
        .populate("hospital"); // Populate hospital field if needed

    res.status(200).json({ user, medications });
});

const searchMedications = asyncHandler(async (req, res) => {
  const { query } = req.query;

  const medications = await Medication.find({
      $or: [
          { nameOfDrugs: { $regex: query, $options: 'i' } },
          { barcode: { $regex: query, $options: 'i' } },
      ],
  });

  res.status(200).json(medications);
});

module.exports = {
    getAllMedications,
    getMedication,
    createMedication,
    updateMedication,
    deleteMedication,
    getUserMedicationData,
    searchMedications
};
