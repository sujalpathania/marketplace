const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 1. Create an Order (Buyer clicks "Buy")
router.post('/', authMiddleware, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { listingId } = req.body;
    const buyerId = req.user.id;

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    await client.query('BEGIN');

    // Fetch listing to check availability and seller
    const listingRes = await client.query('SELECT * FROM listings WHERE id = $1 FOR UPDATE', [listingId]);
    if (listingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingRes.rows[0];

    if (listing.status !== 'Available') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'This item is no longer available for purchase' });
    }

    // Allow self-purchase in demo/testing mode
    // if (listing.seller_id === buyerId) {
    //   await client.query('ROLLBACK');
    //   return res.status(400).json({ error: 'You cannot purchase your own listing' });
    // }

    // Create Order
    const orderRes = await client.query(
      `INSERT INTO orders (listing_id, buyer_id, seller_id, total_price, status)
       VALUES ($1, $2, $3, $4, 'Confirmed')
       RETURNING id, listing_id, buyer_id, seller_id, total_price, status, created_at`,
      [listing.id, buyerId, listing.seller_id, listing.price]
    );

    // Update Listing status to 'Sold'
    await client.query(`UPDATE listings SET status = 'Sold' WHERE id = $1`, [listing.id]);

    await client.query('COMMIT');

    const order = orderRes.rows[0];
    return res.status(201).json({
      message: 'Order created successfully! The item is now marked as Sold.',
      order: {
        id: order.id,
        listingId: order.listing_id,
        buyerId: order.buyer_id,
        sellerId: order.seller_id,
        totalPrice: parseFloat(order.total_price),
        status: order.status,
        createdAt: order.created_at
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', err);
    return res.status(500).json({ error: 'Failed to complete order transaction' });
  } finally {
    client.release();
  }
});

// 2. Get my purchases (as Buyer)
router.get('/my-purchases', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.id, o.total_price, o.status, o.created_at,
              l.id as listing_id, l.title as listing_title, l.image_url as listing_image, l.category as listing_category,
              u.id as seller_id, u.full_name as seller_name, u.email as seller_email
       FROM orders o
       JOIN listings l ON o.listing_id = l.id
       JOIN users u ON o.seller_id = u.id
       WHERE o.buyer_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    const orders = result.rows.map(row => ({
      id: row.id,
      totalPrice: parseFloat(row.total_price),
      status: row.status,
      createdAt: row.created_at,
      listing: {
        id: row.listing_id,
        title: row.listing_title,
        imageUrl: row.listing_image,
        category: row.listing_category
      },
      seller: {
        id: row.seller_id,
        fullName: row.seller_name,
        email: row.seller_email
      }
    }));

    return res.json(orders);
  } catch (err) {
    console.error('Error fetching purchases:', err);
    return res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// 3. Get my sales (as Seller - allows seller to see who ordered their items)
router.get('/my-sales', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.id, o.total_price, o.status, o.created_at,
              l.id as listing_id, l.title as listing_title, l.image_url as listing_image, l.category as listing_category,
              u.id as buyer_id, u.full_name as buyer_name, u.email as buyer_email, u.student_id as buyer_student_id
       FROM orders o
       JOIN listings l ON o.listing_id = l.id
       JOIN users u ON o.buyer_id = u.id
       WHERE o.seller_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    const orders = result.rows.map(row => ({
      id: row.id,
      totalPrice: parseFloat(row.total_price),
      status: row.status,
      createdAt: row.created_at,
      listing: {
        id: row.listing_id,
        title: row.listing_title,
        imageUrl: row.listing_image,
        category: row.listing_category
      },
      buyer: {
        id: row.buyer_id,
        fullName: row.buyer_name,
        email: row.buyer_email,
        studentId: row.buyer_student_id
      }
    }));

    return res.json(orders);
  } catch (err) {
    console.error('Error fetching sales:', err);
    return res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

module.exports = router;
