// src/routes/food.routes.js
const express = require('express');
const prisma = require('../prisma/client');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate);

// GET /api/food - get menu for date range
router.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const isAdminView = req.user.role === 'ADMIN' || req.user.role === 'WARDEN';
    const where = {};

    if (from || to || !isAdminView) {
      const start = from ? new Date(from) : new Date();
      const end = to ? new Date(to) : new Date(Date.now() + 7 * 86400000);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    const menus = await prisma.foodMenu.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    if (!isAdminView || menus.length === 0) {
      return res.json({ menus });
    }

    const feedbacks = await prisma.foodFeedback.findMany({
      where: { menuId: { in: menus.map((menu) => menu.id) } },
      orderBy: { createdAt: 'desc' },
    });
    const studentIds = [...new Set(feedbacks.map((feedback) => feedback.studentId))];
    const students = studentIds.length
      ? await prisma.student.findMany({
          where: { id: { in: studentIds } },
          select: { id: true, fullName: true, rollNumber: true },
        })
      : [];

    const studentsById = Object.fromEntries(students.map((student) => [student.id, student]));
    const feedbacksByMenuId = feedbacks.reduce((acc, feedback) => {
      if (!acc[feedback.menuId]) acc[feedback.menuId] = [];
      acc[feedback.menuId].push({
        ...feedback,
        student: studentsById[feedback.studentId] || null,
      });
      return acc;
    }, {});

    res.json({
      menus: menus.map((menu) => ({
        ...menu,
        feedbacks: feedbacksByMenuId[menu.id] || [],
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/food - create/update menu (Admin)
router.post('/', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { date, dayOfWeek, breakfast, lunch, snacks, dinner, isVeg } = req.body;
    const menuDate = new Date(date);
    menuDate.setHours(0, 0, 0, 0);

    const menu = await prisma.foodMenu.upsert({
      where: { date: menuDate },
      update: { dayOfWeek, breakfast, lunch, snacks, dinner, isVeg },
      create: { date: menuDate, dayOfWeek, breakfast, lunch, snacks, dinner, isVeg },
    });
    res.status(201).json({ menu });
  } catch (err) {
    next(err);
  }
});

// PUT /api/food/:id - update existing menu (Admin)
router.put('/:id', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { date, dayOfWeek, breakfast, lunch, snacks, dinner, isVeg } = req.body;
    const menuDate = new Date(date);
    menuDate.setHours(0, 0, 0, 0);

    const menu = await prisma.foodMenu.update({
      where: { id: req.params.id },
      data: { date: menuDate, dayOfWeek, breakfast, lunch, snacks, dinner, isVeg },
    });
    res.json({ message: 'Menu updated', menu });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/food/:id - delete menu (Admin)
router.delete('/:id', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    await prisma.$transaction([
      prisma.foodFeedback.deleteMany({ where: { menuId: req.params.id } }),
      prisma.foodMenu.delete({ where: { id: req.params.id } }),
    ]);
    res.json({ message: 'Menu deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/food/:id/feedback - submit feedback
router.post('/:id/feedback', async (req, res, next) => {
  try {
    if (req.user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can submit feedback' });
    const { rating, comment } = req.body;
    const feedback = await prisma.foodFeedback.create({
      data: { menuId: req.params.id, studentId: req.user.student.id, rating: Number(rating), comment },
    });
    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
