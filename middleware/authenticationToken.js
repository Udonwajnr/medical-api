const JWT = require('jsonwebtoken');
const Hospital = require('../model/hospital');
const asyncHandler = require('express-async-handler');

const authenticateToken = asyncHandler(async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Assumes Bearer token

    if (!token) {
        return res.status(401).json({ msg: 'No token provided' });
    }

    try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        req.hospitalId = decoded.id;
        next();
    } catch (err) {
        res.status(403).json({ msg: 'Invalid token' });
    }
});

module.exports = { authenticateToken };