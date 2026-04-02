import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Скрипт инициализации базовых ролей и первого ADMIN
const prisma = new PrismaClient();

async function main() {
  const roles = ['ADMIN', 'EDITOR', 'USER'] as const;

  for (const roleName of roles) {
    const existing = await prisma.role.findUnique({
      where: { name: roleName }
    });
    if (!existing) {
      await prisma.role.create({
        data: {
          name: roleName,
          description: `${roleName} role`
        }
      });
    }
  }

  const adminEmail = 'admin@example.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hash = await bcrypt.hash('Admin123!', 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hash,
        role: 'ADMIN'
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

