const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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
