// src/routes/payment.routes.js
const express = require('express');
const prisma = require('../prisma/client');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate);

// Lazy-load Razorpay only if credentials are set
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id') {
    throw new Error('Razorpay credentials not configured');
  }
  const Razorpay = require('razorpay');
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

// GET /api/payments - list payments
router.get('/', async (req, res, next) => {
  try {
    const isAdmin = ['ADMIN', 'WARDEN'].includes(req.user.role);
    const where = isAdmin ? {} : { studentId: req.user.student?.id };
    const payments = await prisma.payment.findMany({
      where,
      include: { fee: true, student: { select: { fullName: true, rollNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ payments });
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/fees - list all fee structures (Admin)
router.get('/fees', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const fees = await prisma.fee.findMany({ orderBy: { dueDate: 'asc' } });
    res.json({ fees });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/fees - create fee (Admin)
router.post('/fees', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const { title, amount, dueDate, academicYear } = req.body;
    const fee = await prisma.fee.create({ data: { title, amount: Number(amount), dueDate: new Date(dueDate), academicYear } });
    res.status(201).json({ fee });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/create-order - Razorpay order
router.post('/create-order', async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { fee: true } });
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: payment.amount * 100, // paise
      currency: 'INR',
      receipt: `receipt_${paymentId}`,
    });

    await prisma.payment.update({ where: { id: paymentId }, data: { razorpayOrderId: order.id } });
    res.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/verify - Verify Razorpay payment
router.post('/verify', async (req, res, next) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

    if (expectedSig !== razorpay_signature) return res.status(400).json({ error: 'Invalid payment signature' });

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'PAID', razorpayPaymentId: razorpay_payment_id, paidAt: new Date() },
    });
    res.json({ message: 'Payment verified', payment });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
