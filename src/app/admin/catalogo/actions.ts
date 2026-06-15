"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Group Actions ───

export async function getGroups() {
  return prisma.group.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: {
      children: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        include: {
          people: {
            where: { deletedAt: null },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      people: {
        where: { deletedAt: null, group: { parentId: null } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getGroupById(id: number) {
  return prisma.group.findUnique({
    where: { id, deletedAt: null },
    include: {
      parent: true,
      children: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getRootGroups() {
  return prisma.group.findMany({
    where: { parentId: null, deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: {
      children: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function createGroup(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const parentIdRaw = formData.get("parentId") as string | null;
  const parentId = parentIdRaw ? parseInt(parentIdRaw, 10) : null;

  if (!name) {
    return { error: "Nome do grupo é obrigatório." };
  }

  const maxOrder = await prisma.group.aggregate({
    where: { parentId, deletedAt: null },
    _max: { sortOrder: true },
  });

  await prisma.group.create({
    data: {
      name,
      parentId,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/admin/catalogo");
  return { success: true };
}

export async function updateGroup(id: number, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "Nome do grupo é obrigatório." };
  }

  await prisma.group.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/admin/catalogo");
  return { success: true };
}

export async function deleteGroup(id: number) {
  await prisma.group.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/admin/catalogo");
  return { success: true };
}

export async function toggleGroupHidden(id: number) {
  const group = await prisma.group.findUnique({ where: { id } });
  if (!group) return { error: "Grupo não encontrado." };

  await prisma.group.update({
    where: { id },
    data: { isHidden: !group.isHidden },
  });

  revalidatePath("/admin/catalogo");
  return { success: true };
}

export async function reorderGroups(orderedIds: number[]) {
  const updates = orderedIds.map((id, index) =>
    prisma.group.update({
      where: { id },
      data: { sortOrder: index },
    })
  );
  await prisma.$transaction(updates);
  revalidatePath("/admin/catalogo");
}

export async function moveGroup(id: number, newParentId: number | null) {
  await prisma.group.update({
    where: { id },
    data: { parentId: newParentId },
  });

  revalidatePath("/admin/catalogo");
  return { success: true };
}

// ─── Person Actions ───

export async function getPeopleInGroup(groupId: number) {
  return prisma.person.findMany({
    where: { groupId, deletedAt: null },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getUngroupedPeople() {
  return prisma.person.findMany({
    where: { groupId: null, deletedAt: null },
    orderBy: { name: "asc" },
  });
}

export async function getAllPeople() {
  return prisma.person.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: {
      group: {
        select: { id: true, name: true },
      },
    },
  });
}

export async function movePersonToGroup(personId: number, groupId: number | null) {
  const maxOrder = groupId
    ? await prisma.person.aggregate({
        where: { groupId, deletedAt: null },
        _max: { sortOrder: true },
      })
    : null;

  await prisma.person.update({
    where: { id: personId },
    data: {
      groupId,
      sortOrder: (maxOrder?._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/admin/catalogo");
  return { success: true };
}

export async function moveMultiplePeopleToGroup(personIds: number[], groupId: number | null) {
  const maxOrder = groupId
    ? await prisma.person.aggregate({
        where: { groupId, deletedAt: null },
        _max: { sortOrder: true },
      })
    : null;

  let nextOrder = (maxOrder?._max.sortOrder ?? -1) + 1;

  const updates = personIds.map((id) =>
    prisma.person.update({
      where: { id },
      data: { groupId, sortOrder: nextOrder++ },
    })
  );

  await prisma.$transaction(updates);
  revalidatePath("/admin/catalogo");
  return { success: true };
}

export async function reorderPeople(orderedIds: number[]) {
  const updates = orderedIds.map((id, index) =>
    prisma.person.update({
      where: { id },
      data: { sortOrder: index },
    })
  );
  await prisma.$transaction(updates);
  revalidatePath("/admin/catalogo");
}

export async function togglePersonHidden(id: number) {
  const person = await prisma.person.findUnique({ where: { id } });
  if (!person) return { error: "Pessoa não encontrada." };

  await prisma.person.update({
    where: { id },
    data: { isHidden: !person.isHidden },
  });

  revalidatePath("/admin/catalogo");
  return { success: true };
}

export async function createPerson(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const room = (formData.get("room") as string)?.trim() || null;
  const role = (formData.get("role") as string)?.trim() || null;
  const designation = (formData.get("designation") as string)?.trim() || null;
  const groupIdRaw = formData.get("groupId") as string | null;
  const groupId = groupIdRaw ? parseInt(groupIdRaw, 10) : null;

  if (!name) {
    return { error: "Nome é obrigatório." };
  }

  const maxOrder = groupId
    ? await prisma.person.aggregate({
        where: { groupId, deletedAt: null },
        _max: { sortOrder: true },
      })
    : null;

  await prisma.person.create({
    data: {
      name,
      email,
      phone,
      room,
      role,
      designation,
      groupId,
      origin: "MANUAL",
      sortOrder: (maxOrder?._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/admin/catalogo");
  return { success: true };
}

export async function updatePerson(id: number, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const room = (formData.get("room") as string)?.trim() || null;
  const role = (formData.get("role") as string)?.trim() || null;
  const designation = (formData.get("designation") as string)?.trim() || null;

  if (!name) {
    return { error: "Nome é obrigatório." };
  }

  await prisma.person.update({
    where: { id },
    data: { name, email, phone, room, role, designation },
  });

  revalidatePath("/admin/catalogo");
  return { success: true };
}

export async function deletePerson(id: number) {
  await prisma.person.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/admin/catalogo");
  return { success: true };
}
