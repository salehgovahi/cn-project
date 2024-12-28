const Joi = require('joi');
const ErrorHandler = require('../utils/httpError');
const { Joi_Errors } = require('../const/errors');

const validator = (schema, property) => {
    return async (req, res, next) => {      
        try {
            await schema.validateAsync(req[property], { abortEarly: false });
            next();
        } catch (error) {
            const { details } = error;
            const message = details.map((i) => i.message).join(', ');
            const errorResponse = new ErrorHandler(Joi_Errors);
            errorResponse.message = message;
            next(errorResponse);
        }
    };
};

module.exports = validator;
