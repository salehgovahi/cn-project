require('dotenv').config();
const app = require('./app');
const config = require('./configs/environments');

const startServer = async () => {
    app.listen(config.PORT, () => {
        console.log(`Server Port: ${config.PORT}`);
        console.log('Server Is Running');
    });
};

startServer();
