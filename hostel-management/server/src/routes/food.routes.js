// src/routes/food.routes.js
const express = require('express');
const prisma = require('../prisma/client');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate);

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MAX_MEAL_ITEMS = 10;
const MAX_ITEM_LENGTH = 60;
const MEAL_ITEM_PATTERN = /[A-Za-z0-9]/;

function normalizeMenuDate(date) {
  const menuDate = new Date(date);
  if (Number.isNaN(menuDate.getTime())) return null;
  menuDate.setHours(0, 0, 0, 0);
  return menuDate;
}

function normalizeMealItems(items) {
  if (!Array.isArray(items)) return null;
  return items
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function validateMenuPayload({ date, dayOfWeek, breakfast, lunch, snacks, dinner }) {
  const menuDate = normalizeMenuDate(date);
  if (!menuDate) return { error: 'Please provide a valid date' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (menuDate < today) return { error: 'Date cannot be in the past' };

  const expectedDay = DAYS[menuDate.getDay()];
  if (!dayOfWeek || dayOfWeek !== expectedDay) {
    return { error: 'Day must match the selected date' };
  }

  const normalizedMeals = {
    breakfast: normalizeMealItems(breakfast),
    lunch: normalizeMealItems(lunch),
    snacks: normalizeMealItems(snacks),
    dinner: normalizeMealItems(dinner),
  };

  for (const [label, key] of [['Breakfast', 'breakfast'], ['Lunch', 'lunch'], ['Snacks', 'snacks'], ['Dinner', 'dinner']]) {
    const items = normalizedMeals[key];
    if (!items) return { error: `${label} must be sent as a list of items` };
    if (items.length === 0) return { error: `${label} must have at least one item` };
    if (items.length > MAX_MEAL_ITEMS) return { error: `${label} can have at most ${MAX_MEAL_ITEMS} items` };
    if (items.some((item) => item.length > MAX_ITEM_LENGTH)) {
      return { error: `${label} items must be ${MAX_ITEM_LENGTH} characters or less` };
    }
    if (items.some((item) => !MEAL_ITEM_PATTERN.test(item))) {
      return { error: `${label} items must contain real food names, not only symbols` };
    }
  }

  return { menuDate, normalizedMeals };
}

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
    const { error, menuDate, normalizedMeals } = validateMenuPayload({ date, dayOfWeek, breakfast, lunch, snacks, dinner });
    if (error) return res.status(400).json({ error });

    const menu = await prisma.foodMenu.upsert({
      where: { date: menuDate },
      update: { dayOfWeek, ...normalizedMeals, isVeg: Boolean(isVeg) },
      create: { date: menuDate, dayOfWeek, ...normalizedMeals, isVeg: Boolean(isVeg) },
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
    const { error, menuDate, normalizedMeals } = validateMenuPayload({ date, dayOfWeek, breakfast, lunch, snacks, dinner });
    if (error) return res.status(400).json({ error });

    const menu = await prisma.foodMenu.update({
      where: { id: req.params.id },
      data: { date: menuDate, dayOfWeek, ...normalizedMeals, isVeg: Boolean(isVeg) },
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
