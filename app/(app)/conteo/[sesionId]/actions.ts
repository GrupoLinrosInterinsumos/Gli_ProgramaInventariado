"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type LineaInput = {
  productoId: string;
  presentacion: string;
  pesoKg: number;
  unidades: number;
  loteId: string;
  ubicacion: string;
};

export type ActionResult = { error: string } | { ok: true };

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("No autorizado.");
  return session;
}

function validarInput(input: LineaInput): string | null {
  if (!input.productoId) return "Elige un producto.";
  if (!input.presentacion.trim()) return "La presentación es obligatoria.";
  if (!(input.pesoKg > 0)) return "El peso debe ser mayor a 0.";
  if (!(input.unidades > 0)) return "Las unidades deben ser mayor a 0.";
  if (!input.loteId) return "Elige un lote.";
  if (!input.ubicacion.trim()) return "La ubicación es obligatoria.";
  return null;
}

export async function agregarLineaAction(sesionId: string, input: LineaInput): Promise<ActionResult> {
  const session = await requireSession();

  const error = validarInput(input);
  if (error) return { error };

  const [sesion, lote] = await Promise.all([
    prisma.conteoSesion.findUniqueOrThrow({ where: { id: sesionId } }),
    prisma.lote.findUniqueOrThrow({ where: { id: input.loteId } }),
  ]);

  if (sesion.estado === "CERRADA") return { error: "Este conteo ya está cerrado." };
  if (lote.productoId !== input.productoId) return { error: "El lote no corresponde a este producto." };

  await prisma.conteoLinea.create({
    data: {
      sesionId,
      productoId: input.productoId,
      presentacion: input.presentacion.trim(),
      pesoKg: input.pesoKg,
      unidades: input.unidades,
      total: input.pesoKg * input.unidades,
      loteId: lote.id,
      loteCodigo: lote.codigo,
      fProduccion: lote.fProduccion,
      fVencimiento: lote.fVencimiento,
      ubicacion: input.ubicacion.trim(),
      usuarioId: session.user.id,
    },
  });

  revalidatePath(`/conteo/${sesionId}`);
  revalidatePath(`/conteo/${sesionId}/dashboard`);
  return { ok: true };
}

export type EditarLineaInput = { presentacion: string; pesoKg: number; unidades: number; ubicacion: string };

export async function actualizarLineaAction(lineaId: string, input: EditarLineaInput): Promise<ActionResult> {
  const session = await requireSession();

  if (!input.presentacion.trim()) return { error: "La presentación es obligatoria." };
  if (!(input.pesoKg > 0)) return { error: "El peso debe ser mayor a 0." };
  if (!(input.unidades > 0)) return { error: "Las unidades deben ser mayor a 0." };
  if (!input.ubicacion.trim()) return { error: "La ubicación es obligatoria." };

  const linea = await prisma.conteoLinea.findUniqueOrThrow({
    where: { id: lineaId },
    include: { sesion: true },
  });

  if (linea.sesion.estado === "CERRADA") return { error: "Este conteo ya está cerrado." };
  if (session.user.rol !== "SUPERVISOR" && linea.usuarioId !== session.user.id) {
    return { error: "Solo puedes editar tus propias líneas." };
  }

  await prisma.conteoLinea.update({
    where: { id: lineaId },
    data: {
      presentacion: input.presentacion.trim(),
      pesoKg: input.pesoKg,
      unidades: input.unidades,
      total: input.pesoKg * input.unidades,
      ubicacion: input.ubicacion.trim(),
    },
  });

  revalidatePath(`/conteo/${linea.sesionId}`);
  revalidatePath(`/conteo/${linea.sesionId}/dashboard`);
  return { ok: true };
}

export async function eliminarLineaAction(lineaId: string): Promise<ActionResult> {
  const session = await requireSession();

  const linea = await prisma.conteoLinea.findUniqueOrThrow({
    where: { id: lineaId },
    include: { sesion: true },
  });

  if (linea.sesion.estado === "CERRADA") return { error: "Este conteo ya está cerrado." };
  if (session.user.rol !== "SUPERVISOR" && linea.usuarioId !== session.user.id) {
    return { error: "Solo puedes eliminar tus propias líneas." };
  }

  await prisma.conteoLinea.delete({ where: { id: lineaId } });

  revalidatePath(`/conteo/${linea.sesionId}`);
  revalidatePath(`/conteo/${linea.sesionId}/dashboard`);
  return { ok: true };
}

export type CrearLoteResult = {
  error: string;
} | {
  ok: true;
  lote: { id: string; codigo: string; fProduccion: string | null; fVencimiento: string };
};

export async function crearLoteAction(
  productoId: string,
  codigo: string,
  fProduccion: string,
  fVencimiento: string
): Promise<CrearLoteResult> {
  await requireSession();

  const codigoLimpio = codigo.trim();
  if (!codigoLimpio) return { error: "El código de lote es obligatorio." };
  if (!fVencimiento) return { error: "La fecha de vencimiento es obligatoria." };

  const fVenc = new Date(fVencimiento);
  if (Number.isNaN(fVenc.getTime())) return { error: "Fecha de vencimiento inválida." };

  let fProd: Date | null = null;
  if (fProduccion) {
    fProd = new Date(fProduccion);
    if (Number.isNaN(fProd.getTime())) return { error: "Fecha de producción inválida." };
    if (fVenc < fProd) return { error: "La fecha de vencimiento no puede ser anterior a la de producción." };
  }

  const lote = await prisma.lote.upsert({
    where: { productoId_codigo: { productoId, codigo: codigoLimpio } },
    update: { fProduccion: fProd, fVencimiento: fVenc },
    create: { productoId, codigo: codigoLimpio, fProduccion: fProd, fVencimiento: fVenc },
  });

  return {
    ok: true,
    lote: { id: lote.id, codigo: lote.codigo, fProduccion: lote.fProduccion?.toISOString() ?? null, fVencimiento: lote.fVencimiento.toISOString() },
  };
}
