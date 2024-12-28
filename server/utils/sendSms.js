const config = require('../configs/environments');

// Add and Config Kavenegar For Sending Messages
const Kavenegar = require('kavenegar');
const kavenegarApi = Kavenegar.KavenegarApi({
    apikey: config.KAVENEGAR_KEY
});

// A function that sends SMS
const sendKavenegarSms = async (message, receptor) => {
    return new Promise((resolve, reject) => {
        kavenegarApi.Send({
            message: message,
            sender: config.KAVENEGAR_NUMBER,
            receptor: receptor
        }, (response, status) => {
            if (status !== 200) {
                reject(new Error(`Status: ${status}`));
            } else {
                resolve(response);
            }
        });
    });
};

// Main function to send SMS
const sendSms = async (message, receptor) => {
    try {
        await sendKavenegarSms(message, receptor);
    } catch (error) {
        console.error('Failed to send SMS:[status code]', error.message);
        throw error; // Rethrow the error for further handling
    }
};

module.exports = {
    sendSms
};