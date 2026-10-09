const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();



// ─── 1. Register a student ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, studentId, collegeName } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    const finalCollege = collegeName || 'State University';
    const finalStudentId = studentId || ('STU' + Math.floor(100000 + Math.random() * 900000));

    // Check if user exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'A student account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO users (full_name, email, password_hash, student_id, college_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, student_id, college_name, created_at`,
      [fullName.trim(), email.toLowerCase().trim(), passwordHash, finalStudentId.trim(), finalCollege.trim()]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.full_name },
      process.env.JWT_SECRET || 'campus_marketplace_secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        studentId: user.student_id,
        collegeName: user.college_name
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// ─── 2. Login a student ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.full_name },
      process.env.JWT_SECRET || 'campus_marketplace_secret',
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        studentId: user.student_id,
        collegeName: user.college_name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// ─── 3. Get current logged-in user profile ────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, full_name, email, student_id, college_name, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const u = result.rows[0];
    return res.json({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      studentId: u.student_id,
      collegeName: u.college_name,
      createdAt: u.created_at
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

module.exports = router;
