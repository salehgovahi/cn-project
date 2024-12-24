const net = require('net');
const crypto = require('crypto');
const axios = require('axios');

const keys = {
    key1: 'key1_secret_string_key1_secret_string',
    key2: 'key2_secret_string_key1_secret_string',
    key3: 'key3_secret_string_key1_secret_string'
};

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

const server = net.createServer(async (socket) => {
    socket.on('data', async (data) => {
        const message = decrypt(data.toString(), keys.key3);
        console.log(`Node 3 received message: ${message}`);

        console.log(message);
        

        try {
            const response = await axios.get(message);
            console.log(response);
            
            const returningData = encrypt(response.data, keys.key3)
            console.log(`Node 3 sent message: ${returningData}`);
            socket.write(returningData);
        } catch (error) {
            console.error('Error fetching the URL:', error);
            socket.write('Error fetching the URL');
        }
    });
});

module.exports = server