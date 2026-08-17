"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { aplicarCargaPrevia, parseCargaPreviaWorkbook } from "@/lib/carga-previa";

export type CrearSesionState = { error?: string; errores?: string[] } | undefined;

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("No autorizado.");
  return session;
}

async function requireSupervisor() {
  const session = await requireSession();
  if (session.user.rol !== "SUPERVISOR") throw new Error("Solo un supervisor puede hacer esto.");
  return session;
}

export async function crearSesionAction(
  _prevState: CrearSesionState,
  formData: FormData
): Promise<CrearSesionState> {
  const session = await requireSupervisor();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const almacenId = String(formData.get("almacenId") ?? "").trim();
  const archivo = formData.get("archivo");

  if (!nombre || !almacenId) {
    return { error: "Nombre y almacén son obligatorios." };
  }
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Sube el Excel de carga previa." };
  }

  const sesionAbierta = await prisma.conteoSesion.findFirst({
    where: { almacenId, estado: "ABIERTA" },
  });
  if (sesionAbierta) {
    return { error: "Ya hay un conteo abierto para este almacén. Ciérralo antes de iniciar otro." };
  }

  const buffer = await archivo.arrayBuffer();
  const { filas, errores } = await parseCargaPreviaWorkbook(buffer);
  if (filas.length === 0) {
    return { error: "No se pudo leer el archivo.", errores };
  }

  let sesionId = "";

  await prisma.$transaction(async (tx) => {
    const sesion = await tx.conteoSesion.create({
      data: { nombre, almacenId, creadoPorId: session.user.id },
    });
    sesionId = sesion.id;
    await aplicarCargaPrevia(tx, sesionId, almacenId, filas);
  });

  revalidatePath("/conteo");
  redirect(`/conteo/${sesionId}`);
}

export async function cerrarSesionAction(sesionId: string) {
  await requireSupervisor();
  await prisma.conteoSesion.update({
    where: { id: sesionId },
    data: { estado: "CERRADA", cerradoAt: new Date() },
  });
  revalidatePath("/conteo");
  revalidatePath(`/conteo/${sesionId}`);
}
