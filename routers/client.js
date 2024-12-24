const net = require('net');
const crypto = require('crypto');

const keys = {
    key1: 'key1_secret_string_key1_secret_string',
    key2: 'key2_secret_string_key1_secret_string',
    key3: 'key3_secret_string_key1_secret_string'
};

function decrypt(message, key) {    
    console.log(key);
    
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

async function main() {
    const destinationUrl = 'https://soft98.ir'; // Change to your desired URL
    const encryptedMessage = encrypt(encrypt(encrypt(destinationUrl, keys.key3), keys.key2), keys.key1);

    const client = net.createConnection({ host: 'localhost', port: 8001 }, () => {
        client.write(encryptedMessage);
    });

    client.on('data', (data) => {
        console.log("hell");
        
        console.log(data.toString());
        console.log("hellssss");
        result = decrypt(data.toString(), keys.key1)
        console.log("hellssfffs");
        result = decrypt(decrypt(decrypt(data.toString(), keys.key1), keys.key2), keys.key3);
        console.log(`Response from Server: ${result}`);
    });

    client.on('error', (err) => {
        console.error(err);
    });
}

main();
