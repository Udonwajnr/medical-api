const sendSMSReminder = require('./sendSMS'); // Adjust the path
const Purchase = require('../model/purchase');

const sendMedicationSMSReminders = async (purchaseId) => {
    try {
        // Fetch the purchase
        const purchase = await Purchase.findById(purchaseId).populate('medications.medication');

        if (!purchase) {
            console.log('No purchase found for the given ID.');
            return null;
        }

        // Ensure the user has a phone number
        const phoneNumber = purchase.user.phoneNumber;
        if (!phoneNumber) {
            console.log('No phone number provided for the user.');
            return;
        }

        // Prepare the SMS message
        purchase.medications.forEach(purchaseMed => {
            const medication = purchaseMed.medication;
            const message = `Reminder: It's time to take your ${medication.nameOfDrugs} (${medication.dosage}).`;
            
            // Send SMS
            sendSMSReminder(phoneNumber, message)
                .then(result => {
                    console.log('SMS sent successfully:', result.sid);
                })
                .catch(err => {
                    console.error('Error sending SMS:', err);
                });
        });
    } catch (error) {
        console.error('Error fetching purchase or sending SMS:', error);
    }
};

module.exports = sendMedicationSMSReminders;
