const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure image upload storage
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'item-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// 1. Get all listings (Available by default, supports search & category filter)
router.get('/', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let queryText = `
      SELECT l.id, l.title, l.description, l.price, l.category, l.condition, l.image_url, l.status, l.created_at,
             u.id as seller_id, u.full_name as seller_name, u.email as seller_email
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by status (default to Available if not explicitly passed as 'all')
    if (status !== 'all') {
      params.push(status || 'Available');
      queryText += ` AND l.status = $${params.length}`;
    }

    // Category filter
    if (category && category !== 'All') {
      params.push(category);
      queryText += ` AND l.category = $${params.length}`;
    }

    // Search query filter
    if (search) {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (l.title ILIKE $${params.length} OR l.description ILIKE $${params.length})`;
    }

    queryText += ` ORDER BY l.created_at DESC`;

    const result = await db.query(queryText, params);

    const listings = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      category: row.category,
      condition: row.condition,
      imageUrl: row.image_url,
      status: row.status,
      createdAt: row.created_at,
      seller: {
        id: row.seller_id,
        fullName: row.seller_name,
        email: row.seller_email
      }
    }));

    return res.json(listings);
  } catch (err) {
    console.error('Error fetching listings:', err);
    return res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// 2. Get listings created by current logged in seller
router.get('/my/listings', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, title, description, price, category, condition, image_url, status, created_at
       FROM listings
       WHERE seller_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const listings = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      category: row.category,
      condition: row.condition,
      imageUrl: row.image_url,
      status: row.status,
      createdAt: row.created_at
    }));

    return res.json(listings);
  } catch (err) {
    console.error('Error fetching my listings:', err);
    return res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

// SEED: Create listing via JSON (no file upload, for demo data population)
router.post('/seed', authMiddleware, async (req, res) => {
  try {
    const { title, description, price, category, condition, imageUrl } = req.body;
    if (!title || !description || !price || !category || !condition) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const result = await db.query(
      `INSERT INTO listings (seller_id, title, description, price, category, condition, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Available')
       RETURNING id, title, price, category`,
      [req.user.id, title.trim(), description.trim(), parseFloat(price), category, condition, imageUrl || null]
    );
    return res.status(201).json({ message: 'Seeded', listing: result.rows[0] });
  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({ error: 'Seed failed' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT l.id, l.title, l.description, l.price, l.category, l.condition, l.image_url, l.status, l.created_at,
              u.id as seller_id, u.full_name as seller_name, u.email as seller_email, u.student_id as seller_student_id
       FROM listings l
       JOIN users u ON l.seller_id = u.id
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const row = result.rows[0];
    return res.json({
      id: row.id,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      category: row.category,
      condition: row.condition,
      imageUrl: row.image_url,
      status: row.status,
      createdAt: row.created_at,
      seller: {
        id: row.seller_id,
        fullName: row.seller_name,
        email: row.seller_email,
        studentId: row.seller_student_id
      }
    });
  } catch (err) {
    console.error('Error fetching listing detail:', err);
    return res.status(500).json({ error: 'Failed to fetch listing detail' });
  }
});

// 4. Create a new listing (Seller enters title, description, price, category, condition, image)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category, condition, imageUrl } = req.body;

    if (!title || !description || !price || !category || !condition) {
      return res.status(400).json({ error: 'Title, description, price, category, and condition are required' });
    }

    let finalImageUrl = imageUrl || null;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const result = await db.query(
      `INSERT INTO listings (seller_id, title, description, price, category, condition, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Available')
       RETURNING id, title, description, price, category, condition, image_url, status, created_at`,
      [req.user.id, title.trim(), description.trim(), parseFloat(price), category, condition, finalImageUrl]
    );

    const row = result.rows[0];
    return res.status(201).json({
      message: 'Listing created successfully',
      listing: {
        id: row.id,
        title: row.title,
        description: row.description,
        price: parseFloat(row.price),
        category: row.category,
        condition: row.condition,
        imageUrl: row.image_url,
        status: row.status,
        createdAt: row.created_at
      }
    });
  } catch (err) {
    console.error('Error creating listing:', err);
    return res.status(500).json({ error: 'Failed to create listing' });
  }
});

// 5. Delete a listing (only the seller who created it can delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const checkResult = await db.query(
      'SELECT seller_id, image_url FROM listings WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = checkResult.rows[0];
    if (listing.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized. Only the seller who created this listing can delete it.' });
    }

    // Delete orders linked to this listing first
    await db.query('DELETE FROM orders WHERE listing_id = $1', [id]);

    // Delete listing from DB
    await db.query('DELETE FROM listings WHERE id = $1', [id]);

    // Remove local image file if exists
    if (listing.image_url && listing.image_url.startsWith('/uploads/')) {
      const localPath = path.join(__dirname, '..', listing.image_url);
      if (fs.existsSync(localPath)) {
        try { fs.unlinkSync(localPath); } catch (e) {}
      }
    }

    return res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('Error deleting listing:', err);
    return res.status(500).json({ error: 'Failed to delete listing' });
  }
});

module.exports = router;
