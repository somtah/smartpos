import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  const adminPassword = await bcrypt.hash('admin1234', saltRounds);

  await prisma.user.upsert({
    where: { email: 'admin@smartpos.local' },
    update: {},
    create: {
      email: 'admin@smartpos.local',
      fullName: 'System Admin',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const products = [
    { sku: 'SKU-COFFEE-001', name: 'Coffee', price: '65.00', stock: 100 },
    { sku: 'SKU-TEA-001', name: 'Tea', price: '50.00', stock: 120 },
    { sku: 'SKU-WATER-001', name: 'Mineral Water', price: '20.00', stock: 300 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        price: product.price,
        stock: product.stock,
      },
      create: product,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
