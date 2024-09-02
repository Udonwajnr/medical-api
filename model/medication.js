const mongoose = require("mongoose")
const schema = mongoose.Schema

const medicationSchema = new schema({
    nameOfDrugs:{
        type:String,
        required:true
    },
    dosage:{
        type:String,
        required:true
    },
    frequency: {
        type: String,
        enum: ['daily', 'twice_daily', 'three_times_daily', 'weekly'],
        required: true,
      },
    time: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
    },
    quantityInStock:{
      type:Number,
      required:true
    },
    barcode: {
      type: String,
      // unique: true,
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
    user:[{
      type:mongoose.Types.ObjectId,
      ref:"User",
    }],
    hospital:[{
      type:mongoose.Types.ObjectId,
      ref:"Hospital",
      required:true
    }],
    reminderSent: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
})

medicationSchema.pre('save', function (next) {
  // Automatically set inStock to false if quantityInStock is 0
  if (this.quantityInStock === 0) {
    this.inStock = false;
  } else {
    this.inStock = true;
  }
  next();
});

module.exports = mongoose.model("Medication", medicationSchema);
