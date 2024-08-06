const mongoose = require("mongoose")
const schema = mongoose.Schema

const userSchema = new schema({
    fullName:{
        type:String,
        required:true,
        unique:true
    },
    dateOfBirth:{
        type:Date,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    email:{
        type:String,
    },
    medication:[{
     type:mongoose.Types.ObjectId,
     ref:"Medication"   
    }],
})

module.exports = mongoose.model("User", userSchema)