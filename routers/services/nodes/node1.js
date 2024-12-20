// node1.js
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');

const environments = require('../../configs/environments');

const keys = {
    key1: 'key1_secret_string',
    key2: 'key2_secret_string',
    key3: 'key3_secret_string'
};

const app = express();
app.use(bodyParser.json());

function decrypt(message, key) {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(message, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function encrypt(message, key) {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

app.post('/send', async (req, res) => {
    const { message } = req.body;
    const decryptedMessage = decrypt(message, keys.key1);
    console.log(`Node 1 decrypted message: ${decryptedMessage}`);

    const externalResponse = await axios.post(`http://${environments.HOST2}:${environments.PORT2}/send`, {
        message: decryptedMessage
    });
    console.log(`Node 1 decrypted result: ${encrypt(externalResponse.data, keys.key1)}`);
    res.json(encrypt(externalResponse.data, keys.key1));
});

module.exports = app;
