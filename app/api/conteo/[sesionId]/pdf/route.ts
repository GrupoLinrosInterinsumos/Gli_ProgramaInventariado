import { createElement } from "react";
import type { ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { contentDisposition } from "@/lib/content-disposition";
import { getResumenGeneral } from "@/lib/conteo-resumen";
import { ConteoPdfDocument } from "./document";

export async function GET(_request: Request, { params }: RouteContext<"/api/conteo/[sesionId]/pdf">) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (session.user.rol !== "SUPERVISOR") return NextResponse.json({ error: "Solo un supervisor puede descargar respaldos." }, { status: 403 });

  const { sesionId } = await params;

  const sesion = await prisma.conteoSesion.findUnique({ where: { id: sesionId } });
  if (!sesion) return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });

  const filas = await getResumenGeneral(sesionId);

  const buffer = await renderToBuffer(
    createElement(ConteoPdfDocument, {
      sesionNombre: sesion.nombre,
      fecha: new Date().toLocaleDateString("es-PE", { timeZone: "America/Lima" }),
      filas,
    }) as ReactElement<DocumentProps>
  );

  await prisma.respaldoLog.create({
    data: { sesionId, tipo: "PDF", usuarioId: session.user.id },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition("inline", `Conteo - ${sesion.nombre}.pdf`),
    },
  });
}
