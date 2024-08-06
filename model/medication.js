const mongoose = require("mongoose")
const schema = mongoose.Schema

const medicationSchema = new schema({
    nameOfDrugs:{
        type:String,
        required:true
    },
    dosage:{
        type:String,
        enum: ['50 mg', '100 mg', '200 mg'],
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
      user:[{
        type:mongoose.Types.ObjectId,
        ref:"User",
      }],
      notes: {
        type: String,

      },
      reminderSent: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
})

module.exports=mongoose.model("Medication",medicationSchema)