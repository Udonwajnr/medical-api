const express = require("express")
const app = express()
const connectDb = require("./config/db")
const dotenv = require("dotenv").config()
const port = process.env.PORT||3000
const colors = require("colors")
let cors = require("cors")

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use('/api/user',require('./route/userRoute'))
app.listen(port,()=>{
    console.log(`I'm Back`)
})



connectDb()