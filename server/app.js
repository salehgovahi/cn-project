const express = require('express');
require('dotenv').config()
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');

const mainRouter = require('./services/index');
const HttpError = require('./utils/httpError');
const environments = require('./configs/environments')

app.use(bodyParser.json({ limit: '400mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '400mb' }));
app.use(cors());
app.use(express.json({ limit: '400mb' }));

app.use((req, res, next) => {
    res.setTimeout(600000, () => {
        console.log('Request has timed out.');
        res.status(408).send('Request has timed out.');
    });
    next();
});

app.use('', mainRouter);

app.use((req, res, next) => {
    console.log(req.originalUrl);
    console.log('Route Not Found');
    const error = new HttpError('could not find this route', 404);
    throw error;
});

app.use((error, req, res, next) => {
    console.log(error);
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.statusCode || 500);
    res.json({
        status: 'failed',
        statusCode: error.statusCode || 500,
        error: {
            code: error.code || -1,
            message: error.message || 'an unknown error occurred!',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        }
    });
});

module.exports = app;
