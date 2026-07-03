const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// POST /api/notification/test
router.post('/test', notificationController.sendTestNotification);

module.exports = router;
