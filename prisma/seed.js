const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const contactPassword = await bcrypt.hash('123456789', 10);

  const mainAdmin = await prisma.user.upsert({
    where: { email: 'admin@rifagestor.com' },
    update: {},
    create: {
      email: 'admin@rifagestor.com',
      name: 'Admin Principal',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const contactAdmin = await prisma.user.upsert({
    where: { email: 'contato@danilobrandao.com.br' },
    update: {},
    create: {
      email: 'contato@danilobrandao.com.br',
      name: 'Admin Contato',
      password: contactPassword,
      role: 'admin',
    },
  });

  console.log({ mainAdmin, contactAdmin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
