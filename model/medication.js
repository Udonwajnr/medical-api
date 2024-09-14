const mongoose = require("mongoose");
const schema = mongoose.Schema;

const medicationSchema = new schema({
  nameOfDrugs: {
    type: String,
    required: true,
  },
  dosage: {
    type: String, // e.g., "500 mg", "10 mL"
    required: true,
  },
  dosageForm: {
    type: String, // e.g., "tablet", "syrup", "injection"
    required: true,
  },
  frequency: {
    type: String, // e.g., "twice a day", "every 8 hours"
    required: true,
  },
  duration: {
    type: String, // e.g., "7 days", "2 weeks"
    required: true,
  },
  numberOfUnits: {
    type: Number, // e.g., "30 tablets", "100 mL"
    required: true,
  },
  notes: {
    type: String,
  },
  quantityInStock: {
    type: Number,
    required: true,
  },
  barcode: {
    type: String,
    // unique: true, // Uncomment if barcodes should be unique
  },
  price: {
    type: Number,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  reorderLevel: {
    type: Number,
    default: 10,
  },
  user: [{
    type: mongoose.Types.ObjectId,
    ref: "User",
  }],
  hospital: [{
    type: mongoose.Types.ObjectId,
    ref: "Hospital",
    required: true,
  }],
  userSpecificMedicationRegimen: [{
    type: mongoose.Types.ObjectId,
    ref: "UserSpecificMedicationRegimen",
  }],
  reminderSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update `inStock` based on `quantityInStock`
medicationSchema.pre('save', function (next) {
  if (this.quantityInStock === 0) {
    this.inStock = false;
  } else {
    this.inStock = true;
  }
  next();
});

module.exports = mongoose.model("Medication", medicationSchema);
