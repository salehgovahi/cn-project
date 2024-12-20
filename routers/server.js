require('dotenv').config({ path: '.env' });
const environments = require('./configs/environments');

const node1 = require('./services/nodes/node1');
const node2 = require('./services/nodes/node2');
const node3 = require('./services/nodes/node3');

const startRouters = () => {
    console.log(environments);
    node1.listen(environments.PORT1, () => {
        console.log(`Node 1 listening on port ${environments.PORT1}`);
    });

    node2.listen(environments.PORT2, () => {
        console.log(`Node 2 listening on port ${environments.PORT2}`);
    });

    node3.listen(environments.PORT3, () => {
        console.log(`Node 3 listening on port ${environments.PORT3}`);
    });
};

startRouters();
