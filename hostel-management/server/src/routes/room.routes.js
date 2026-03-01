// src/routes/room.routes.js
const express = require('express');
const prisma = require('../prisma/client');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate);

// GET /api/rooms - list all rooms (Admin)
router.get('/', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { block, status } = req.query;
    const where = {};
    if (block) where.block = block;
    if (status) where.status = status;

    const rooms = await prisma.room.findMany({
      where,
      include: {
        allocations: {
          where: { isActive: true },
          include: { student: { select: { fullName: true, rollNumber: true } } },
        },
      },
      orderBy: [{ block: 'asc' }, { floor: 'asc' }, { roomNumber: 'asc' }],
    });
    res.json({ rooms });
  } catch (err) {
    next(err);
  }
});

// GET /api/rooms/available - available rooms (for allocation)
router.get('/available', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { status: { in: ['AVAILABLE', 'OCCUPIED'] }, occupiedCount: { lt: prisma.room.fields.capacity } },
      orderBy: { roomNumber: 'asc' },
    });
    res.json({ rooms });
  } catch (err) {
    next(err);
  }
});

// POST /api/rooms - create room (Admin)
router.post('/', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const { roomNumber, block, floor, capacity, amenities } = req.body;
    const room = await prisma.room.create({
      data: { roomNumber, block, floor: Number(floor), capacity: Number(capacity), amenities: amenities || [] },
    });
    res.status(201).json({ message: 'Room created', room });
  } catch (err) {
    next(err);
  }
});

// POST /api/rooms/allocate - assign student to room (Admin)
router.post('/allocate', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const { studentId, roomId } = req.body;

    const student = await prisma.student.findUnique({ where: { id: studentId }, include: { roomAllocation: true } });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (student.roomAllocation?.isActive) return res.status(400).json({ error: 'Student already has a room' });

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.occupiedCount >= room.capacity) return res.status(400).json({ error: 'Room is full' });

    const [allocation] = await prisma.$transaction([
      prisma.roomAllocation.create({ data: { studentId, roomId } }),
      prisma.room.update({
        where: { id: roomId },
        data: {
          occupiedCount: { increment: 1 },
          status: room.occupiedCount + 1 >= room.capacity ? 'FULL' : 'OCCUPIED',
        },
      }),
    ]);

    res.status(201).json({ message: 'Room allocated successfully', allocation });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/rooms/deallocate/:studentId
router.delete('/deallocate/:studentId', authorizeRoles('ADMIN', 'WARDEN'), async (req, res, next) => {
  try {
    const allocation = await prisma.roomAllocation.findUnique({
      where: { studentId: req.params.studentId },
      include: { room: true },
    });
    if (!allocation) return res.status(404).json({ error: 'No active allocation found' });

    await prisma.$transaction([
      prisma.roomAllocation.update({
        where: { id: allocation.id },
        data: { isActive: false, vacatedAt: new Date() },
      }),
      prisma.room.update({
        where: { id: allocation.roomId },
        data: {
          occupiedCount: { decrement: 1 },
          status: allocation.room.occupiedCount - 1 === 0 ? 'AVAILABLE' : 'OCCUPIED',
        },
      }),
    ]);

    res.json({ message: 'Room deallocated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
