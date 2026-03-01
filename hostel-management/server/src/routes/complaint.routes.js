// src/routes/complaint.routes.js
const express = require('express');
const prisma = require('../prisma/client');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate);

// GET /api/complaints - Student: own complaints | Admin: all
router.get('/', async (req, res, next) => {
  try {
    const isAdmin = ['ADMIN', 'WARDEN'].includes(req.user.role);
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (!isAdmin) where.studentId = req.user.student?.id;
    if (status) where.status = status;

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: { student: { select: { fullName: true, rollNumber: true } } },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.complaint.count({ where }),
    ]);

    res.json({ complaints, total });
  } catch (err) {
    next(err);
  }
});

// POST /api/complaints - Student: create complaint
router.post('/', async (req, res, next) => {
  try {
    if (req.user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can file complaints' });
    const { category, description } = req.body;
    if (!category || !description) return res.status(400).json({ error: 'Category and description are required' });

    const complaint = await prisma.complaint.create({
      data: { studentId: req.user.student.id, category, description },
    });
    res.status(201).json({ message: 'Complaint submitted', complaint });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/complaints/:id - Admin: update status/priority
router.patch('/:id', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { status, priority, remarks } = req.body;
    const data = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (remarks) data.remarks = remarks;
    if (status === 'RESOLVED') data.resolvedAt = new Date();

    const complaint = await prisma.complaint.update({ where: { id: req.params.id }, data });
    res.json({ message: 'Complaint updated', complaint });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
