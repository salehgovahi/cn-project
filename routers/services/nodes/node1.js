const net = require('net');
const crypto = require('crypto');

const keys = {
    key1: 'key1_secret_string',
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
        const message = decrypt(data.toString(), keys.key1);
        console.log(`Node 1 received message: ${message}`);

        // Forward the message to Node 2
        const connection = net.createConnection({ host: 'localhost', port: 8002 }, () => {
            connection.write(message);
        });

        connection.on('data', (data) => {
            console.log(`Node 1 received response: ${data.toString()}`);
            const returningData = encrypt(data.toString(), keys.key1)
            socket.write(returningData); 
        });

        connection.on('error', (err) => {
            console.error(err);
        });
    });
});

server.listen(8001, () => {
    console.log('Node 1 listening on port 8001');
});