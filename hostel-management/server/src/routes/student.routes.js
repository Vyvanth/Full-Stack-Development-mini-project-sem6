// src/routes/student.routes.js
const express = require('express');
const prisma = require('../prisma/client');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ─── GET /api/students/profile ────────────────────────────────────────────────
router.get('/profile', async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: {
        roomAllocation: { include: { room: true } },
        payments: { include: { fee: true }, orderBy: { createdAt: 'desc' }, take: 5 },
        complaints: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({
      student: {
        ...student,
        roomAllocation: student.roomAllocation?.isActive ? student.roomAllocation : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/students/profile ────────────────────────────────────────────────
router.put('/profile', async (req, res, next) => {
  try {
    const { fullName, phone, guardianName, guardianPhone, address } = req.body;
    const student = await prisma.student.update({
      where: { userId: req.user.id },
      data: { fullName, phone, guardianName, guardianPhone, address },
    });
    res.json({ message: 'Profile updated', student });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/students (Admin only) ──────────────────────────────────────────
router.get('/', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { rollNumber: { contains: search, mode: 'insensitive' } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: { user: { select: { email: true } }, roomAllocation: { include: { room: true } } },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    res.json({
      students: students.map((student) => ({
        ...student,
        roomAllocation: student.roomAllocation?.isActive ? student.roomAllocation : null,
      })),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/students/:id (Admin only) ──────────────────────────────────────
router.get('/:id', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { email: true, role: true } },
        roomAllocation: { include: { room: true } },
        complaints: { orderBy: { createdAt: 'desc' } },
        payments: { include: { fee: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({
      student: {
        ...student,
        roomAllocation: student.roomAllocation?.isActive ? student.roomAllocation : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/students/:id (Admin only) ───────────────────────────────────
router.delete('/:id', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    await prisma.user.delete({ where: { id: student.userId } });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
