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
        console.log(purchase.medications)

        // Inside your loop for each medication
        purchase.medications.forEach(purchaseMed => {
            const medication = purchaseMed.medication;
            const { nameOfDrugs, dosage, frequency, duration } = medication;
        
            const daysOrWeeks = Array.from({ length: duration.value }, (_, i) => i); // Generate reminders for each day/week
        
            let eventStart = purchaseMed.startTime ? new Date(purchaseMed.startTime) : new Date();
            let eventEnd = new Date(eventStart);
            eventEnd.setMinutes(eventEnd.getMinutes() + 30);
        
            daysOrWeeks.forEach(offset => {
                const localStart = new Date(eventStart);
                const localEnd = new Date(eventEnd);
        
                if (duration.unit === 'days') {
                    localStart.setDate(eventStart.getDate() + offset);
                    localEnd.setDate(eventEnd.getDate() + offset);
                } else if (duration.unit === 'weeks') {
                    localStart.setDate(eventStart.getDate() + (offset * 7));
                    localEnd.setDate(eventEnd.getDate() + (offset * 7));
                }
        
                if (frequency.unit === 'days') {
                    events.push({
                        start: [localStart.getFullYear(), localStart.getMonth() + 1, localStart.getDate(), localStart.getHours(), localStart.getMinutes()],
                        end: [localEnd.getFullYear(), localEnd.getMonth() + 1, localEnd.getDate(), localEnd.getHours(), localEnd.getMinutes()],
                        title: `${nameOfDrugs} (${dosage}) Reminder`,
                        description: `Time to take your ${nameOfDrugs} (${dosage}).`,
                    });
        
                    const dailyIntervals = 24 / frequency.value;
                    for (let i = 1; i < dailyIntervals; i++) {
                        const intervalEventStart = new Date(localStart);
                        const intervalEventEnd = new Date(localEnd);
                        intervalEventStart.setHours(localStart.getHours() + i * (24 / dailyIntervals));
                        intervalEventEnd.setHours(localEnd.getHours() + i * (24 / dailyIntervals));
        
                        events.push({
                            start: [intervalEventStart.getFullYear(), intervalEventStart.getMonth() + 1, intervalEventStart.getDate(), intervalEventStart.getHours(), intervalEventStart.getMinutes()],
                            end: [intervalEventEnd.getFullYear(), intervalEventEnd.getMonth() + 1, intervalEventEnd.getDate(), intervalEventEnd.getHours(), intervalEventEnd.getMinutes()],
                            title: `${nameOfDrugs} (${dosage}) Reminder`,
                            description: `Time to take your ${nameOfDrugs} (${dosage}).`,
                        });
                    }
                } else if (frequency.unit === 'hours') {
                    const intervalHours = frequency.value;
                    const dailyIntervals = 24 / intervalHours;
        
                    for (let i = 0; i < dailyIntervals; i++) {
                        const intervalEventStart = new Date(localStart);
                        const intervalEventEnd = new Date(localEnd);
                        intervalEventStart.setHours(localStart.getHours() + (i * intervalHours));
                        intervalEventEnd.setHours(localEnd.getHours() + (i * intervalHours));
        
                        events.push({
                            start: [intervalEventStart.getFullYear(), intervalEventStart.getMonth() + 1, intervalEventStart.getDate(), intervalEventStart.getHours(), intervalEventStart.getMinutes()],
                            end: [intervalEventEnd.getFullYear(), intervalEventEnd.getMonth() + 1, intervalEventEnd.getDate(), intervalEventEnd.getHours(), intervalEventEnd.getMinutes()],
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
