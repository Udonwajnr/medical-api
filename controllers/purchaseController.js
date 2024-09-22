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

        // Validate user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'Invalid user.' });
        }

        // if(!medications.TypeOf()===Array()){

        // }
        // Ensure medications is an array of objects with medication and quantity
        const medicationObjects = medications?.map(med => ({
            medication: mongoose.Types.ObjectId(med.medication), // convert to ObjectId
            quantity: med.quantity || 1 // set default quantity if not provided
        }));

        // Create a new purchase
        const purchase = new Purchase({
            user: userId,
            medications: medicationObjects, // Pass the array of medication objects
            hospital: hospitalId
        });

        // Save purchase
        await purchase.save();

        // Send email reminder (if applicable)
        // await sendEmailReminder(user, medicationObjects);

        return res.status(201).json({ message: 'Purchase successful and email sent!' });
    } catch (error) {
        console.error('Error processing purchase:', error);
        return res.status(500).json({ message: 'Server error. Could not complete purchase.' });
    }
};

module.exports = { purchaseMedication };


module.exports = { purchaseMedication };