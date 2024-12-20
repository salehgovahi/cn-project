require('dotenv').config({ path: '.env' });
const environments = require('./configs/environments');

const node1 = require('./services/nodes/node1');
const node2 = require('./services/nodes/node2');
const node3 = require('./services/nodes/node3');

const startRouters = () => {
    node1.listen(environments.PORT1, () => {
        console.log(`Node 1 listening on ${environments.HOST1} port ${environments.PORT1}`);
    });

    node2.listen(environments.PORT2, () => {
        console.log(`Node 2 listening on ${environments.HOST2} port ${environments.PORT2}`);
    });

    node3.listen(environments.PORT3, () => {
        console.log(`Node 3 listening on ${environments.HOST3} port ${environments.PORT3}`);
    });
};

startRouters();
