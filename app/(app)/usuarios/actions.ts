"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { esCorreoCorporativo, ALLOWED_EMAIL_DOMAIN } from "@/lib/auth-domain";

export type UsuarioFormState = { error?: string } | undefined;

async function requireSupervisor() {
  const session = await auth();
  if (!session || session.user.rol !== "SUPERVISOR") {
    throw new Error("No autorizado.");
  }
  return session;
}

function readRol(formData: FormData): "OPERADOR" | "SUPERVISOR" | null {
  const rol = formData.get("rol");
  return rol === "OPERADOR" || rol === "SUPERVISOR" ? rol : null;
}

export async function createUsuarioAction(
  _prevState: UsuarioFormState,
  formData: FormData
): Promise<UsuarioFormState> {
  await requireSupervisor();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rol = readRol(formData);

  if (!nombre || !email || !password || !rol) {
    return { error: "Todos los campos son obligatorios." };
  }
  if (!esCorreoCorporativo(email)) {
    return { error: `El correo debe ser corporativo (@${ALLOWED_EMAIL_DOMAIN}).` };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.usuario.create({ data: { nombre, email, passwordHash, rol } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Ya existe un usuario con ese correo." };
    }
    throw e;
  }

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function toggleUsuarioActivoAction(id: string) {
  const session = await requireSupervisor();
  if (id === session.user.id) throw new Error("No puedes desactivar tu propio usuario.");

  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id } });
  await prisma.usuario.update({ where: { id }, data: { activo: !usuario.activo } });
  revalidatePath("/usuarios");
}
