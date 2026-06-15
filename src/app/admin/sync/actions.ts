"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ApiDocente = {
  id: string;
  nome: string;
  email?: string;
  fone?: string;
  sala?: string;
  funcao?: string;
  setor?: string;
};

type ApiFuncionario = {
  id: string;
  nome: string;
  email?: string;
  fone?: string;
  sala?: string;
  funcao?: string;
  designacao?: string;
  setor?: string;
  exibir?: boolean;
};

type SyncResult = {
  groupsCreated: number;
  docentesImported: number;
  docentesUpdated: number;
  funcionariosImported: number;
  funcionariosUpdated: number;
  removed: number;
  errors: string[];
};

async function getApiCredentials() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["api_url", "api_user", "api_password"] } },
  });
  const map = new Map(settings.map((s) => [s.key, s.value]));
  return {
    url: map.get("api_url") || process.env.API_URL || "",
    user: map.get("api_user") || process.env.API_USER || "",
    password: map.get("api_password") || process.env.API_PASSWORD || "",
  };
}

async function fetchApi<T>(url: string, credentials: { user: string; password: string }): Promise<T[]> {
  const authHeader =
    credentials.user
      ? "Basic " + Buffer.from(`${credentials.user}:${credentials.password}`).toString("base64")
      : undefined;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  });

  const body = await res.text();

  console.log("Status:", res.status);
  console.log("StatusText:", res.statusText);
  console.log("Resposta:", body);

  if (!res.ok) {
    throw new Error(
      `API error: ${res.status} ${res.statusText}\n${body}`
    );
  }

  return JSON.parse(body) as T[];
}

async function findOrCreateGroup(name: string, parentId: number | null, sortOrder: number) {
  const existing = await prisma.group.findFirst({
    where: { name, parentId, deletedAt: null },
  });
  if (existing) return existing;
  return prisma.group.create({
    data: { name, parentId, sortOrder },
  });
}

async function upsertPerson(data: {
  externalId: string;
  name: string;
  email?: string;
  phone?: string;
  room?: string;
  role?: string;
  designation?: string;
  groupId?: number;
  isHidden: boolean;
}) {
  const existing = await prisma.person.findUnique({
    where: { externalId: data.externalId },
  });

  if (existing) {
    if (existing.deletedAt) return null;
    return prisma.person.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        room: data.room,
        role: data.role,
        designation: data.designation,
        groupId: data.groupId,
        isHidden: data.isHidden,
      },
    });
  }

  return prisma.person.create({
    data: {
      externalId: data.externalId,
      origin: "API",
      name: data.name,
      email: data.email,
      phone: data.phone,
      room: data.room,
      role: data.role,
      designation: data.designation,
      groupId: data.groupId,
      isHidden: data.isHidden,
    },
  });
}

export async function runSync() {
  const result: SyncResult = {
    groupsCreated: 0,
    docentesImported: 0,
    docentesUpdated: 0,
    funcionariosImported: 0,
    funcionariosUpdated: 0,
    removed: 0,
    errors: [],
  };

  try {
    const creds = await getApiCredentials();
    if (!creds.url) {
      throw new Error("URL da API não configurada.");
    }

    // Fetch docentes
    let docentes: ApiDocente[] = [];
    try {
      docentes = await fetchApi<ApiDocente>(`${creds.url}/docentes`, {
        user: creds.user,
        password: creds.password,
      });
    } catch (e) {
      result.errors.push(`Erro ao buscar docentes: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Fetch funcionários
    let funcionarios: ApiFuncionario[] = [];
    try {
      funcionarios = await fetchApi<ApiFuncionario>(`${creds.url}/funcionarios`, {
        user: creds.user,
        password: creds.password,
      });
    } catch (e) {
      result.errors.push(`Erro ao buscar funcionários: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Process docentes (grouped by "setor" as top-level groups)
    const docenteGroupMap = new Map<string, number>();
    let groupOrder = 0;

    for (const d of docentes) {
      const groupName = d.setor?.trim();
      if (!groupName) continue;

      if (!docenteGroupMap.has(groupName)) {
        const group = await findOrCreateGroup(groupName, null, groupOrder++);
        docenteGroupMap.set(groupName, group.id);
        if (group.createdAt.getTime() === group.updatedAt.getTime()) {
          result.groupsCreated++;
        }
      }

      const groupId = docenteGroupMap.get(groupName)!;
      const person = await upsertPerson({
        externalId: d.id,
        name: d.nome,
        email: d.email,
        phone: d.fone,
        room: d.sala,
        role: d.funcao,
        groupId,
        isHidden: false,
      });

      if (person) {
        const wasExisting = await prisma.person.findFirst({
          where: { externalId: d.id, updatedAt: { lt: new Date(Date.now() - 1000) } },
        });
        if (wasExisting) {
          result.docentesUpdated++;
        } else {
          result.docentesImported++;
        }
      }
    }

    // Process funcionários (grouped by "setor" under a parent group "Setores Administrativos")
    const parentGroup = await findOrCreateGroup("Setores Administrativos", null, groupOrder++);
    if (parentGroup.createdAt.getTime() === parentGroup.updatedAt.getTime()) {
      result.groupsCreated++;
    }

    const funcionarioGroupMap = new Map<string, number>();
    let subGroupOrder = 0;

    for (const f of funcionarios) {
      const groupName = f.setor?.trim();
      if (!groupName) continue;

      if (!funcionarioGroupMap.has(groupName)) {
        const group = await findOrCreateGroup(groupName, parentGroup.id, subGroupOrder++);
        funcionarioGroupMap.set(groupName, group.id);
        if (group.createdAt.getTime() === group.updatedAt.getTime()) {
          result.groupsCreated++;
        }
      }

      const groupId = funcionarioGroupMap.get(groupName)!;
      const person = await upsertPerson({
        externalId: f.id,
        name: f.nome,
        email: f.email,
        phone: f.fone,
        room: f.sala,
        role: f.funcao,
        designation: f.designacao,
        groupId,
        isHidden: f.exibir === false,
      });

      if (person) {
        const wasExisting = await prisma.person.findFirst({
          where: { externalId: f.id, updatedAt: { lt: new Date(Date.now() - 1000) } },
        });
        if (wasExisting) {
          result.funcionariosUpdated++;
        } else {
          result.funcionariosImported++;
        }
      }
    }

    // Mark people no longer in API as "not found" (soft-delete)
    const allExternalIds = [
      ...docentes.map((d) => d.id),
      ...funcionarios.map((f) => f.id),
    ];

    const apiPeople = await prisma.person.findMany({
      where: { origin: "API", deletedAt: null },
      select: { id: true, externalId: true },
    });

    for (const person of apiPeople) {
      if (person.externalId && !allExternalIds.includes(person.externalId)) {
        await prisma.person.update({
          where: { id: person.id },
          data: { deletedAt: new Date() },
        });
        result.removed++;
      }
    }

    // Log the sync
    await prisma.syncLog.create({
      data: {
        status: result.errors.length > 0 ? "PARTIAL" : "SUCCESS",
        message: result.errors.length > 0 ? result.errors.join("; ") : "Sincronização concluída",
        imported: result.docentesImported + result.funcionariosImported,
        updated: result.docentesUpdated + result.funcionariosUpdated,
        removed: result.removed,
      },
    });

    revalidatePath("/admin/sync");
    revalidatePath("/admin");
    return result;
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    await prisma.syncLog.create({
      data: {
        status: "ERROR",
        message: errorMsg,
      },
    });
    throw e;
  }
}

export type { SyncResult };

export async function getSyncLogs() {
  return prisma.syncLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
