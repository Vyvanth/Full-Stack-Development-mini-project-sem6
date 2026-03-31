// src/routes/laundry.routes.js
const express = require('express');
const prisma = require('../prisma/client');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate);

const ALLOWED_LAUNDRY_TYPES = ['REGULAR', 'EXPRESS'];
const ACTIVE_LAUNDRY_STATUSES = ['PENDING', 'PICKED_UP', 'PROCESSING'];
const STATUS_FLOW = {
  PENDING: ['PICKED_UP'],
  PICKED_UP: ['PROCESSING'],
  PROCESSING: ['DELIVERED'],
  DELIVERED: [],
};

function parseDateOnly(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysBetween(start, end) {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

router.get('/', async (req, res, next) => {
  try {
    const isAdmin = ['ADMIN', 'WARDEN'].includes(req.user.role);
    const where = isAdmin ? {} : { studentId: req.user.student?.id };
    const requests = await prisma.laundryRequest.findMany({
      where,
      include: { student: { select: { fullName: true, rollNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ requests });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (req.user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can request laundry' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { clothesCount, laundryType, pickupDate, returnDate } = req.body;
    const parsedClothesCount = Number(clothesCount);
    const parsedPickupDate = pickupDate ? parseDateOnly(pickupDate) : new Date(today);
    const parsedReturnDate = parseDateOnly(returnDate);

    if (!Number.isInteger(parsedClothesCount) || parsedClothesCount <= 0) {
      return res.status(400).json({ error: 'Number of clothes must be a whole number greater than 0' });
    }

    if (parsedClothesCount > 100) {
      return res.status(400).json({ error: 'Number of clothes cannot exceed 100 in a single request' });
    }

    if (!ALLOWED_LAUNDRY_TYPES.includes(laundryType)) {
      return res.status(400).json({ error: 'Invalid laundry type selected' });
    }

    if (!parsedPickupDate || !parsedReturnDate) {
      return res.status(400).json({ error: 'Pickup date and return date must be valid dates' });
    }

    if (parsedPickupDate < today) {
      return res.status(400).json({ error: 'Pickup date cannot be in the past' });
    }

    if (parsedReturnDate < parsedPickupDate) {
      return res.status(400).json({ error: 'Return date cannot be earlier than pickup date' });
    }

    const turnaroundDays = daysBetween(parsedPickupDate, parsedReturnDate);
    if (laundryType === 'REGULAR' && turnaroundDays < 2) {
      return res.status(400).json({ error: 'Regular laundry should have at least a 2-day turnaround' });
    }

    if (laundryType === 'EXPRESS' && turnaroundDays > 1) {
      return res.status(400).json({ error: 'Express laundry should be scheduled for same day or next day return' });
    }

    const existingActiveRequest = await prisma.laundryRequest.findFirst({
      where: {
        studentId: req.user.student.id,
        status: { in: ACTIVE_LAUNDRY_STATUSES },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingActiveRequest) {
      return res.status(400).json({ error: 'You already have an active laundry request in progress' });
    }

    const amount = laundryType === 'EXPRESS' ? parsedClothesCount * 30 : parsedClothesCount * 15;
    const request = await prisma.laundryRequest.create({
      data: {
        studentId: req.user.student.id,
        clothesCount: parsedClothesCount,
        laundryType,
        pickupDate: parsedPickupDate,
        returnDate: parsedReturnDate,
        amount,
      },
    });
    res.status(201).json({ message: 'Laundry request submitted', request });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (req.user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can cancel laundry requests' });

    const request = await prisma.laundryRequest.findFirst({
      where: { id: req.params.id, studentId: req.user.student.id },
    });

    if (!request) return res.status(404).json({ error: 'Laundry request not found' });
    if (request.status !== 'PENDING') return res.status(400).json({ error: 'Only pending laundry requests can be cancelled' });

    await prisma.laundryRequest.delete({ where: { id: request.id } });
    res.json({ message: 'Laundry request cancelled' });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { status, isPaid } = req.body;
    const existingRequest = await prisma.laundryRequest.findUnique({ where: { id: req.params.id } });
    if (!existingRequest) return res.status(404).json({ error: 'Laundry request not found' });

    if (status && !STATUS_FLOW[existingRequest.status]?.includes(status) && status !== existingRequest.status) {
      return res.status(400).json({ error: 'Invalid laundry status transition' });
    }

    const nextIsPaid = isPaid !== undefined ? Boolean(isPaid) : existingRequest.isPaid;
    if (status === 'DELIVERED' && !nextIsPaid) {
      return res.status(400).json({ error: 'Mark the laundry request as paid before delivering it' });
    }

    const request = await prisma.laundryRequest.update({
      where: { id: req.params.id },
      data: { ...(status && { status }), ...(isPaid !== undefined && { isPaid }) },
    });
    res.json({ request });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
