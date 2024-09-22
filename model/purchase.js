const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    medications: [{
        medication: {
            type: mongoose.Types.ObjectId,
            ref: 'Medication',
            required: true,
        },
        quantity: {
            type: Number,
            default: 1, // Default value is 1
            required: true,
        }
    }],
    hospital: {
        type: mongoose.Types.ObjectId,
        ref: 'Hospital',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Purchase', purchaseSchema);