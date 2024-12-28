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

async function main() {
    const routerKey1 = 'router1_key';
    const routerKey2 = 'router2_key';
    const routerKey3 = 'router3_key';

    const client = net.createConnection({ host: 'localhost', port: 8001 }, () => {
        const keyMessage = createMessage('client', 'router1', 'key', routerKey1);
        client.write(keyMessage);
    });

    client.on('data', (data) => {
        const response = parseMessage(data);

        switch (response.messageType) {
            case 'key_response':
                if (response.sender === 'router1') {
                    console.log('Router key accepted by Router 1');
                    const decryptedPayload = decrypt(response.payload, routerKey1);
                    console.log(decryptedPayload);

                    const encryptedKey = encrypt(routerKey2, routerKey1);
                    const keyMessageRouter2 = createMessage('client', 'router2', 'key', encryptedKey);
                    client.write(keyMessageRouter2);
                }
                if (response.sender === 'router2') {
                    // console.log(parseMessage(response));

                    console.log('Router key accepted by Router 2');
                    const decryptedPayload1 = decrypt(response.payload, routerKey1);
                    const decryptedPayload2 = decrypt(decryptedPayload1, routerKey2);
                    console.log(decryptedPayload2);

                    const encryptedKey = encrypt(routerKey3, routerKey2);
                    const encryptedTwice = encrypt(encryptedKey, routerKey1);
                    const keyMessageRouter3 = createMessage('client', 'router3', 'key', encryptedTwice);
                    client.write(keyMessageRouter3);
                }
                if (response.sender === 'router3') {
                    console.log('Router key accepted by Router 3');
                    const decryptedKey = decrypt(response.payload, routerKey1);
                    const decryptedTwice = decrypt(decryptedKey, routerKey2);
                    const decryptedThird = decrypt(decryptedTwice, routerKey3);

                    let request = {
                        'address': 'http://127.0.0.1:3000/players/ready',
                        'ip': "127.0.0.1",
                        'socket': '8080'
                    }

                    const messageToSend = JSON.stringify(request)
                    const encryptedKey = encrypt(messageToSend, routerKey3);
                    const encryptedTwice = encrypt(encryptedKey, routerKey2);
                    const encryptedThird = encrypt(encryptedTwice, routerKey1);
                    const serverMessageRouter3 = createMessage('client', 'server', 'server', encryptedThird);
                    client.write(serverMessageRouter3)
                }
            case 'server_response':
                if (response.sender === 'server') {
                    const decryptedKey = decrypt(response.payload, routerKey1);
                    const decryptedTwice = decrypt(decryptedKey, routerKey2);
                    const decryptedThird = decrypt(decryptedTwice, routerKey3);

                    console.log(decryptedThird);
                }
                
        }
    });

    client.on('error', (err) => {
        console.error(err);
    });
}

main();
