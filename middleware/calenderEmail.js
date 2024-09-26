const nodemailer = require('nodemailer');

// Function to send the email with ICS file attached
const sendEmailWithICS = async (toEmail, icsFilePath, medications) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'umohu67@gmail.com',
            pass: process.env.EMAIL_PASSCODE,
        },
    });

    // Email content
    const mailOptions = {
        from: 'umohu67@gmail.com',
        to: toEmail,
        subject: 'Your Medication Purchase and Reminder',
        text: `You have purchased the following medications from us.Please find your medication reminder attached.`,
        attachments: [
            {
                filename: 'medication-reminders.ics',
                path: icsFilePath, // Path to the generated ICS file
            },
        ],
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Export the function
module.exports = sendEmailWithICS;
