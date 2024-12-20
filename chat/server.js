require('dotenv').config({ path: './.env' });
const environments = require('./configs/environments');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ host: environments.WEBSOCKET_HOST, port: environments.WEBSOCKET_PORT });

const clients = new Set();
const messageHistory = [];

// Broadcast message to all connected clients
function broadcast(data, sender) {
    clients.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Send message history to a new client
function sendMessageHistory(ws) {
    if (messageHistory.length > 0) {
        ws.send(JSON.stringify({ type: 'history', content: messageHistory }));
    }
}

// Handle connection events
wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);

    // Send message history to the newly connected client
    sendMessageHistory(ws);

    ws.on('message', (message) => {
        console.log('Received:', message.toString());
        try {
            const parsedMessage = JSON.parse(message);
            const { type, content, username } = parsedMessage;

            switch (type) {
                case 'chat':
                    // Store message in history
                    const chatMessage = { username, content };
                    messageHistory.push(chatMessage);

                    // Broadcast the new chat message
                    const broadcastMessage = JSON.stringify({ type: 'chat', ...chatMessage });
                    broadcast(broadcastMessage, ws);
                    break;
                default:
                    console.warn('Unknown message type:', type);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({ type: 'error', content: 'Invalid message format' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'info', content: 'Welcome to the chat!' }));
});

// Error handling
wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

console.log(`WebSocket chat server is running on ws://${environments.WEBSOCKET_HOST}:${environments.WEBSOCKET_PORT}`);
