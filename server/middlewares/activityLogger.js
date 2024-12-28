const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Log = require('../models/Log');
const environments = require('../configs/environments');

const loggerMiddleware = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, environments.JWT_SECRET_KEY);
        const userId = decoded.userId;

        const log = new Log({
            userId,
            url: req.originalUrl
        });

        await log.save();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
};

module.exports = loggerMiddleware;
