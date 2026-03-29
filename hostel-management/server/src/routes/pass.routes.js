// src/routes/pass.routes.js
const express = require('express');
const prisma = require('../prisma/client');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate);

// ─── OUT PASSES ───────────────────────────────────────────────────────────────
router.get('/out', async (req, res, next) => {
  try {
    const isAdmin = ['ADMIN', 'WARDEN'].includes(req.user.role);
    const where = isAdmin ? {} : { studentId: req.user.student?.id };
    const passes = await prisma.outPass.findMany({
      where,
      include: { student: { select: { fullName: true, rollNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ passes });
  } catch (err) {
    next(err);
  }
});

router.post('/out', async (req, res, next) => {
  try {
    if (req.user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can apply for out pass' });
    const { date, timeOut, expectedReturn, reason } = req.body;
    const trimmedReason = reason?.trim();
    const passDate = new Date(date);
    const timeOutDate = new Date(timeOut);
    const expectedReturnDate = new Date(expectedReturn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!date || !timeOut || !expectedReturn || !trimmedReason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (Number.isNaN(passDate.getTime()) || Number.isNaN(timeOutDate.getTime()) || Number.isNaN(expectedReturnDate.getTime())) {
      return res.status(400).json({ error: 'Please provide valid date/time values' });
    }

    passDate.setHours(0, 0, 0, 0);

    if (passDate < today) {
      return res.status(400).json({ error: 'Out pass date cannot be in the past' });
    }

    if (!timeOut.startsWith(date)) {
      return res.status(400).json({ error: 'Time out must be on the selected date' });
    }

    if (expectedReturnDate <= timeOutDate) {
      return res.status(400).json({ error: 'Expected return must be later than time out' });
    }

    if (trimmedReason.length < 4) {
      return res.status(400).json({ error: 'Reason must be at least 4 characters long' });
    }

    if (trimmedReason.length > 200) {
      return res.status(400).json({ error: 'Reason cannot exceed 200 characters' });
    }

    const pass = await prisma.outPass.create({
      data: {
        studentId: req.user.student.id,
        date: passDate,
        timeOut: timeOutDate,
        expectedReturn: expectedReturnDate,
        reason: trimmedReason,
      },
    });
    res.status(201).json({ message: 'Out pass applied', pass });
  } catch (err) {
    next(err);
  }
});

router.patch('/out/:id', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const pass = await prisma.outPass.update({
      where: { id: req.params.id },
      data: { status, remarks, approvedBy: req.user.admin?.fullName || req.user.email },
    });
    res.json({ pass });
  } catch (err) {
    next(err);
  }
});

// ─── HOME PASSES ──────────────────────────────────────────────────────────────
router.get('/home', async (req, res, next) => {
  try {
    const isAdmin = ['ADMIN', 'WARDEN'].includes(req.user.role);
    const where = isAdmin ? {} : { studentId: req.user.student?.id };
    const passes = await prisma.homePass.findMany({
      where,
      include: { student: { select: { fullName: true, rollNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ passes });
  } catch (err) {
    next(err);
  }
});

router.post('/home', async (req, res, next) => {
  try {
    if (req.user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can apply for home pass' });
    const { fromDate, toDate, reason } = req.body;
    const trimmedReason = reason?.trim();
    const parsedFromDate = new Date(fromDate);
    const parsedToDate = new Date(toDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!fromDate || !toDate || !trimmedReason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (Number.isNaN(parsedFromDate.getTime()) || Number.isNaN(parsedToDate.getTime())) {
      return res.status(400).json({ error: 'Please provide valid from/to date and time values' });
    }

    const fromDay = new Date(parsedFromDate);
    fromDay.setHours(0, 0, 0, 0);

    if (fromDay < today) {
      return res.status(400).json({ error: 'From date cannot be in the past' });
    }

    if (parsedToDate <= parsedFromDate) {
      return res.status(400).json({ error: 'To date and time must be later than from date and time' });
    }

    if (trimmedReason.length < 4) {
      return res.status(400).json({ error: 'Reason must be at least 4 characters long' });
    }

    if (trimmedReason.length > 200) {
      return res.status(400).json({ error: 'Reason cannot exceed 200 characters' });
    }

    const pass = await prisma.homePass.create({
      data: {
        studentId: req.user.student.id,
        fromDate: parsedFromDate,
        toDate: parsedToDate,
        destination: 'N/A',
        guardianContact: 'N/A',
        reason: trimmedReason,
      },
    });
    res.status(201).json({ message: 'Home pass applied', pass });
  } catch (err) {
    next(err);
  }
});

router.patch('/home/:id', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const pass = await prisma.homePass.update({
      where: { id: req.params.id },
      data: { status, remarks, approvedBy: req.user.admin?.fullName || req.user.email },
    });
    res.json({ pass });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
