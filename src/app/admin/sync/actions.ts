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
  departmentsCreated: number;
  sectorsCreated: number;
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
    url: map.get("api_url") ?? "",
    user: map.get("api_user") ?? "",
    password: map.get("api_password") ?? "",
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

  return res.json();
}

async function findOrCreateDepartment(name: string, sortOrder: number) {
  const existing = await prisma.department.findFirst({
    where: { name, deletedAt: null },
  });
  if (existing) return existing;
  return prisma.department.create({
    data: { name, sortOrder },
  });
}

async function findOrCreateSector(name: string, departmentId: number, sortOrder: number) {
  const existing = await prisma.sector.findFirst({
    where: { name, departmentId, deletedAt: null },
  });
  if (existing) return existing;
  return prisma.sector.create({
    data: { name, departmentId, sortOrder },
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
  departmentId?: number;
  sectorId?: number;
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
        departmentId: data.departmentId,
        sectorId: data.sectorId,
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
      departmentId: data.departmentId,
      sectorId: data.sectorId,
      isHidden: data.isHidden,
    },
  });
}

export async function runSync() {
  const result: SyncResult = {
    departmentsCreated: 0,
    sectorsCreated: 0,
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

    // Process docentes (grouped by department via "setor" field)
    const departmentMap = new Map<string, number>();
    let deptOrder = 0;

    for (const d of docentes) {
      const deptName = d.setor?.trim();
      if (!deptName) continue;

      if (!departmentMap.has(deptName)) {
        const dept = await findOrCreateDepartment(deptName, deptOrder++);
        departmentMap.set(deptName, dept.id);
        if (dept.createdAt.getTime() === dept.updatedAt.getTime()) {
          result.departmentsCreated++;
        }
      }

      const departmentId = departmentMap.get(deptName)!;
      const person = await upsertPerson({
        externalId: d.id,
        name: d.nome,
        email: d.email,
        phone: d.fone,
        room: d.sala,
        role: d.funcao,
        departmentId,
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

    // Process funcionários (grouped by sector via "setor" field)
    // Create a default department for sectors if needed
    const defaultDept = await findOrCreateDepartment("Setores Administrativos", deptOrder++);

    const sectorMap = new Map<string, number>();
    let sectorOrder = 0;

    for (const f of funcionarios) {
      const sectorName = f.setor?.trim();
      if (!sectorName) continue;

      if (!sectorMap.has(sectorName)) {
        const sector = await findOrCreateSector(sectorName, defaultDept.id, sectorOrder++);
        sectorMap.set(sectorName, sector.id);
        if (sector.createdAt.getTime() === sector.updatedAt.getTime()) {
          result.sectorsCreated++;
        }
      }

      const sectorId = sectorMap.get(sectorName)!;
      const person = await upsertPerson({
        externalId: f.id,
        name: f.nome,
        email: f.email,
        phone: f.fone,
        room: f.sala,
        role: f.funcao,
        designation: f.designacao,
        sectorId,
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

    // Mark docentes/funcionários no longer in API as "not found"
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
