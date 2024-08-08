const nodemailer = require("nodemailer")
const path = require('path');
const fs = require('fs');
const User = require("../model/user")

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'umohu67@gmail.com',
      pass: process.env.EMAIL_PASSCODE,
    },
    
  });

  const filePath = path.join("", 'medication-reminders.ics');

  const mailOptions = {
    from: 'umohu67@gmail.com',
    to: 'ikikanke@gmail.com',
    subject: 'Your Medication Reminders',
    text: 'Please find your medication reminders attached. Click the link to add them to your calendar.',
    attachments: [
      {
        filename: 'medication-reminders.ics',
        path: filePath, // Path to the file
        contentType: 'text/calendar',
      },
    ],
  };

  console.log(filePath)
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent Successfully:', info.response);
    }
  });