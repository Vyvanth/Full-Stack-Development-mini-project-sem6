// server/src/routes/payment.routes.js
const express = require('express');
const prisma = require('../prisma/client');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate);

const ACADEMIC_YEAR_PATTERN = /^\d{4}-\d{2}$/;

function normalizeFeePayload({ title, amount, dueDate, academicYear }) {
  const trimmedTitle = title?.trim();
  const trimmedAcademicYear = academicYear?.trim();
  const parsedAmount = Number(amount);
  const parsedDueDate = new Date(dueDate);

  if (!trimmedTitle || !trimmedAcademicYear || !dueDate || Number.isNaN(parsedAmount)) {
    return { error: 'All fields are required.' };
  }

  if (trimmedTitle.length < 3 || trimmedTitle.length > 80) {
    return { error: 'Fee title must be between 3 and 80 characters.' };
  }

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return { error: 'Amount must be greater than 0.' };
  }

  if (Number.isNaN(parsedDueDate.getTime())) {
    return { error: 'Please provide a valid due date.' };
  }

  parsedDueDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedDueDate < today) {
    return { error: 'Due date cannot be in the past.' };
  }

  if (!ACADEMIC_YEAR_PATTERN.test(trimmedAcademicYear)) {
    return { error: 'Academic year must be in YYYY-YY format.' };
  }

  return {
    data: {
      title: trimmedTitle,
      amount: parsedAmount,
      dueDate: parsedDueDate,
      academicYear: trimmedAcademicYear,
    },
  };
}

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
router.get('/fees', async (req, res, next) => {
  try {
    const fees = await prisma.fee.findMany({ orderBy: { dueDate: 'asc' } });
    res.json({ fees });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/payments/fees ──────────────────────────────────────────────────
// Create fee + auto-assign PENDING payment to every student
router.post('/fees', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { title, amount, dueDate, academicYear } = req.body;
    const { error, data } = normalizeFeePayload({ title, amount, dueDate, academicYear });
    if (error) return res.status(400).json({ error });

    const fee = await prisma.fee.create({
      data,
    });

    const students = await prisma.student.findMany({ select: { id: true } });

    if (students.length > 0) {
      await prisma.payment.createMany({
        data: students.map((s) => ({
          studentId: s.id,
          feeId: fee.id,
          amount: data.amount,
          status: 'PENDING',
        })),
        skipDuplicates: true,
      });
    }

    res.status(201).json({
      fee,
      message: `Fee created and assigned to ${students.length} student(s).`,
    });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/payments/fees/:id ─────────────────────────────────────────────
// Edit fee title, amount, dueDate, academicYear
// Also updates the amount on all PENDING payment records for this fee
router.patch('/fees/:id', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { title, amount, dueDate, academicYear } = req.body;
    const existingFee = await prisma.fee.findUnique({ where: { id: req.params.id } });
    if (!existingFee) return res.status(404).json({ error: 'Fee not found.' });

    const { error, data } = normalizeFeePayload({
      title: title ?? existingFee.title,
      amount: amount ?? existingFee.amount,
      dueDate: dueDate ?? existingFee.dueDate,
      academicYear: academicYear ?? existingFee.academicYear,
    });
    if (error) return res.status(400).json({ error });

    const fee = await prisma.fee.update({
      where: { id: req.params.id },
      data,
    });

    // If amount changed, update all PENDING payments for this fee
    if (data.amount !== existingFee.amount) {
      await prisma.payment.updateMany({
        where: { feeId: req.params.id, status: 'PENDING' },
        data: { amount: data.amount },
      });
    }

    res.json({ fee, message: 'Fee updated. Pending payments updated accordingly.' });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/payments/fees/:id ───────────────────────────────────────────
router.delete('/fees/:id', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    await prisma.payment.deleteMany({ where: { feeId: req.params.id } });
    await prisma.fee.delete({ where: { id: req.params.id } });
    res.json({ message: 'Fee and all associated payments deleted.' });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/payments/create-order ─────────────────────────────────────────
router.post('/create-order', async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: 'Payment ID is required.' });

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { fee: true },
    });

    if (!payment) return res.status(404).json({ error: 'Payment record not found.' });
    if (req.user.role === 'STUDENT' && payment.studentId !== req.user.student?.id) {
      return res.status(403).json({ error: 'You can only create orders for your own payments.' });
    }
    if (payment.status === 'PAID') return res.status(400).json({ error: 'This fee is already paid.' });

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: payment.amount * 100,
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
router.post('/verify', async (req, res, next) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
      return res.status(400).json({ error: 'Missing payment verification details.' });
    }

    const existingPayment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!existingPayment) return res.status(404).json({ error: 'Payment record not found.' });
    if (req.user.role === 'STUDENT' && existingPayment.studentId !== req.user.student?.id) {
      return res.status(403).json({ error: 'You can only verify your own payments.' });
    }
    if (existingPayment.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ error: 'Order ID does not match the initiated payment.' });
    }
    if (existingPayment.status === 'PAID') {
      return res.status(400).json({ error: 'This payment is already marked as paid.' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature.' });
    }

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paidAt: new Date(),
      },
    });

    res.json({ message: 'Payment verified successfully.', payment });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/payments/:id ──────────────────────────────────────────────────
// Admin: manually mark a payment as PAID (cash) or revert to PENDING
router.patch('/:id', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['PENDING', 'PAID', 'OVERDUE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : null,
      },
    });

    res.json({ payment, message: `Payment marked as ${status}.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
