import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import { verifyToken } from './middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
async function initializeDB() {
  try {
    const client = await pool.connect();
    
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    const createConfigsTable = `
      CREATE TABLE IF NOT EXISTS configs (
        id UUID PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        protocol VARCHAR(50) NOT NULL,
        host VARCHAR(255) NOT NULL,
        port INTEGER NOT NULL,
        transport VARCHAR(50) NOT NULL,
        tls BOOLEAN DEFAULT false,
        uuid VARCHAR(255),
        password VARCHAR(255),
        path VARCHAR(255),
        sni VARCHAR(255),
        config_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_user_configs ON configs(user_id);
      CREATE INDEX IF NOT EXISTS idx_config_name ON configs(name);
    `;

    await client.query(createUsersTable);
    await client.query(createConfigsTable);
    await client.query(createIndexes);

    // Create default admin user if not exists
    try {
      const bcryptjs = (await import('bcryptjs')).default;
      const hashedPassword = await bcryptjs.hash('admin', 10);
      await client.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        ['admin', hashedPassword]
      );
    } catch (e) {
      // User might already exist
    }

    client.release();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

// Initialize on startup
initializeDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/configs', verifyToken, configRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, '../client/dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'خطای سرور'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 سرور در پورت ${PORT} اجرا می‌شود`);
});

export default app;
