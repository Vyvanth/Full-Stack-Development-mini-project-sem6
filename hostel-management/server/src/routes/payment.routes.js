// server/src/routes/payment.routes.js
const express = require('express');
const prisma = require('../prisma/client');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { sendEmail } = require('../utils/mailer');

const router = express.Router();
router.use(authenticate);

const ACADEMIC_YEAR_PATTERN = /^\d{4}-\d{2}$/;

function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startYear = month >= 6 ? year : year - 1;
  const endYearSuffix = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}-${endYearSuffix}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

async function sendPaymentStatusEmail({
  payment,
  subject,
  heading,
  intro,
  amountLabel,
  extraRows = '',
}) {
  if (!payment?.student?.user?.email) return;

  await sendEmail({
    to: payment.student.user.email,
    subject,
    text: `Hello ${payment.student.fullName}, ${intro} Fee: ${payment.fee.title}. ${amountLabel}: ${formatCurrency(payment.amount)}.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a;">
        <h2>${heading}</h2>
        <p>Hello ${payment.student.fullName},</p>
        <p>${intro}</p>
        <p><strong>Fee:</strong> ${payment.fee.title}<br/>
        <strong>${amountLabel}:</strong> ${formatCurrency(payment.amount)}<br/>
        ${extraRows}</p>
        <p>Please try again or contact the hostel office if you need help.</p>
      </div>
    `,
  });
}

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

  const [startYearText, endYearSuffix] = trimmedAcademicYear.split('-');
  const startYear = Number(startYearText);
  const expectedEndYearSuffix = String((startYear + 1) % 100).padStart(2, '0');
  if (endYearSuffix !== expectedEndYearSuffix) {
    return { error: 'Academic year must be a valid consecutive range like 2025-26.' };
  }

  const currentAcademicYear = getCurrentAcademicYear();
  if (trimmedAcademicYear < currentAcademicYear) {
    return { error: `Academic year cannot be earlier than ${currentAcademicYear}.` };
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
  if (!process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET === 'your_razorpay_key_secret') {
    throw new Error('Razorpay secret not configured');
  }
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

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

router.get('/fees', async (req, res, next) => {
  try {
    const fees = await prisma.fee.findMany({ orderBy: { dueDate: 'asc' } });
    res.json({ fees });
  } catch (err) {
    next(err);
  }
});

router.post('/fees', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { title, amount, dueDate, academicYear } = req.body;
    const { error, data } = normalizeFeePayload({ title, amount, dueDate, academicYear });
    if (error) return res.status(400).json({ error });

    const fee = await prisma.fee.create({
      data,
    });

    const students = await prisma.student.findMany({ select: { id: true } });
    const studentsWithEmails = await prisma.student.findMany({
      select: {
        fullName: true,
        user: { select: { email: true } },
      },
    });

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

    await Promise.allSettled(
      studentsWithEmails
        .filter((student) => student.user?.email)
        .map((student) => sendEmail({
          to: student.user.email,
          subject: `New Fee Due: ${fee.title}`,
          text: `Hello ${student.fullName}, a new fee "${fee.title}" of ${formatCurrency(fee.amount)} has been created. Due date: ${formatDate(fee.dueDate)}.`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #0f172a;">
              <h2>New Fee Due</h2>
              <p>Hello ${student.fullName},</p>
              <p>A new fee has been created in Campus Nest.</p>
              <p><strong>Fee:</strong> ${fee.title}<br/>
              <strong>Amount:</strong> ${formatCurrency(fee.amount)}<br/>
              <strong>Due Date:</strong> ${formatDate(fee.dueDate)}<br/>
              <strong>Academic Year:</strong> ${fee.academicYear}</p>
              <p>Please complete the payment before the due date.</p>
            </div>
          `,
        }))
    );

    res.status(201).json({
      fee,
      message: `Fee created and assigned to ${students.length} student(s).`,
    });
  } catch (err) {
    next(err);
  }
});

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

router.delete('/fees/:id', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    await prisma.payment.deleteMany({ where: { feeId: req.params.id } });
    await prisma.fee.delete({ where: { id: req.params.id } });
    res.json({ message: 'Fee and all associated payments deleted.' });
  } catch (err) {
    next(err);
  }
});

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
    const receipt = `pay_${paymentId.replace(/-/g, '').slice(0, 20)}`;
    const order = await razorpay.orders.create({
      amount: payment.amount * 100,
      currency: 'INR',
      receipt,
    });

    await prisma.payment.update({
      where: { id: paymentId },
      data: { razorpayOrderId: order.id, receipt },
    });

    res.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    if (err?.statusCode || err?.error?.description) {
      return res.status(err.statusCode || 400).json({
        error: err.error?.description || err.message || 'Failed to create Razorpay order.',
      });
    }
    next(err);
  }
});

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
      include: {
        fee: true,
        student: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
    });

    try {
      await sendPaymentStatusEmail({
        payment,
        subject: `Payment Successful: ${payment.fee.title}`,
        heading: 'Payment Successful',
        intro: 'Your payment was received successfully.',
        amountLabel: 'Amount Paid',
        extraRows: `
          <strong>Paid On:</strong> ${formatDate(payment.paidAt)}<br/>
          <strong>Payment ID:</strong> ${razorpay_payment_id}
        `,
      });
    } catch (mailErr) {
      console.warn('Payment success email failed:', mailErr.message);
    }

    res.json({ message: 'Payment verified successfully.', payment });
  } catch (err) {
    if (err?.statusCode || err?.error?.description) {
      return res.status(err.statusCode || 400).json({
        error: err.error?.description || err.message || 'Failed to verify Razorpay payment.',
      });
    }
    next(err);
  }
});

router.post('/notify-failure', async (req, res, next) => {
  try {
    const { paymentId, reason, code, source } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required.' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        fee: true,
        student: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
    });

    if (!payment) return res.status(404).json({ error: 'Payment record not found.' });
    if (req.user.role === 'STUDENT' && payment.studentId !== req.user.student?.id) {
      return res.status(403).json({ error: 'You can only notify failures for your own payments.' });
    }

    try {
      await sendPaymentStatusEmail({
        payment,
        subject: `Payment Failed: ${payment.fee.title}`,
        heading: 'Payment Failed',
        intro: 'Your recent payment attempt could not be completed.',
        amountLabel: 'Amount',
        extraRows: `
          <strong>Attempted On:</strong> ${formatDate(new Date())}<br/>
          ${reason ? `<strong>Reason:</strong> ${reason}<br/>` : ''}
          ${code ? `<strong>Error Code:</strong> ${code}<br/>` : ''}
          ${source ? `<strong>Source:</strong> ${source}` : ''}
        `,
      });
    } catch (mailErr) {
      console.warn('Payment failure email failed:', mailErr.message);
      return res.status(500).json({ error: 'Failed to send payment failure email.' });
    }

    res.json({ message: 'Payment failure email sent.' });
  } catch (err) {
    next(err);
  }
});

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
