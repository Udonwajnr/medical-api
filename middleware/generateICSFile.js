const ics = require('ics');
const fs = require('fs');
const path = require('path');
const Purchase = require('../model/purchase'); // Adjust path if necessary

const generateICSFile = async (purchaseId) => {
    try {
        // Fetch the specific purchase from the Purchase model
        const purchase = await Purchase.findById(purchaseId).populate('medications.medication');

        if (!purchase) {
            console.log('No purchase found for the given ID.');
            return null;
        }

        // Prepare the events array
        const events = [];
        const now = new Date();

        // Loop through each medication in the current purchase
        purchase.medications.forEach(purchaseMed => {
            const medication = purchaseMed.medication; // Get the medication object
            const { nameOfDrugs, dosage, frequency, duration } = medication;

            const start = new Date(purchase.createdAt); // When the purchase was made
            const daysOrWeeks = Array.from({ length: duration.value }, (_, i) => i); // Generate reminders for each day/week

            daysOrWeeks.forEach(offset => {
                let eventStart = new Date(start);

                // Adjust based on duration (days or weeks)
                if (duration.unit === 'days') {
                    eventStart.setDate(eventStart.getDate() + offset);
                } else if (duration.unit === 'weeks') {
                    eventStart.setDate(eventStart.getDate() + (offset * 7)); // Move by 7 days for each week
                }

                // Ensure event starts in the future if needed
                if (eventStart < now) {
                    eventStart.setDate(now.getDate() + offset); // Adjust to start from today if the date is in the past
                }

                // Set end date for the reminder (e.g., reminder duration of 30 minutes)
                const eventEnd = new Date(eventStart);
                eventEnd.setMinutes(eventEnd.getMinutes() + 30);

                // Handle frequency of medication (e.g., daily, hourly, multiple times a day)
                if (frequency.unit === 'days') {
                    // Medication taken once a day
                    events.push({
                        start: [eventStart.getFullYear(), eventStart.getMonth() + 1, eventStart.getDate(), 9, 0], // 9 AM
                        end: [eventEnd.getFullYear(), eventEnd.getMonth() + 1, eventEnd.getDate(), 9, 30],
                        title: `Morning ${nameOfDrugs} (${dosage}) Reminder`,
                        description: `Time to take your ${nameOfDrugs} (${dosage}).`,
                    });

                    // If medication should be taken more than once a day
                    const dailyIntervals = 24 / frequency.value;
                    for (let i = 1; i < dailyIntervals; i++) {
                        const intervalHours = i * (24 / dailyIntervals); // Evenly distribute reminders over 24 hours
                        const intervalEventStart = new Date(eventStart);
                        const intervalEventEnd = new Date(eventEnd);
                        intervalEventStart.setHours(9 + intervalHours); // Start at 9 AM and add intervals
                        intervalEventEnd.setHours(9 + intervalHours);

                        events.push({
                            start: [intervalEventStart.getFullYear(), intervalEventStart.getMonth() + 1, intervalEventStart.getDate(), intervalEventStart.getHours(), 0],
                            end: [intervalEventEnd.getFullYear(), intervalEventEnd.getMonth() + 1, intervalEventEnd.getDate(), intervalEventEnd.getHours(), 30],
                            title: `${nameOfDrugs} (${dosage}) Reminder`,
                            description: `Time to take your ${nameOfDrugs} (${dosage}).`,
                        });
                    }
                } else if (frequency.unit === 'hours') {
                    // Medication taken every X hours
                    const intervalHours = frequency.value;
                    const dailyIntervals = 24 / intervalHours; // Calculate how many times per day

                    for (let i = 0; i < dailyIntervals; i++) {
                        const eventHour = 9 + (i * intervalHours); // Start at 9 AM and repeat every X hours
                        const intervalEventStart = new Date(eventStart);
                        const intervalEventEnd = new Date(eventEnd);
                        intervalEventStart.setHours(eventHour);
                        intervalEventEnd.setHours(eventHour);

                        events.push({
                            start: [intervalEventStart.getFullYear(), intervalEventStart.getMonth() + 1, intervalEventStart.getDate(), intervalEventStart.getHours(), 0],
                            end: [intervalEventEnd.getFullYear(), intervalEventEnd.getMonth() + 1, intervalEventEnd.getDate(), intervalEventEnd.getHours(), 30],
                            title: `${nameOfDrugs} (${dosage}) Reminder`,
                            description: `Time to take your ${nameOfDrugs} (${dosage}).`,
                        });
                    }
                }
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
                    fs.writeFile(filePath, value, (err) => {
                        if (err) {
                            console.error('Error writing ICS file:', err);
                            reject(err);
                        } else {
                            console.log('ICS file generated:', filePath);
                            resolve(filePath);
                        }
                    });
                }
            });
        });

    } catch (error) {
        console.error('Error fetching purchase data:', error);
        return null;
    }
};

module.exports = generateICSFile;
