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
  fProduccion: string | null;
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

  // La fecha de producción puede venir escrita a mano cuando el lote no la
  // trae cargada — es solo para esta línea, no cambia el lote del catálogo.
  let fProduccion = lote.fProduccion;
  if (input.fProduccion) {
    const fecha = new Date(input.fProduccion);
    if (Number.isNaN(fecha.getTime())) return { error: "Fecha de producción inválida." };
    fProduccion = fecha;
  }

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
      fProduccion,
      fVencimiento: lote.fVencimiento,
      ubicacion: input.ubicacion.trim(),
      usuarioId: session.user.id,
    },
  });

  revalidatePath(`/conteo/${sesionId}`);
  revalidatePath(`/conteo/${sesionId}/dashboard`);
  return { ok: true };
}

export type EditarLineaInput = {
  presentacion: string;
  pesoKg: number;
  unidades: number;
  fProduccion: string | null;
  ubicacion: string;
};

export async function actualizarLineaAction(lineaId: string, input: EditarLineaInput): Promise<ActionResult> {
  const session = await requireSession();

  if (!input.presentacion.trim()) return { error: "La presentación es obligatoria." };
  if (!(input.pesoKg > 0)) return { error: "El peso debe ser mayor a 0." };
  if (!(input.unidades > 0)) return { error: "Las unidades deben ser mayor a 0." };
  if (!input.ubicacion.trim()) return { error: "La ubicación es obligatoria." };

  let fProduccion: Date | null = null;
  if (input.fProduccion) {
    fProduccion = new Date(input.fProduccion);
    if (Number.isNaN(fProduccion.getTime())) return { error: "Fecha de producción inválida." };
  }

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
      fProduccion,
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

export type CrearProductoResult =
  | { error: string }
  | { ok: true; producto: { id: string; codigo: string; nombre: string; presentacion: string; pesoKg: number | null } };

/** Para productos que no vinieron en el Excel de carga previa (no hay
 * stock previo con el que compararlos — el dashboard los mostrará como
 * "excedido" apenas se cuente algo, ya que no tenían nada cargado). */
export async function crearProductoAction(
  sesionId: string,
  codigo: string,
  nombre: string,
  presentacion: string,
  pesoKg: number | null
): Promise<CrearProductoResult> {
  const session = await requireSession();
  if (session.user.rol !== "SUPERVISOR") return { error: "Solo el supervisor puede agregar productos nuevos." };

  const codigoLimpio = codigo.trim();
  const nombreLimpio = nombre.trim();
  if (!codigoLimpio) return { error: "El código es obligatorio." };
  if (!nombreLimpio) return { error: "El nombre es obligatorio." };

  const sesion = await prisma.conteoSesion.findUniqueOrThrow({ where: { id: sesionId } });
  if (sesion.estado === "CERRADA") return { error: "Este conteo ya está cerrado." };

  const existente = await prisma.producto.findUnique({ where: { codigo: codigoLimpio } });
  if (existente) return { error: `Ya existe un producto con el código "${codigoLimpio}".` };

  const producto = await prisma.producto.create({
    data: {
      codigo: codigoLimpio,
      nombre: nombreLimpio,
      presentacion: presentacion.trim() || "—",
      pesoKg,
      almacenId: sesion.almacenId,
    },
  });

  return {
    ok: true,
    producto: { id: producto.id, codigo: producto.codigo, nombre: producto.nombre, presentacion: producto.presentacion, pesoKg: producto.pesoKg },
  };
}
