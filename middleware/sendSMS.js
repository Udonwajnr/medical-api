const schedule = require('node-schedule');
const twilio = require('twilio');
const Purchase = require('../model/purchase'); // Adjust path if necessary
const sendSMSReminder = require('./sendSMSReminder'); // Assume this is a function to send SMS

// Twilio configuration (Ensure you add your Twilio credentials)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// Function to schedule SMS reminders based on medication
const scheduleMedicationSMSReminders = async (purchaseId) => {
    try {
        // Fetch the specific purchase from the Purchase model
        const purchase = await Purchase.findById(purchaseId).populate('medications.medication user');

        if (!purchase) {
            console.log('No purchase found for the given ID.');
            return null;
        }

        // Loop through each medication in the purchase
        purchase.medications.forEach(purchaseMed => {
            const medication = purchaseMed.medication; // Get the medication object
            const { nameOfDrugs, dosage, frequency, duration } = medication;

            // Use the purchase medication's startTime for the first event
            let eventStart = purchaseMed.startTime ? new Date(purchaseMed.startTime) : new Date();

            const daysOrWeeks = Array.from({ length: duration.value }, (_, i) => i); // Generate reminders for each day/week

            daysOrWeeks.forEach(offset => {
                // Adjust based on duration (days or weeks)
                const currentDate = new Date(eventStart);
                if (duration.unit === 'days') {
                    currentDate.setDate(eventStart.getDate() + offset); // Add days to current date
                } else if (duration.unit === 'weeks') {
                    currentDate.setDate(eventStart.getDate() + (offset * 7)); // Add weeks
                }

                // Handle frequency of medication (e.g., daily, hourly, multiple times a day)
                if (frequency.unit === 'days') {
                    // Medication taken once a day
                    scheduleJobForReminder(currentDate, nameOfDrugs, dosage, purchase.user.phoneNumber);
                    
                    // If medication should be taken more than once a day
                    const dailyIntervals = 24 / frequency.value;
                    for (let i = 1; i < dailyIntervals; i++) {
                        const intervalEventStart = new Date(currentDate);
                        intervalEventStart.setHours(currentDate.getHours() + (i * (24 / dailyIntervals))); // Set frequency intervals

                        scheduleJobForReminder(intervalEventStart, nameOfDrugs, dosage, purchase.user.phoneNumber);
                    }
                } else if (frequency.unit === 'hours') {
                    // Medication taken every X hours
                    const intervalHours = frequency.value;
                    const dailyIntervals = 24 / intervalHours;

                    for (let i = 0; i < dailyIntervals; i++) {
                        const intervalEventStart = new Date(currentDate);
                        intervalEventStart.setHours(currentDate.getHours() + (i * intervalHours));

                        scheduleJobForReminder(intervalEventStart, nameOfDrugs, dosage, purchase.user.phoneNumber);
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error scheduling SMS reminders:', error);
    }
};

// Helper function to schedule SMS reminder
const scheduleJobForReminder = (reminderTime, medicationName, dosage, phoneNumber) => {
    // Schedule the reminder using node-schedule
    schedule.scheduleJob(reminderTime, function() {
        const message = `Reminder: It's time to take your ${medicationName} (${dosage}).`;

        // Send SMS using Twilio (or any SMS service)
        sendSMSReminder(phoneNumber, message)
            .then(result => {
                console.log(`SMS reminder sent for ${medicationName} at ${reminderTime}: ${result.sid}`);
            })
            .catch(error => {
                console.error(`Failed to send SMS for ${medicationName}:`, error);
            });
    });

    console.log(`SMS reminder scheduled for ${medicationName} at ${reminderTime}`);
};

module.exports = scheduleMedicationSMSReminders;
