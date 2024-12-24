require('dotenv').config({ path: '.env' });
const net = require('net');
const environments = require('./configs/environments');

const node1 = require('./services/nodes/node1');
const node2 = require('./services/nodes/node2');
const node3 = require('./services/nodes/node3');

const startServers = () => {
    node1.listen(8001, () => {
        console.log('Node 1 listening on port 8001');
    });

    node2.listen(8002, () => {
        console.log(`Node 2 listening on port 8002`);
    });

    node3.listen(8003, () => {
        console.log(`Node 3 listening on port 8003`);
    });
};

startServers();