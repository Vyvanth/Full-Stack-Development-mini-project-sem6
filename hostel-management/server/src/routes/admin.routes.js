// src/routes/admin.routes.js
const express = require('express');
const prisma = require('../prisma/client');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate, authorizeRoles('ADMIN', 'WARDEN'));

// GET /api/admin/dashboard - aggregated stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalRooms,
      pendingComplaints,
      pendingOutPasses,
      pendingHomePasses,
      revenueData,
      roomStats,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.room.count(),
      prisma.complaint.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
      prisma.outPass.count({ where: { status: 'PENDING' } }),
      prisma.homePass.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
      prisma.room.groupBy({ by: ['status'], _count: true }),
    ]);

    const occupiedRooms = roomStats.find(r => r.status === 'OCCUPIED')?._count || 0;
    const fullRooms = roomStats.find(r => r.status === 'FULL')?._count || 0;
    const occupancyPct = totalRooms > 0 ? (((occupiedRooms + fullRooms) / totalRooms) * 100).toFixed(1) : 0;

    res.json({
      totalStudents,
      totalRooms,
      occupancyPercentage: Number(occupancyPct),
      pendingComplaints,
      pendingPassRequests: pendingOutPasses + pendingHomePasses,
      totalRevenue: revenueData._sum.amount || 0,
      roomStats,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/create-warden
router.post('/create-warden', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const bcrypt = require('bcryptjs');
    const { email, password, fullName, phone } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, role: 'WARDEN', admin: { create: { fullName, phone } } },
      include: { admin: true },
    });
    const { password: _pw, ...safeUser } = user;
    res.status(201).json({ message: 'Warden created', user: safeUser });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
