const environments = require('../configs/environments');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.sendStatus(403);
    }

    // Check if the token matches
    if (token !== `Bearer ${environments.FILE_SERVER_TOKEN}`) {
        return res.sendStatus(403);
    }

    next();
};

module.exports = authenticateToken;
