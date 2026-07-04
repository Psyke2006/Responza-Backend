const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// Route to dispatch emergency alerts to trusted contacts
router.post('/send', alertController.sendAlert);

module.exports = router;
