const express = require('express');
const router = express.Router();
const playerController = require('./controller');

// Get videos by id
router.post(
    '/ready', 
    playerController.addReadyPlayer
);

module.exports = router;
