const asyncHandler = require("express-async-handler");
const Medication = require("../model/medication");
const User = require("../model/user");
const mongoose = require("mongoose");
const Hospital = require("../model/hospital");
const Purchase = require("../model/purchase");
// const sendEmailReminder = require("../middleware/email")

const purchaseMedication = async (req, res) => {
    try {
        const { userId, medications, hospitalId } = req.body;

        // Validate input
        if (!userId || !hospitalId || !medications || !Array.isArray(medications)) {
            return res.status(400).json({ message: 'Invalid input data.' });
        }

        // Validate user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'Invalid user.' });
        }

        // Ensure medications is an array of objects with medication and quantity
        const medicationObjects = medications.map(med => ({
            medication: new mongoose.Types.ObjectId(med.medication), // convert to ObjectId without 'new'
            quantity: med.quantity || 1 // set default quantity if not provided
        }));
        

        // Validate hospital
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(400).json({ message: 'Invalid hospital.' });
        }

        // Create a new purchase
        const purchase = new Purchase({
            user: userId,
            medications: medicationObjects, // Pass the array of medication objects
            hospital: hospitalId
        });

        // Save the purchase
        await purchase.save();

        // Add the purchase to user's purchase history and save user document
        user.purchases.push(purchase._id);
        await user.save(); // Don't forget to save the updated user

        // Optionally, you can send an email reminder
        // await sendEmailReminder(user, medicationObjects);

        return res.status(201).json({ message: 'Purchase successful and email sent!' });
    } catch (error) {
        console.error('Error processing purchase:', error);
        return res.status(500).json({ message: 'Server error. Could not complete purchase.' });
    }
};

const getAllPurchasesFromHospital = asyncHandler(async (req, res) => {
    const { hospitalId } = req.params;

    try {
        const purchases = await Purchase.find({ hospital: hospitalId })
            .populate('user', 'name email') // Populate user data
            .populate('medications.medication', 'name dosage') // Populate medication data
            .populate('hospital', 'name'); // Populate hospital data

        if (!purchases.length) {
            return res.status(404).json({ message: 'No purchases found for this hospital.' });
        }

        res.status(200).json({ purchases });
    } catch (error) {
        res.status(500).json({ message: 'Server error. Could not fetch purchases.' });
    }
});

const getTotalPurchasedMedicationsFromHospital = asyncHandler(async (req, res) => {
    const { hospitalId } = req.params;

    try {
        const purchases = await Purchase.find({ hospital: hospitalId });

        if (!purchases.length) {
            return res.status(404).json({ message: 'No purchases found for this hospital.' });
        }

        // Create a map to aggregate quantities of each medication
        const medicationTotals = {};

        purchases.forEach(purchase => {
            purchase.medications.forEach(med => {
                const medId = med.medication.toString();
                if (medicationTotals[medId]) {
                    medicationTotals[medId] += med.quantity;
                } else {
                    medicationTotals[medId] = med.quantity;
                }
            });
        });

        // Return the total quantities for each medication
        res.status(200).json({ medicationTotals });
    } catch (error) {
        res.status(500).json({ message: 'Server error. Could not calculate totals.' });
    }
});

const getUserTotalPurchases = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        const purchases = await Purchase.find({ user: userId });
        
        if (!purchases.length) {
            return res.status(404).json({ message: 'No purchases found for this user.' });
        }

        const totalPurchases = purchases.length;

        res.status(200).json({ totalPurchases });
    } catch (error) {
        res.status(500).json({ message: 'Server error. Could not fetch user purchases.' });
    }
});

const getUserPurchasesFromHospital = asyncHandler(async (req, res) => {
    const { userId, hospitalId } = req.params;

    try {
        const purchases = await Purchase.find({ user: userId, hospital: hospitalId })
            .populate('medications.medication', 'name dosage') // Populate medication data
            .populate('hospital', 'name'); // Populate hospital data

        if (!purchases.length) {
            return res.status(404).json({ message: 'No purchases found for this user at this hospital.' });
        }

        res.status(200).json({ purchases });
    } catch (error) {
        res.status(500).json({ message: 'Server error. Could not fetch purchases.' });
    }
});

const getPurchaseById = asyncHandler(async (req, res) => {
    const { purchaseId } = req.params;

    try {
        const purchase = await Purchase.findById(purchaseId)
            .populate('user', 'name email') // Populate user data
            .populate('medications.medication', 'name dosage') // Populate medication data
            .populate('hospital', 'name'); // Populate hospital data

        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found.' });
        }

        res.status(200).json({ purchase });
    } catch (error) {
        res.status(500).json({ message: 'Server error. Could not fetch purchase.' });
    }
});

module.exports = { purchaseMedication };
