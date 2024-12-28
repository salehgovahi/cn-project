const net = require('net');
const crypto = require('crypto');

let routerKey = null;

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

function createMessage(sender, receiver, messageType, payload) {
    const version = '1';
    return Buffer.from(`${version}|${sender}|${receiver}|${messageType}|${payload}`);
}

function parseMessage(buffer) {
    const messageString = buffer.toString();
    const parts = messageString.split('|');
    return {
        version: parts[0],
        sender: parts[1],
        receiver: parts[2],
        messageType: parts[3],
        payload: parts.slice(4).join('|')
    };
}

const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        const incomingMessage = parseMessage(data);
        console.log(`Router 3 received message: ${incomingMessage}`);

        if (incomingMessage.messageType === 'key' && incomingMessage.receiver === 'router3') {
            routerKey = incomingMessage.payload;
            console.log(`Router 3 received valid key: ${routerKey}`);
            const encryptedPayload = encrypt('valid', routerKey)
            const responseMessage = createMessage('router3', incomingMessage.sender, 'key_response', encryptedPayload);
            socket.write(responseMessage);
        } else if (incomingMessage.receiver === 'server') {
            if (routerKey) {
                const decryptedMessage = decrypt(incomingMessage.payload, routerKey);
                console.log(`Router 3 decrypted message: ${decryptedMessage}`);

                console.log("End");
                
            } else {
                console.error('Router key not set. Cannot decrypt message.');
            }
        } else {
            console.log('Unexpected message format:', incomingMessage);
        }
    });
});

server.listen(8003, () => {
    console.log('Router 3 listening on port 8003');
});
