import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminName = process.env.ADMIN_NAME ?? "Administrador";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log("Variáveis ADMIN_EMAIL e ADMIN_PASSWORD não definidas. Seed de admin ignorado.");
    return;
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN", deletedAt: null },
  });

  if (existingAdmin) {
    console.log("Já existe um administrador cadastrado. Seed ignorado.");
    return;
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingEmail) {
    console.log("Usuário com email", adminEmail, "já existe. Seed ignorado.");
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await prisma.user.create({
    data: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Usuário admin criado:", adminEmail);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
