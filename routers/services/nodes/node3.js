// node3.js
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');

const environments = require('../../configs/environments')

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
    console.log(environments.KEY3);
    const decryptedMessage = decrypt(message, keys.key3);
    console.log(`Node 3 decrypted message: ${decryptedMessage}`);

    try {
        // const externalResponse = await axios.get(decryptedMessage);
        const externalResponse = "This is a test";
        // console.log(`Node 3 decrypted result: ${encrypt(externalResponse.data, keys.key3)}`);
        // res.json(encrypt(externalResponse.data, keys.key3));
        console.log(`Node 3 decrypted result: ${encrypt(externalResponse, keys.key3)}`);
        res.json(encrypt(externalResponse, keys.key3));
    } catch (error) {
        res.status(500).send('Error while fetching the resource.');
    }
});

module.exports = app