const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure photo upload storage
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
    cb(null, 'extra-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ──── STATIC ROUTES FIRST (before parameterized routes) ────

// 1. Get all photo requests for the logged-in user (both incoming as seller and outgoing as buyer)
router.get('/my-requests', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT pr.id, pr.listing_id, pr.buyer_id, pr.message, pr.status, pr.created_at,
              u.full_name as buyer_name, u.email as buyer_email,
              l.title as listing_title, l.image_url as listing_image,
              l.seller_id
       FROM photo_requests pr
       JOIN users u ON pr.buyer_id = u.id
       JOIN listings l ON pr.listing_id = l.id
       WHERE l.seller_id = $1 OR pr.buyer_id = $2
       ORDER BY pr.created_at DESC`,
      [userId, userId]
    );

    return res.json(result.rows.map(row => ({
      id: row.id,
      listingId: row.listing_id,
      buyerId: row.buyer_id,
      buyerName: row.buyer_name || row.full_name,
      buyerEmail: row.buyer_email || row.email,
      listingTitle: row.listing_title || row.title,
      listingImage: row.listing_image || row.image_url,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
      isSeller: String(row.seller_id) === String(userId)
    })));
  } catch (err) {
    console.error('Error fetching photo requests:', err);
    return res.status(500).json({ error: 'Failed to fetch photo requests' });
  }
});

// ──── PARAMETERIZED ROUTES ────

// 2. Buyer requests more photos for a listing
router.post('/:listingId/request', authMiddleware, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { message } = req.body;
    const buyerId = req.user.id;

    // Check listing exists
    const listingResult = await db.query('SELECT id, seller_id FROM listings WHERE id = $1', [listingId]);
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Don't allow seller to request photos of their own listing
    if (listingResult.rows[0].seller_id === buyerId) {
      return res.status(400).json({ error: 'You cannot request photos for your own listing' });
    }

    // Check for existing pending request from same buyer
    const existingResult = await db.query(
      `SELECT id FROM photo_requests WHERE listing_id = $1 AND buyer_id = $2 AND status = $3`,
      [listingId, buyerId, 'Pending']
    );
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a pending photo request for this listing' });
    }

    const result = await db.query(
      `INSERT INTO photo_requests (listing_id, buyer_id, message, status)
       VALUES ($1, $2, $3, 'Pending')
       RETURNING *`,
      [listingId, buyerId, message || 'Please share more photos of this item.']
    );

    return res.status(201).json({
      message: 'Photo request sent to seller!',
      request: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating photo request:', err);
    return res.status(500).json({ error: 'Failed to create photo request' });
  }
});

// 3. Get photo requests for a listing (for buyer to see their request status)
router.get('/:listingId/requests', async (req, res) => {
  try {
    const { listingId } = req.params;

    const result = await db.query(
      `SELECT pr.id, pr.listing_id, pr.buyer_id, pr.message, pr.status, pr.created_at,
              u.full_name as buyer_name
       FROM photo_requests pr
       JOIN users u ON pr.buyer_id = u.id
       WHERE pr.listing_id = $1
       ORDER BY pr.created_at DESC`,
      [listingId]
    );

    return res.json(result.rows.map(row => ({
      id: row.id,
      listingId: row.listing_id,
      buyerId: row.buyer_id,
      buyerName: row.buyer_name || row.full_name,
      message: row.message,
      status: row.status,
      createdAt: row.created_at
    })));
  } catch (err) {
    console.error('Error fetching photo requests:', err);
    return res.status(500).json({ error: 'Failed to fetch photo requests' });
  }
});

// 4. Seller uploads photos in response to a request
router.post('/:requestId/upload', authMiddleware, upload.array('photos', 5), async (req, res) => {
  try {
    const { requestId } = req.params;

    // Verify the request exists and belongs to seller's listing
    const requestResult = await db.query(
      `SELECT pr.id, pr.listing_id, pr.status, l.seller_id
       FROM photo_requests pr
       JOIN listings l ON pr.listing_id = l.id
       WHERE pr.id = $1`,
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Photo request not found' });
    }

    const photoRequest = requestResult.rows[0];
    if (photoRequest.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the seller can upload photos for this request' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one photo is required' });
    }

    // Insert each uploaded photo
    const insertedPhotos = [];
    for (const file of req.files) {
      const photoUrl = `/uploads/${file.filename}`;
      const photoResult = await db.query(
        `INSERT INTO listing_photos (listing_id, request_id, photo_url)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [photoRequest.listing_id, requestId, photoUrl]
      );
      insertedPhotos.push(photoResult.rows[0]);
    }

    // Update request status to Fulfilled
    await db.query(
      `UPDATE photo_requests SET status = $1 WHERE id = $2`,
      ['Fulfilled', requestId]
    );

    return res.json({
      message: 'Photos uploaded successfully!',
      photos: insertedPhotos.map(p => ({
        id: p.id,
        photoUrl: p.photo_url,
        createdAt: p.created_at
      }))
    });
  } catch (err) {
    console.error('Error uploading photos:', err);
    return res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// 5. Get all extra photos for a listing (visible to everyone)
router.get('/:listingId/photos', async (req, res) => {
  try {
    const { listingId } = req.params;

    const result = await db.query(
      `SELECT id, listing_id, request_id, photo_url, created_at
       FROM listing_photos
       WHERE listing_id = $1
       ORDER BY created_at ASC`,
      [listingId]
    );

    return res.json(result.rows.map(row => ({
      id: row.id,
      listingId: row.listing_id,
      requestId: row.request_id,
      photoUrl: row.photo_url,
      createdAt: row.created_at
    })));
  } catch (err) {
    console.error('Error fetching listing photos:', err);
    return res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

module.exports = router;
