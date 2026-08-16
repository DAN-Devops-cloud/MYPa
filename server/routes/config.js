import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import pool from '../db.js';
import { generateConfig, validateConfig } from './utils.js';

const router = express.Router();

// Get all configs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, user_id, name, protocol, host, port, transport, tls, path, sni, created_at, updated_at FROM configs WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one config
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM configs WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کانفیگ پیدا نشد' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create config
router.post('/', async (req, res) => {
  try {
    const {
      name,
      protocol,
      host,
      port,
      transport,
      tls,
      uuid,
      password,
      path,
      sni
    } = req.body;

    if (!validateConfig(req.body)) {
      return res.status(400).json({ error: 'داده‌های نامعتبر' });
    }

    const configId = uuidv4();
    const configData = {
      protocol,
      host,
      port,
      transport,
      tls: tls || false,
      uuid: uuid || uuidv4(),
      password,
      path: path || '/',
      sni: sni || host
    };

    const result = await pool.query(
      `INSERT INTO configs 
       (id, user_id, name, protocol, host, port, transport, tls, uuid, password, path, sni, config_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, user_id, name, protocol, host, port, transport, tls, uuid, password, path, sni, created_at, updated_at`,
      [
        configId,
        req.user.id,
        name,
        protocol,
        port,
        host,
        port,
        transport,
        tls || false,
        configData.uuid,
        password,
        path || '/',
        sni || host,
        JSON.stringify(configData)
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update config
router.put('/:id', async (req, res) => {
  try {
    const { name, host, port, transport, tls, path, sni } = req.body;

    const result = await pool.query(
      `UPDATE configs 
       SET name = $1, host = $2, port = $3, transport = $4, tls = $5, path = $6, sni = $7, updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING id, user_id, name, protocol, host, port, transport, tls, uuid, password, path, sni, created_at, updated_at`,
      [name, host, port, transport, tls, path, sni, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کانفیگ پیدا نشد' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete config
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM configs WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کانفیگ پیدا نشد' });
    }

    res.json({ message: 'کانفیگ حذف شد' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate config
router.post('/:id/generate', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM configs WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'کانفیگ پیدا نشد' });
    }

    const config = result.rows[0];
    const configString = generateConfig(config);
    const base64Config = Buffer.from(configString).toString('base64');

    const qrCode = await QRCode.toDataURL(configString);

    res.json({
      configString,
      base64Config,
      qrCode,
      shareLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/import?config=${base64Config}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
