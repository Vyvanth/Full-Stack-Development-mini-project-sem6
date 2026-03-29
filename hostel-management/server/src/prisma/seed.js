const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

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
  console.log('Admin user created:', adminUser.email);

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
  console.log('Rooms seeded');

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
  console.log('Demo student created: student@hostel.com');

  console.log('\nDatabase seeded successfully!');
  console.log('  Admin: admin@hostel.com / admin123');
  console.log('  Student: student@hostel.com / student123');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
