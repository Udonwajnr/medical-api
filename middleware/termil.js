const axios = require("axios");

const sendMedicationReminder = async (userPhoneNumber, userName, medicationName, dosage, dosageForm) => {
  const apiKey = "TLInzpuDDxaDhkWHOBSXfutPuvcyFDsTLwnkvWkqEHJZejYABZKmKAqaEDTqYj"; // Replace with your Termii API key
//   const senderId = "donwa"; // Replace with your sender ID (or use 'Termii' for default)
  const baseURL = "https://v3.api.termii.com/api/sms/send"; // Termii SMS API endpoint

  const message = `Reminder: Hi ${userName}, it's time to take your ${medicationName} (${dosage} ${dosageForm}). Stay on track for your health! If you've already taken it, please disregard this message. - HealthTrack`;

  try {
    const response = await axios.post(baseURL, {
      to: userPhoneNumber,
      from: "08070628237",
      sms: message,
      type: "plain", // SMS type can be 'plain' or 'flash'
      channel: "generic", // You can also use 'dnd' for Do Not Disturb numbers
      api_key: apiKey
    });

    if (response.data.success) {
      console.log("SMS sent successfully!");
    } else {
      console.log("Failed to send SMS:", response.data);
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};

module.exports = sendMedicationReminder;
