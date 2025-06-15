const express = require("express");
const router = express.Router();
const { addSensorData, getSensorData, getRootHandler } = require("./handler");

router.get("/", getRootHandler); //Root

// POST /sensor (push dari ESP32/master)
router.post('/sensor', addSensorData);

// GET /sensor (untuk dashboard/frontend)
router.get('/sensor', getSensorData);

module.exports = router;
