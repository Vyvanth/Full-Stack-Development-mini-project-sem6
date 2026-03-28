// server/src/routes/payment.routes.js
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
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ─── GET /api/payments ────────────────────────────────────────────────────────
// Student: their own payments | Admin: all payments
router.get('/', async (req, res, next) => {
  try {
    const isAdmin = ['ADMIN', 'WARDEN'].includes(req.user.role);
    const where = isAdmin ? {} : { studentId: req.user.student?.id };

    const payments = await prisma.payment.findMany({
      where,
      include: {
        fee: true,
        student: { select: { fullName: true, rollNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ payments });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/payments/fees ───────────────────────────────────────────────────
// List all fee structures
router.get('/fees', async (req, res, next) => {
  try {
    const fees = await prisma.fee.findMany({ orderBy: { dueDate: 'asc' } });
    res.json({ fees });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/payments/fees ──────────────────────────────────────────────────
// Admin creates a fee → automatically creates a PENDING Payment for every student
router.post('/fees', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { title, amount, dueDate, academicYear } = req.body;

    if (!title || !amount || !dueDate || !academicYear) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 1. Create the fee record
    const fee = await prisma.fee.create({
      data: {
        title,
        amount: Number(amount),
        dueDate: new Date(dueDate),
        academicYear,
      },
    });

    // 2. Get all students
    const students = await prisma.student.findMany({
      select: { id: true },
    });

    // 3. Bulk-create a PENDING payment for every student
    if (students.length > 0) {
      await prisma.payment.createMany({
        data: students.map((s) => ({
          studentId: s.id,
          feeId: fee.id,
          amount: Number(amount),
          status: 'PENDING',
        })),
        skipDuplicates: true,
      });
    }

    res.status(201).json({
      fee,
      message: `Fee created and assigned to ${students.length} student(s) as pending payments.`,
    });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/payments/fees/:id ───────────────────────────────────────────
// Admin deletes a fee (also removes all associated payment records)
router.delete('/fees/:id', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    // Delete payments first (FK constraint)
    await prisma.payment.deleteMany({ where: { feeId: req.params.id } });
    await prisma.fee.delete({ where: { id: req.params.id } });
    res.json({ message: 'Fee and all associated payments deleted.' });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/payments/create-order ─────────────────────────────────────────
// Student initiates Razorpay payment
router.post('/create-order', async (req, res, next) => {
  try {
    const { paymentId } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { fee: true },
    });

    if (!payment) return res.status(404).json({ error: 'Payment record not found' });
    if (payment.status === 'PAID') return res.status(400).json({ error: 'This fee is already paid' });

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: payment.amount * 100, // convert to paise
      currency: 'INR',
      receipt: `receipt_${paymentId}`,
    });

    await prisma.payment.update({
      where: { id: paymentId },
      data: { razorpayOrderId: order.id },
    });

    res.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/payments/verify ────────────────────────────────────────────────
// Verify Razorpay payment signature and mark as PAID
router.post('/verify', async (req, res, next) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        razorpayPaymentId: razorpay_payment_id,
        paidAt: new Date(),
      },
    });

    res.json({ message: 'Payment verified successfully', payment });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/payments/:id ──────────────────────────────────────────────────
// Admin manually marks a payment as paid (e.g. cash payment)
router.patch('/:id', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === 'PAID' && { paidAt: new Date() }),
      },
    });
    res.json({ payment });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
