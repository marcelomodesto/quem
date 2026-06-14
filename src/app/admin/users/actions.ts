"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type UserWithoutPassword = {
  id: number;
  email: string;
  name: string;
  role: "GESTOR" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
};

export async function getUsers(): Promise<UserWithoutPassword[]> {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return users;
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
}

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "GESTOR" | "ADMIN";

  if (!name || !email || !password) {
    throw new Error("Nome, e-mail e senha são obrigatórios.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Já existe um usuário com este e-mail.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || "GESTOR",
    },
  });

  redirect("/admin/users");
}

export async function updateUser(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "GESTOR" | "ADMIN";

  if (!name || !email) {
    throw new Error("Nome e e-mail são obrigatórios.");
  }

  const existing = await prisma.user.findFirst({
    where: { email, id: { not: id }, deletedAt: null },
  });
  if (existing) {
    throw new Error("Já existe outro usuário com este e-mail.");
  }

  const data: Record<string, unknown> = { name, email, role };
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({ where: { id }, data });

  redirect("/admin/users");
}

export async function deleteUser(id: number) {
  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
