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
    const pass = await prisma.outPass.create({
      data: {
        studentId: req.user.student.id,
        date: new Date(date),
        timeOut: new Date(timeOut),
        expectedReturn: new Date(expectedReturn),
        reason,
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
    const { fromDate, toDate, destination, guardianContact, reason } = req.body;
    const pass = await prisma.homePass.create({
      data: {
        studentId: req.user.student.id,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        destination,
        guardianContact,
        reason,
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
