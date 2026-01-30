import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();
import areasRouter from './routes/areas';
import businessRouter from './routes/business';
import categoriesRouter from './routes/categories';
import citiesRouter from './routes/cities';
import dbHealthRouter from './routes/db-health';
import profileRouter from './routes/profile';
import provincesRouter from './routes/provinces';
import reviewsRouter from './routes/reviews';
import searchRouter from './routes/search';
import sitemapRouter from './routes/sitemap';
import businessRelatedRouter from './routes/business-related';
import debugRouter from './routes/debug';

console.log('MONGODB_URI in index.ts:', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/.*@/, '//<redacted>@') : 'undefined');
console.log('MONGODB_DB in index.ts:', process.env.MONGODB_DB);

// Log Leopard API configuration status (without exposing sensitive data)
const leopardBase = process.env.LEOPARDS_API_BASE_URL || process.env.COURIER_API_BASE_URL;
const leopardApiKey = process.env.LEOPARDS_API_KEY || process.env.COURIER_API_KEY;
const leopardUsername = process.env.LEOPARDS_API_USERNAME || process.env.COURIER_API_USERNAME;
const leopardPassword = process.env.LEOPARDS_API_PASSWORD || process.env.COURIER_API_PASSWORD;

console.log('🔑 Leopard API Configuration:');
console.log('  Base URL:', leopardBase ? `${leopardBase.substring(0, 50)}...` : '❌ NOT SET');
console.log('  API Key:', leopardApiKey ? `✅ SET (***${leopardApiKey.slice(-4)})` : '❌ NOT SET');
console.log('  Username:', leopardUsername ? `✅ SET (***${leopardUsername.slice(-4)})` : '⚠️ NOT SET (will use API Key)');
console.log('  Password:', leopardPassword ? '✅ SET' : '❌ NOT SET');

if (leopardBase && (leopardApiKey || leopardUsername) && leopardPassword) {
  console.log('✅ Leopard API credentials are configured correctly!');
} else {
  console.log('⚠️ WARNING: Leopard API credentials are incomplete. Pakistan cities may not load from API.');
  const missing = [];
  if (!leopardBase) missing.push('LEOPARDS_API_BASE_URL');
  if (!leopardApiKey && !leopardUsername) missing.push('LEOPARDS_API_KEY or LEOPARDS_API_USERNAME');
  if (!leopardPassword) missing.push('LEOPARDS_API_PASSWORD');
  console.log('   Missing:', missing.join(', '));
}

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL || 'http://localhost:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser tools
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ['GET','HEAD','OPTIONS','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization','x-admin-secret'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/areas', areasRouter);
app.use('/api/business', businessRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/cities', citiesRouter);
app.use('/api/db-health', dbHealthRouter);
app.use('/api/profile', profileRouter);
app.use('/api/provinces', provincesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/search', searchRouter);
app.use('/api/sitemap.xml', sitemapRouter);
app.use('/api/business/related', businessRelatedRouter);
app.use('/api/debug', debugRouter);

// Root route
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'BizBranches API Server', timestamp: new Date().toISOString() });
});

// Simple ping (no MongoDB needed) - use to verify backend is running
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, message: 'pong', timestamp: new Date().toISOString() });
});

app.listen(PORT, HOST, async () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  
  try {
    const { getModels } = await import('./lib/models');
    const models = await getModels();
    await models.initializeDefaultData();
  } catch (error) {
    console.error('Failed to initialize default data:', error);
  }
});
