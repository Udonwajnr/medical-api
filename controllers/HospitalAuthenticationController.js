const Hospital = require("../model/hospital")
const asyncHandler = require("express-async-handler")
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const JWT = require("jsonwebtoken")
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const createHospital = asyncHandler(async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).json({ msg: 'Passwords do not match' });
    }

    let hospital = await Hospital.findOne({ email });
    if (hospital) {
        return res.status(400).json({ msg: 'Hospital already exists' });
    }

    hospital = new Hospital({
        name,
        email,
        password, // Save plain text password, hashing happens in pre-save hook
        isVerified: false, // Make sure to set the default verification status
    });

    // Save the hospital to get its ID
    await hospital.save();

    // Create a JWT token for email verification with the hospital ID
    const verificationToken = JWT.sign(
        { id: hospital._id }, // Include hospital ID
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Update the hospital with the verification token
    hospital.verificationToken = verificationToken;
    await hospital.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSCODE,
        },
    });

    const mailOptions = {
        to: hospital.email,
        from: process.env.EMAIL_USER,
        subject: 'Email Verification',
        text: `Please verify your email address by clicking the following link:\n\n
        http://${req.headers.host}/verify-email/${verificationToken}\n\n
        This link will expire in 1 hour.\n
        If you did not request this, please ignore this email.\n`,
    };

    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
            console.error('There was an error:', err);
        } else {
            res.status(200).json({ msg: 'Verification email sent', token: verificationToken });
        }
    });
});



const verifyEmail=asyncHandler(async(req,res)=>{
const decoded = JWT.verify(req.params.token, process.env.JWT_SECRET);
const hospital = await Hospital.findById(decoded.id);

if (!hospital) {
    return res.status(400).json({ msg: 'Invalid token or hospital not found' });
}

if (hospital.isVerified) {
    return res.status(400).json({ msg: 'Email already verified' });
}

hospital.isVerified = true;
await hospital.save();

res.status(200).json({ msg: 'Email verified successfully' });
})

const loginHospital = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find the hospital by email
    const hospital = await Hospital.findOne({ email });

    if (!hospital) {
        return res.status(400).json({ msg: 'Hospital not found' });
    }

    // Check if the hospital has verified their email
    if (!hospital.isVerified) {
        return res.status(400).json({ msg: 'Email not verified' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await hospital.matchPassword(password);
    if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create a JWT token
    const token = JWT.sign(
        { id: hospital._id, name: hospital.name, email: hospital.email },
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send response with token
    res.status(200).json({
        msg: 'Login successful',
        token,
    });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const hospital = await Hospital.findOne({ email });

    if (!hospital) {
        return res.status(400).json({ msg: 'Hospital not found' });
    }

    // Create a JWT token for password reset
    const resetToken = JWT.sign(
        { id: hospital._id },
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Set the reset token and expiration in the database
    hospital.resetPasswordToken = resetToken;
    hospital.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await hospital.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSCODE,
        },
    });

    const mailOptions = {
        to: hospital.email,
        from: process.env.EMAIL_USER,
        subject: 'Password Reset',
        text: `Please reset your password by clicking the following link:\n\n
        http://${req.headers.host}/reset-password/${resetToken}\n\n
        This link will expire in 1 hour.\n
        If you did not request this, please ignore this email.\n`,
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.error('There was an error:', err);
            return res.status(500).json({ msg: 'Error sending email' });
        }
        res.status(200).json({ msg: 'Password reset email sent' });
    });
});


const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    try {
        const decoded = JWT.verify(token, JWT_SECRET);
        const hospital = await Hospital.findById(decoded.id);

        if (!hospital) {
            return res.status(400).json({ msg: 'Hospital not found' });
        }

        // Check if the reset token is valid and not expired
        if (hospital.resetPasswordToken !== token || hospital.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ msg: 'Token is invalid or has expired' });
        }

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ msg: 'Passwords do not match' });
        }

        // Ensure newPassword is a valid string
        if (!newPassword || typeof newPassword !== 'string') {
            return res.status(400).json({ msg: 'Invalid password' });
        }

        // Hash the new password and save it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        hospital.password = hashedPassword;
        hospital.resetPasswordToken = undefined; // Clear the reset token
        hospital.resetPasswordExpires = undefined; // Clear the expiration time
        await hospital.save();

        res.status(200).json({ msg: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Error during password reset:', error);
        return res.status(400).json({ msg: 'Invalid or expired token' });
    }
});

const getAllHospitals = asyncHandler(async (req, res) => {
    const hospitals = await Hospital.find().populate('user').populate('medication');

    res.status(200).json(hospitals);
});


const getHospitalById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const hospital = await Hospital.findById(id).populate('user').populate('medication');

    if (!hospital) {
        return res.status(404).json({ msg: 'Hospital not found' });
    }

    res.status(200).json(hospital);
});
// check this again

const searchHospitals = asyncHandler(async (req, res) => {
    const { query } = req.query;

    const hospitals = await Hospital.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { address: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } },
        ],
    });

    res.status(200).json(hospitals);
});


const updateHospital = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, operatingHours, socialMedia, email } = req.body;

    let hospital = await Hospital.findById(id);

    if (!hospital) {
        return res.status(404).json({ msg: 'Hospital not found' });
    }

    // If the email is being updated, check if the new email already exists
    if (email && email !== hospital.email) {
        const emailExists = await Hospital.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ msg: 'Email already in use by another hospital' });
        }

        // Update email and set isVerified to false
        hospital.email = email;
        hospital.isVerified = false; // Re-verify the email

        // Generate a new verification token
        const verificationToken = JWT.sign(
            { id: hospital._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        hospital.verificationToken = verificationToken;

        // Send verification email to the new email address
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSCODE,
            },
        });

        const mailOptions = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: 'Email Verification',
            text: `Please verify your new email address by clicking the following link:\n\n
            http://${req.headers.host}/verify-email/${verificationToken}\n\n
            This link will expire in 1 hour.\n
            If you did not request this, please ignore this email.\n`,
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('There was an error:', err);
            }
        });
    }

    // Update other fields
    hospital.name = name || hospital.name;
    hospital.address = address || hospital.address;
    hospital.phone = phone || hospital.phone;
    hospital.operatingHours = operatingHours || hospital.operatingHours;
    hospital.socialMedia = socialMedia || hospital.socialMedia;

    await hospital.save();

    res.status(200).json({ msg: 'Hospital details updated successfully. Please verify your new email.', hospital });
});


const deleteHospital = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the hospital by ID
    const hospital = await Hospital.findById(id);

    if (!hospital) {
        return res.status(404).json({ msg: 'Hospital not found' });
    }

    // Delete the hospital
    await Hospital.deleteOne({ _id: id });

    res.status(200).json({ msg: 'Hospital deleted successfully' });
});



module.exports={createHospital,
    verifyEmail,
    loginHospital,
    forgotPassword,
    resetPassword,
    updateHospital,
    getHospitalById,
    deleteHospital,
    searchHospitals,
    getAllHospitals}