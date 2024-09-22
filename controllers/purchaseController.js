const asyncHandler = require("express-async-handler");
const User = require("../model/user");
const Purchase = require("../model/purchase");
const sendEmailWithICS = require("../middleware/calenderEmail")
const generateICSFile = require("../middleware/generateICSFile")

const purchaseMedication = asyncHandler(async (req, res) => {
    const { userId, medications, hospitalId } = req.body;

    // Create a new purchase
    const purchase = new Purchase({
        user: userId,
        medications,
        hospital: hospitalId,
    });

    // Save the purchase
    await purchase.save();

    // Find the user to update their purchase history
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if this purchase contains medications the user has bought before
    // let emailToSend = false;
    // medications.forEach(med => {
    //     const isExisting = user.purchaseHistory.some(p => p.medication.toString() === med.medication.toString());
    //     if (!isExisting) {
    //         emailToSend = true; // Set flag to send email for new medication
    //     }
    // });

    // Add the purchase to the user's history
    user.purchases.push(purchase._id);
    user.purchaseHistory.push(...medications.map(med => ({
        medication: med.medication,
        quantity: med.quantity,
        date: Date.now(),
    })));

    await user.save();

    // Send email if it's a new medication and the user has an email address
    if (user.email) {  // Check if user has an email
        // Generate the ICS file for the user
        const icsFilePath = await generateICSFile(purchase._id);

        if (icsFilePath) {
            // Send the email with ICS attachment
            await sendEmailWithICS(user.email, icsFilePath, medications);
        }
    }

    res.status(201).json(purchase);
});


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
