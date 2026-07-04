const alertService = require('../services/alertService');

/**
 * Controller to dispatch emergency alerts to a user's trusted contacts.
 */
async function sendAlert(req, res, next) {
  try {
    const { uid, alertId } = req.body;

    // Validate request body properties
    if (!uid || typeof uid !== 'string' || !uid.trim()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'uid is required and must be a non-empty string.'
      });
    }

    if (!alertId || typeof alertId !== 'string' || !alertId.trim()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'alertId is required and must be a non-empty string.'
      });
    }

    // Call service layer
    const result = await alertService.sendAlertNotifications(uid.trim(), alertId.trim());

    return res.status(200).json({
      success: true,
      contactsFound: result.contactsFound,
      validTokens: result.validTokens,
      notificationsSent: result.notificationsSent,
      failedNotifications: result.failedNotifications
    });
  } catch (error) {
    console.error('[ALERT Controller] Failed to dispatch emergency alert:', error);
    
    // Pass to Express error-handling middleware
    next(error);
  }
}

module.exports = {
  sendAlert
};
