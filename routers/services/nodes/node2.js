const net = require('net');
const crypto = require('crypto');

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

const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        // Decrypt the incoming data using key2
        const message = decrypt(data.toString(), keys.key2);
        console.log(`Node 2 received message: ${message}`);

        // Forward the decrypted message to Node 3
        const connection = net.createConnection({ host: 'localhost', port: 8003 }, () => {
            connection.write(message);
        });

        connection.on('data', (dataFromNode3) => {
            // Decrypt the response from Node 3 using key3
            const responseFromNode3 = decrypt(dataFromNode3.toString(), keys.key3);
            console.log(`Node 2 received response from Node 3: ${responseFromNode3}`);

            // Encrypt the response before sending back to the client
            const returningData = encrypt(responseFromNode3, keys.key2); // Encrypt for original sender
            console.log(`Node 2 sent message back to client: ${returningData}`);
            socket.write(returningData);
        });

        connection.on('error', (err) => {
            console.error('Error connecting to Node 3:', err);
        });
    });
});

module.exports = server;
