const jwt = require('jsonwebtoken');

const HttpError = require('../utils/httpError');
const Errors = require('../const/errors');
const config = require('../configs/environments');

const checkToken = (req, res, next) => {
    const { authorization } = req.headers;

    try {
        const token = authorization.substring('Bearer '.length);

        if (!token) {
            throw new HttpError(Errors.Token_Not_Exist);
        }

        const { user_id } = jwt.verify(token, config.JWT_SECRET_KEY);

        req.user_id = user_id;
        next();
    } catch (err) {
        console.log(err);
        if (err.name === 'TokenExpiredError') {
            throw new HttpError(Errors.Token_Expired);
        } else {
            throw new HttpError(Errors.Token_Not_Exist);
        }
    }
};

const checkTokenClientAPIs = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        req.user_id = null;
        return next(); 
    }

    const token = authorization.split(' ')[1];

    if (!token) {
        req.user_id = null;
        return next(); 
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET_KEY);

        req.user_id = decoded.user_id; 
        next();
    } catch (err) {
        console.error(err);
        if (err.name === 'TokenExpiredError') {
            throw new HttpError(Errors.Token_Expired);
        } else {
            throw new HttpError(Errors.Token_Not_Exist);
        }
    }
};

module.exports = { checkToken, checkTokenClientAPIs };
