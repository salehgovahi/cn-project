// const rateLimit = require('express-rate-limit')
// const { RedisStore } = require('rate-limit-redis')
// const redis = require('../configs/redis')
// const createRateLimiter = (windowMs, max, message) => {
//     return rateLimit({
//         windowMs,
//         max,
//         message,
//         store: new RedisStore({
//             sendCommand: (...args) => redis.call(...args),
//         }),
//     });
// };


// const createRateLimitRam = (windowMs, max, message) => {
//     return rateLimit({
//         windowMs,
//         max,
//         message
//     });
// };

// const generalRateLimit = createRateLimiter(15 * 60 * 1000, 300, 'Too many requests from this IP, please try again later');

// const dailyLimiter = createRateLimiter(24 * 60 * 60 * 1000, 5, 'Exceeded the limit of requests in 24 hours. Please try again later.');

// const minuteLimiter = createRateLimitRam(2 * 60 * 1000, 1, 'Exceeded the limit of requests in 1 minute. Please try again later.');

// module.exports = {
//     generalRateLimit,
//     dailyLimiter,
//     minuteLimiter
// }