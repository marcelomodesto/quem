"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-mail e senha são obrigatórios." };
  }

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });

  if (!user) {
    return { error: "E-mail ou senha inválidos." };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: "E-mail ou senha inválidos." };
  }

  const cookieStore = await cookies();
  cookieStore.set("session", String(user.id), {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true };
}
