const express = require("express")
const app = express()
const connectDb = require("./config/db")
const dotenv = require("dotenv").config()
const port = process.env.PORT||3000
const colors = require("colors")
const calender = require("./controllers/calenderGenerator")
let cors = require("cors")
let cookieParser = require("cookie-parser")


const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://medical-inventory-beta.vercel.app'
    ];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 
app.use('/api', require('./route/authenticationTokenRoute.js'));
app.use("/api/hospital",require("./route/hospitalAuthenticationRoute.js"))
// 
app.use('/api/user',require('./route/userRoute'))
app.use('/api/medication',require('./route/medicationRoute'))
app.use('/api/purchase',require('./route/purchaseRoute.js'))
app.use('/api/', require('./route/userSpecificMedicationRegimen.js'));

// app.post('/purchase', async (req, res) => {
//     const { userId, medicationIds, hospitalId } = req.body;

//     try {
//         // await purchaseMedication(userId, medicationIds, hospitalId);
//         res.status(201).json({ message: 'Purchase recorded successfully and email sent.' });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

app.listen(port,()=>{
    console.log(`I'm Back`)
    console.log( new Date())
})




connectDb()