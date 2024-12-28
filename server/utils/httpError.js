class HttpError extends Error {
    constructor(error) {
        let message = error.message;
        super(message);
        this.code = error.code;
        this.statusCode = error.statusCode;
    }
}

module.exports = HttpError;
