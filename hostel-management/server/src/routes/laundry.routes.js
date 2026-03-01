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
    const amount = laundryType === 'EXPRESS' ? clothesCount * 30 : clothesCount * 15;

    const request = await prisma.laundryRequest.create({
      data: {
        studentId: req.user.student.id,
        clothesCount: Number(clothesCount),
        laundryType,
        pickupDate: new Date(pickupDate),
        returnDate: new Date(returnDate),
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
