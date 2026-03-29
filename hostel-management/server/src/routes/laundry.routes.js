// src/routes/laundry.routes.js
const express = require('express');
const prisma = require('../prisma/client');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate);

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
    const { clothesCount, laundryType, pickupDate, returnDate } = req.body;
    const parsedClothesCount = Number(clothesCount);
    const parsedPickupDate = new Date(pickupDate);
    const parsedReturnDate = new Date(returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!Number.isInteger(parsedClothesCount) || parsedClothesCount <= 0) {
      return res.status(400).json({ error: 'Number of clothes must be a whole number greater than 0' });
    }

    if (parsedClothesCount > 100) {
      return res.status(400).json({ error: 'Number of clothes cannot exceed 100 in a single request' });
    }

    if (!['REGULAR', 'EXPRESS'].includes(laundryType)) {
      return res.status(400).json({ error: 'Invalid laundry type selected' });
    }

    if (Number.isNaN(parsedPickupDate.getTime()) || Number.isNaN(parsedReturnDate.getTime())) {
      return res.status(400).json({ error: 'Pickup date and return date must be valid dates' });
    }

    parsedPickupDate.setHours(0, 0, 0, 0);
    parsedReturnDate.setHours(0, 0, 0, 0);

    if (parsedPickupDate < today) {
      return res.status(400).json({ error: 'Pickup date cannot be in the past' });
    }

    if (parsedReturnDate < parsedPickupDate) {
      return res.status(400).json({ error: 'Return date cannot be earlier than pickup date' });
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

router.patch('/:id', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { status, isPaid } = req.body;
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
