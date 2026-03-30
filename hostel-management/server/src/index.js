// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./prisma/client');

const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const roomRoutes = require('./routes/room.routes');
const complaintRoutes = require('./routes/complaint.routes');
const paymentRoutes = require('./routes/payment.routes');
const foodRoutes = require('./routes/food.routes');
const laundryRoutes = require('./routes/laundry.routes');
const passRoutes = require('./routes/pass.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/laundry', laundryRoutes);
app.use('/api/passes', passRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Error:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (e) {
    console.error('Database connection failed:', e.message);
  }
});

module.exports = app;
