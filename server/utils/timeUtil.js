const getCurrentTime = () => {
    return Math.floor(Date.now() / 1000); // Get the current time in seconds
};

module.exports = getCurrentTime;