const notificationService = require('../services/notificationService');

/**
 * Controller handler for POST /api/notification/test.
 * Validates request payload and triggers test notification delivery.
 */
async function sendTestNotification(req, res, next) {
  try {
    const { uid } = req.body;

    if (!uid || typeof uid !== 'string' || !uid.trim()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'uid is required and must be a non-empty string'
      });
    }

    const messageId = await notificationService.sendTestNotification(uid.trim());

    return res.status(200).json({
      success: true,
      message: 'Test notification sent successfully',
      messageId
    });
  } catch (error) {
    console.error('[Notification Controller] Send test failed:', error);

    // Differentiate custom/validation status codes from internal server errors
    const statusCode = error.statusCode || 500;
    const errName = statusCode === 400 ? 'ValidationError' : (error.name || 'InternalServerError');
    
    return res.status(statusCode).json({
      error: errName,
      message: error.message || 'Failed to dispatch test push notification.'
    });
  }
}

module.exports = {
  sendTestNotification
};
