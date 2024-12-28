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
        console.log(`Router 2 received message: ${incomingMessage}`);

        if (incomingMessage.messageType === 'key' && incomingMessage.receiver === 'router2') {
            routerKey = incomingMessage.payload;
            console.log(`Router 2 received valid key: ${routerKey}`);
            const encryptedPayload = encrypt('valid', routerKey)
            const responseMessage = createMessage('router2', incomingMessage.sender, 'key_response', encryptedPayload);
            console.log(parseMessage(responseMessage));
            
            socket.write(responseMessage);
        } else if (incomingMessage.receiver === 'router3' || incomingMessage.receiver === 'server') {
            if (routerKey) {
                const decryptedMessage = decrypt(incomingMessage.payload, routerKey);
                console.log(`Router 2 decrypted message for Router 3: ${decryptedMessage}`);

                const connectionToRouter3 = net.createConnection({ host: 'localhost', port: 8003 }, () => {
                    const outgoingMessage = createMessage(
                        incomingMessage.sender,
                        incomingMessage.receiver,
                        incomingMessage.messageType,
                        decryptedMessage
                    );
                    connectionToRouter3.write(outgoingMessage);
                });

                connectionToRouter3.on('data', (dataFromRouter3) => {
                    const responseFromRouter3 = parseMessage(dataFromRouter3);
                    const encryptedPayload = encrypt(responseFromRouter3.payload, routerKey);
                    const backToClientMessage = createMessage(
                        responseFromRouter3.sender,
                        responseFromRouter3.receiver,
                        responseFromRouter3.messageType,
                        encryptedPayload
                    );
                    socket.write(backToClientMessage);
                });

                connectionToRouter3.on('error', (err) => {
                    console.error(err);
                });
            } else {
                console.error('Router key not set. Cannot decrypt message.');
            }
        } else {
            console.log('Unexpected message format:', incomingMessage);
        }
    });
});

server.listen(8002, () => {
    console.log('Router 2 listening on port 8002');
});
