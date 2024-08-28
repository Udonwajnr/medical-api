const express = require("express")
const router = express.Router()
const {createHospital,
    verifyEmail,
    loginHospital,
    forgotPassword,
    resetPassword,
    updateHospital,
    getHospitalById,
    deleteHospital,
    searchHospitals,
    getAllHospitals
} = require("../controllers/HospitalAuthenticationController")
// Authentication
router.post('/register', createHospital);
router.post('/login', loginHospital);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);
// 
router.get('/search', searchHospitals);
router.put('/:id', updateHospital);
router.get('/:id', getHospitalById);
router.delete('/:id', deleteHospital);
router.get('/', getAllHospitals);


module.exports=router