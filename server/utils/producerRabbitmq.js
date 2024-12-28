const amqp = require('amqplib');
const fs = require('fs');

const environments = require('../configs/environments');

const sendFileToQueue = async (queueName, fileType, file, fileName = undefined) => {
    let connection;

    try {
        connection = await amqp.connect(
            `amqp://${environments.RABBITMQ_USER}:${environments.RABBITMQ_PASSWORD}@${environments.RABBITMQ_SERVER_IP}:${environments.RABBITMQ_SERVER_PORT}`
        );
        const channel = await connection.createChannel();

        await channel.assertQueue(queueName, { durable: false });

        // Read file content based on file type
        let fileBuffer;
        if (fileType === 'image' || fileType === 'video' || fileType === 'document') {
            fileBuffer = fs.readFileSync(file.path);
        } else {
            throw new Error('Unsupported file type specified');
        }

        // Prepare the message
        const message = {
            fileType,
            fileName: fileName,
            fileData: fileBuffer.toString('base64')
        };

        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));

        fs.unlinkSync(file.path);

        await channel.close();
    } catch (err) {
        console.warn(err);
    } finally {
        if (connection) await connection.close();
    }
};

module.exports = {
    sendFileToQueue
};
