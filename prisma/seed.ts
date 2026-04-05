import { PrismaClient, RecordType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  'Salary', 'Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 
  'Health', 'Utilities', 'Investment', 'Gift', 'Travel', 'Education'
];

async function main() {
  // Clear existing data
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@finance.com',
      password: hashedPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@finance.com',
      password: hashedPassword,
      fullName: 'Analyst User',
      role: 'ANALYST',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@finance.com',
      password: hashedPassword,
      fullName: 'Viewer User',
      role: 'VIEWER',
    },
  });

  const users = [admin, analyst, viewer];

  // Create Records
  for (const user of users) {
    const recordData = [];
    for (let i = 0; i < 50; i++) {
      const type = Math.random() > 0.3 ? 'EXPENSE' : 'INCOME';
      const amount = type === 'INCOME' 
        ? Math.floor(Math.random() * 5000) + 1000 
        : Math.floor(Math.random() * 1000) + 10;
        
      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 12));
      date.setDate(Math.floor(Math.random() * 28) + 1);

      recordData.push({
        userId: user.id,
        amount,
        type: type as RecordType,
        category: categories[Math.floor(Math.random() * categories.length)],
        date,
        description: `Sample ${type.toLowerCase()} record #${i + 1}`,
      });
    }

    await prisma.financialRecord.createMany({
      data: recordData,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
