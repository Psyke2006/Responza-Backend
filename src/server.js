require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Responza Backend is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

// Handle lifecycle termination signals
const shutdown = (signal) => {
  console.log(`[Server] Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('[Server] Server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
