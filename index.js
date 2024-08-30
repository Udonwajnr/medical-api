const express = require("express")
const app = express()
const connectDb = require("./config/db")
const dotenv = require("dotenv").config()
const port = process.env.PORT||3000
const colors = require("colors")
const calender = require("./controllers/calenderGenerator")
let cors = require("cors")
// const email = require("./middleware/email")

app.use(express.json())
app.use(express.urlencoded({extended:false}))

// 
app.use("/api/hospital",require("./route/hospitalAuthenticationRoute.js"))
// 
app.use('/api/user',require('./route/userRoute'))
app.use('/api/medication',require('./route/medicationRoute'))
app.use('/api/email',require('./route/emailReminder'))
app.listen(port,()=>{
    console.log(`I'm Back`)
})




connectDb()