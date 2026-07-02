const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// POST /api/device/register
router.post('/register', deviceController.registerDevice);

module.exports = router;
