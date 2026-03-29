// src/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hostel.com' },
    update: {},
    create: {
      email: 'admin@hostel.com',
      password: hashedPassword,
      role: 'ADMIN',
      admin: {
        create: {
          fullName: 'Super Admin',
          phone: '9999999999',
        },
      },
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // Create sample rooms
  const blocks = ['A', 'B'];
  for (const block of blocks) {
    for (let floor = 1; floor <= 3; floor++) {
      for (let room = 1; room <= 5; room++) {
        const roomNumber = `${block}${floor}0${room}`;
        await prisma.room.upsert({
          where: { roomNumber },
          update: {},
          create: {
            roomNumber,
            block,
            floor,
            capacity: 3,
            amenities: ['WiFi', 'AC', 'Attached Bathroom'],
          },
        });
      }
    }
  }
  console.log('✅ Rooms seeded');

  // Create sample student
  const studentPassword = await bcrypt.hash('student123', 10);
  await prisma.user.upsert({
    where: { email: 'student@hostel.com' },
    update: {},
    create: {
      email: 'student@hostel.com',
      password: studentPassword,
      role: 'STUDENT',
      student: {
        create: {
          fullName: 'Demo Student',
          gender: 'MALE',
          phone: '8888888888',
          course: 'B.Tech',
          branch: 'AI & Data Science',
          rollNumber: 'BL.EN.U4AID23001',
          guardianName: 'Parent Name',
          guardianPhone: '7777777777',
        },
      },
    },
  });
  console.log('✅ Demo student created: student@hostel.com');

  // Seed food menu for next 7 days
  const today = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);

    await prisma.foodMenu.upsert({
      where: { date },
      update: {},
      create: {
        date,
        dayOfWeek: days[date.getDay()],
        breakfast: ['Idli', 'Sambar', 'Chutney', 'Tea/Coffee'],
        lunch: ['Rice', 'Dal', 'Sabzi', 'Curd', 'Papad'],
        snacks: ['Bread Butter', 'Tea'],
        dinner: ['Chapati', 'Paneer Curry', 'Rice', 'Dal'],
        isVeg: true,
      },
    });
  }
  console.log('✅ Food menu seeded for 7 days');

  console.log('\n🎉 Database seeded successfully!');
  console.log('   Admin: admin@hostel.com / admin123');
  console.log('   Student: student@hostel.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
