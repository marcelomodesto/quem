"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const KEYS = {
  URL: "api_url",
  USER: "api_user",
  PASSWORD: "api_password",
} as const;

export type ApiConfigData = {
  url: string;
  user: string;
  hasPassword: boolean;
};

export async function getApiConfig(): Promise<ApiConfigData> {
  const settings = await prisma.setting.findMany({
    where: { key: { in: Object.values(KEYS) } },
  });

  const map = new Map(settings.map((s) => [s.key, s.value]));

  return {
    url: map.get(KEYS.URL) || process.env.API_URL || "",
    user: map.get(KEYS.USER) || process.env.API_USER || "",
    hasPassword: !!map.get(KEYS.PASSWORD) || !!process.env.API_PASSWORD,
  };
}

async function upsertSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function saveApiConfig(formData: FormData) {
  const url = (formData.get("url") as string)?.trim() ?? "";
  const user = (formData.get("user") as string)?.trim() ?? "";
  const password = formData.get("password") as string;

  if (!url) {
    return { error: "A URL da API é obrigatória." };
  }

  await upsertSetting(KEYS.URL, url);
  await upsertSetting(KEYS.USER, user);

  if (password) {
    await upsertSetting(KEYS.PASSWORD, password);
  }

  revalidatePath("/admin/api-config");
  revalidatePath("/admin");
  return { success: true };
}
