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
    const start = from ? new Date(from) : new Date();
    const end = to ? new Date(to) : new Date(Date.now() + 7 * 86400000);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const menus = await prisma.foodMenu.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    });
    res.json({ menus });
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
