const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { admin, db } = require('./config/firebaseAdmin');
const deviceRoutes = require('./routes/deviceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();

// Set up security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// HTTP Request Logging
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET /health Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Responza Backend'
  });
});

// GET /firebase-test Endpoint
app.get('/firebase-test', async (req, res) => {
  try {
    if (!admin || !db) {
      return res.status(500).json({
        status: 'error',
        message: 'Firebase Admin or Firestore has not been initialized successfully.'
      });
    }

    // Perform a write-then-read operation to test connectivity and write permissions
    const testDocRef = db.collection('test_connection').doc('ping');
    await testDocRef.set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ping: 'pong'
    });
    
    const docSnap = await testDocRef.get();
    
    if (!docSnap.exists) {
      throw new Error('Firestore connection check failed: document write/read cycle failed.');
    }

    res.status(200).json({
      status: 'connected',
      service: 'Firebase Admin'
    });
  } catch (error) {
    console.error('[Firebase Test] Connection test failed:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Firebase Admin connection failed.'
    });
  }
});

// Register Device API Routes
app.use('/api/device', deviceRoutes);

// Register Notification API Routes
app.use('/api/notification', notificationRoutes);

// Register Alert API Routes
app.use('/api/alerts', alertRoutes);

// Fallback 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler] Uncaught Exception:', err);
  
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Something went wrong';

  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message
  });
});

module.exports = app;
