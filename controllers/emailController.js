const nodemailer = require('nodemailer');
const generateICSFile = require('./path-to-your/generateICSFile');
const User = require('../model/user');

const sendMedicationReminderEmail = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'UserId is required' });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate the ICS file
        const icsFilePath = await generateICSFile(userId);

        if (!icsFilePath) {
            return res.status(500).json({ error: 'Failed to generate ICS file' });
        }

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSCODE,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your Medication Reminders',
            text: 'Please find your medication reminders attached. Click the link to add them to your calendar.',
            html: '<p>Please find your medication reminders attached. Click the link to add them to your calendar.</p>',
            attachments: [
                {
                    filename: 'medication-reminders.ics',
                    path: icsFilePath,
                    contentType: 'text/calendar',
                },
            ],
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ error: 'Failed to send email' });
            } else {
                console.log('Email sent successfully:', info.response);
                // Optional: Remove the ICS file after sending the email
                fs.unlink(icsFilePath, (err) => {
                    if (err) {
                        console.error('Error deleting ICS file:', err);
                    }
                });
                return res.status(200).json({ msg: 'Email sent successfully' });
            }
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = sendMedicationReminderEmail;
