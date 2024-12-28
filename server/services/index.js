const express = require("express");
const router = express.Router();

const playersRouter = require('./players/routes');

// Accesses Routes
router.use("/players", playersRouter);

module.exports = router;