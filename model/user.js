const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
    fullName: {
        type: String,
        required: true,
        unique: true
    },
    dateOfBirth: {
        type: Date,
        // required: true
    },
    gender: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        // required: true
    },
    email: {
        type: String,
    },
    // Adding quantity for medication
    medication: [{
        medication: {
            type: mongoose.Types.ObjectId,
            ref: "Medication",
            required: true
        },
        quantity: {
            type: Number,
            default: 1,  // Default value is 1 if not specified
        }
    }],
    hospital: [{
        type: mongoose.Types.ObjectId,
        ref: "Hospital"
    }],
    userSpecificMedicationRegimen: [{
        type: mongoose.Types.ObjectId,
        ref: "UserSpecificMedicationRegimen"
    }],
    purchases: [{
        type: mongoose.Types.ObjectId,
        ref: "Purchase"
    }],
    purchaseHistory: [{
        medication: { type: mongoose.Types.ObjectId, ref: "Medication" },
        quantity: { type: Number, default: 1 },
        date: { type: Date, default: Date.now }
      }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
