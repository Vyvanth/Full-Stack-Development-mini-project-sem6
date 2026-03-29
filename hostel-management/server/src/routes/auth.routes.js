// server/src/routes/auth.routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, phone, course, branch, password, rollNumber } = req.body;

    if (!fullName || !email || !phone || !course || !branch || !password || !rollNumber) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // ── Validations ──────────────────────────────────────────────────────────

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Phone: exactly 10 digits, starts with 6, 7, 8, or 9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        error: 'Phone number must be 10 digits and start with 6, 7, 8, or 9.',
      });
    }

    // Password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Roll number: basic non-empty check (adjust regex to your format if needed)
    if (rollNumber.trim().length < 3) {
      return res.status(400).json({ error: 'Please enter a valid roll number.' });
    }

    // Duplicate email
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: 'This email is already registered.' });
    }

    // Duplicate roll number
    const existingRoll = await prisma.student.findUnique({ where: { rollNumber } });
    if (existingRoll) {
      return res.status(409).json({ error: 'This roll number is already registered.' });
    }

    // ── Create user + student ─────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'STUDENT',
        student: {
          create: { fullName, phone, course, branch, rollNumber },
        },
      },
      include: { student: true },
    });

    // ── Auto-assign all existing fees to the new student ─────────────────────
    const allFees = await prisma.fee.findMany();

    if (allFees.length > 0) {
      await prisma.payment.createMany({
        data: allFees.map((fee) => ({
          studentId: user.student.id,
          feeId: fee.id,
          amount: fee.amount,
          status: 'PENDING',
        })),
        skipDuplicates: true,
      });
    }

    const token = generateToken(user.id);
    const { password: _pw, ...safeUser } = user;

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true, admin: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'No account found with this email address.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const token = generateToken(user.id);
    const { password: _pw, ...safeUser } = user;

    res.json({ message: 'Login successful', token, user: safeUser });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  const { password: _pw, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// ─── POST /api/auth/change-password ──────────────────────────────────────────
router.post('/change-password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;