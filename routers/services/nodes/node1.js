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
        console.log(`Router 1 received message: ${incomingMessage}`);

        if (incomingMessage.messageType === 'key' && incomingMessage.receiver === 'router1') {
            routerKey = incomingMessage.payload;
            console.log(`Router 1 received valid key: ${routerKey}`);
            const encryptedPayload = encrypt('valid', routerKey);
            const responseMessage = createMessage('router1', incomingMessage.sender, 'key_response', encryptedPayload);
            socket.write(responseMessage);
        } else if (
            incomingMessage.receiver === 'router3' ||
            incomingMessage.receiver === 'router2' ||
            incomingMessage.receiver === 'server'
        ) {
            if (routerKey) {
                const decryptedMessage = decrypt(incomingMessage.payload, routerKey);
                console.log(`Router 1 decrypted message for Router 2: ${decryptedMessage}`);

                const connectionToRouter2 = net.createConnection({ host: 'localhost', port: 8002 }, () => {
                    const outgoingMessage = createMessage(
                        incomingMessage.sender,
                        incomingMessage.receiver,
                        incomingMessage.messageType,
                        decryptedMessage
                    );
                    connectionToRouter2.write(outgoingMessage);
                });

                connectionToRouter2.on('data', (dataFromRouter2) => {
                    console.log('Router1 received encrypted message from Router 2');

                    const responseFromRouter2 = parseMessage(dataFromRouter2);
                    const encryptedPayload = encrypt(responseFromRouter2.payload, routerKey); // Decrypt payload from Router 2 for further processing

                    // Ensure that the response from Router 2 is correctly formatted
                    const backToClientMessage = createMessage(
                        responseFromRouter2.sender,
                        responseFromRouter2.receiver,
                        responseFromRouter2.messageType,
                        encryptedPayload // Use decrypted payload
                    );

                    console.log(parseMessage(backToClientMessage));

                    // Log the message being sent back to the client
                    console.log(`Sending back to client: ${backToClientMessage}`);
                    socket.write(backToClientMessage);
                });

                connectionToRouter2.on('error', (err) => {
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

server.listen(8001, () => {
    console.log('Router 1 listening on port 8001');
});
