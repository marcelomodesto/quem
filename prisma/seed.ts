import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@local";
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    const hashedPassword = await bcrypt.hash("123456", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrador",
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Usuário admin criado:", adminEmail);
  } else {
    console.log("Usuário admin já existe");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
