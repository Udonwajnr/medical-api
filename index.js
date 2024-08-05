const express = require("express")
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:false}))

const port = 3000

app.listen(port,()=>{
    console.log("I am Back")
})
console.log("hello")