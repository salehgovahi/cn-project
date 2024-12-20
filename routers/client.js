// client.js
const axios = require('axios');
const crypto = require('crypto');

const environments = require('./configs/environments')

const keys = {
    key1: 'key1_secret_string',
    key2: 'key2_secret_string',
    key3: 'key3_secret_string'
};

function encrypt(message, key) {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
function decrypt(message, key) {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(message, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

async function main() {
    const destinationUrl = 'Hello';
    // Encrypt the message
    const encryptedMessage = encrypt(encrypt(encrypt(destinationUrl, keys.key3), keys.key2), keys.key1);
    console.log(`Sending Encrypted Message: ${encryptedMessage}`);

    const response = await axios.post('http://localhost:8001/send', { message: encryptedMessage });
    console.log("------");
    console.log(response.data);
    const decryptedMessage = decrypt(decrypt(decrypt(response.data, keys.key1), keys.key2), keys.key3);
    console.log(`Response from Server: ${decryptedMessage}`);
}

main().catch(console.error);