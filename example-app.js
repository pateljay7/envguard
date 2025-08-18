// Example Node.js application demonstrating environment variable usage
import express from 'express';
import { config } from 'dotenv';

config();

const app = express();

// Direct environment variable access
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV;

// Bracket notation access
const apiKey = process.env['API_KEY'];
const dbUrl = process.env['DATABASE_URL'];

// Optional environment variables with fallbacks
const logLevel = process.env.LOG_LEVEL || 'info';
const debugMode = process.env.DEBUG_MODE || 'false';

// Dynamic access (will be flagged as uncertain)
const prefix = 'SERVICE_';
const serviceToken = process.env[prefix + 'TOKEN'];

// Missing environment variable (no fallback)
const secretKey = process.env.SECRET_KEY;
const redisUrl = process.env.REDIS_URL;

app.get('/', (req, res) => {
  res.json({
    environment: NODE_ENV,
    port: PORT,
    hasApiKey: !!apiKey,
    hasDbUrl: !!dbUrl,
    logLevel,
    debugMode: debugMode === 'true',
    hasSecretKey: !!secretKey,
    hasRedisUrl: !!redisUrl,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
});

export { app };
