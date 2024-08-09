const ics = require('ics');
const fs = require('fs');
const path = require('path');
const Medication = require('../model/medication');

const generateICSFile = async (userId) => {
    try {
        // Fetch user medications from the database
        const userMedications = await Medication.find({ user: userId });

        if (userMedications.length === 0) {
            console.log('No medications found for user.');
            return null;
        }

        // Prepare the events array
        const events = [];

        const now = new Date(); // Get current date and time

        userMedications.forEach(med => {
            const { nameOfDrugs, dosage, frequency, time } = med;
            const days = [0, 1, 2]; // Generate reminders for the next 3 days

            days.forEach(dayOffset => {
                const start = new Date(time);
                start.setDate(start.getDate() + dayOffset);

                // Adjust to present if in the past
                if (start < now) {
                    start.setTime(now.getTime());
                    start.setDate(start.getDate() + dayOffset);
                }

                const end = new Date(start);
                end.setMinutes(end.getMinutes() + 30); // Adjust the duration as needed

                if (frequency === 'daily' || frequency === 'twice_daily') {
                    // Morning reminder
                    events.push({
                        start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), 9, 0], // 9 AM
                        end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), 9, 30],
                        title: `Morning ${nameOfDrugs} (${dosage}) Reminder`,
                        description: `Time to take your ${nameOfDrugs} (${dosage}).`,
                    });

                    // Evening reminder
                    events.push({
                        start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), 18, 0], // 6 PM
                        end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), 18, 30],
                        title: `Evening ${nameOfDrugs} (${dosage}) Reminder`,
                        description: `Time to take your ${nameOfDrugs} (${dosage}).`,
                    });
                }

                // Handle other frequencies if needed
            });
        });

        // Generate ICS file content
        return new Promise((resolve, reject) => {
            ics.createEvents(events, (error, value) => {
                if (error) {
                    console.error('Error generating ICS file:', error);
                    reject(error);
                } else {
                    const filePath = path.join(__dirname, 'medication-reminders.ics');
                    fs.writeFileSync(filePath, value);
                    console.log('ICS file generated:', filePath);
                    resolve(filePath);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching medication data:', error);
        return null;
    }
};

module.exports = generateICSFile;
