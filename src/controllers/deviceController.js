const deviceService = require('../services/deviceService');

/**
 * Controller handler for POST /api/device/register.
 * Validates request parameters and delegates to the device service layer.
 */
async function registerDevice(req, res, next) {
  try {
    const { uid, fcmToken, platform } = req.body;

    // Validation
    if (!uid || typeof uid !== 'string' || !uid.trim()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'uid is required and must be a non-empty string'
      });
    }

    if (!fcmToken || typeof fcmToken !== 'string' || !fcmToken.trim()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'fcmToken is required and must be a non-empty string'
      });
    }

    if (!platform || typeof platform !== 'string' || platform.trim().toLowerCase() !== 'android') {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'platform is required and must currently be "android"'
      });
    }

    // Call service layer
    await deviceService.registerDevice(uid.trim(), fcmToken.trim(), platform.trim().toLowerCase());

    return res.status(200).json({
      success: true,
      message: 'FCM token registered successfully'
    });
  } catch (error) {
    console.error('[Device Controller] Registration failed:', error);
    next(error);
  }
}

module.exports = {
  registerDevice
};
