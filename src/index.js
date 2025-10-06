require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../models');
const userRoutes = require('./routes/user.routes');

const app = express();
const PORT = process.env.PORT || 4002;

// CORS (whitelist por env, libre si vacío)
const origins = (process.env.CORS_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl/postman
    cb(null, origins.length === 0 || origins.includes(origin));
  },
  credentials: true
}));

app.use(helmet());
app.use(express.json());

// request-id
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.set('x-request-id', req.id);
  next();
});

app.use(morgan(':method :url :status - :response-time ms - :req[x-request-id]'));

// health
app.get('/healthz', (_req, res) => res.json({ ok: true, service: 'user-service' }));

// readiness (prueba DB)
app.get('/readyz', async (_req, res) => {
  try {
    await sequelize.authenticate();
    return res.json({ ok: true, database: 'connected' });
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return res.status(503).json({ ok: false, error: error.message });
  }
});

// routes
app.use('/api/v1/users', userRoutes);

// error handler
app.use((err, _req, res, _next) => {
  const s = err.status || 500;
  res.status(s).json({
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Internal error' }
  });
});

// ---- ARRANQUE (no bloquear por DB) ----
console.log('🚀 Starting user-service...');
console.log('NODE_ENV:', process.env.NODE_ENV);
if (process.env.DATABASE_URL) {
  // máscara solo para log
  const masked = process.env.DATABASE_URL.replace(/:[^:@/]*@/, ':****@');
  console.log('DATABASE_URL:', masked);
}

// escuchar en 0.0.0.0 (Railway)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`user-service on :${PORT}`);
});

// probar DB en segundo plano (sin romper arranque)
(async () => {
  try {
    console.log('🔄 Testing initial database connection…');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully on startup');
  } catch (error) {
    console.error('❌ DB connection error on startup:', error.message);
    // no tiramos el proceso; /readyz seguirá reflejando el estado real
  }
})();
