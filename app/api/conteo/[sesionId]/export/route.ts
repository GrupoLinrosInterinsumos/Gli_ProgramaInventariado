import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { xlsxResponse } from "@/lib/xlsx";

function fmtFecha(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("es-PE", { timeZone: "UTC" });
}

export async function GET(_request: Request, { params }: RouteContext<"/api/conteo/[sesionId]/export">) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (session.user.rol !== "SUPERVISOR") return NextResponse.json({ error: "Solo un supervisor puede descargar respaldos." }, { status: 403 });

  const { sesionId } = await params;

  const sesion = await prisma.conteoSesion.findUnique({ where: { id: sesionId } });
  if (!sesion) return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });

  const lineas = await prisma.conteoLinea.findMany({
    where: { sesionId },
    include: { producto: true, usuario: true },
    orderBy: { createdAt: "asc" },
  });

  const headers = [
    "Producto",
    "Código",
    "Presentación",
    "Peso (kg)",
    "Unidades",
    "Total",
    "Lote",
    "F. Producción",
    "F. Vencimiento",
    "Ubicación",
    "Usuario",
    "Fecha",
  ];

  const rows = lineas.map((l) => [
    l.producto.nombre,
    l.producto.codigo,
    l.presentacion,
    l.pesoKg,
    l.unidades,
    l.total,
    l.loteCodigo,
    fmtFecha(l.fProduccion),
    fmtFecha(l.fVencimiento),
    l.ubicacion,
    l.usuario.nombre,
    l.createdAt.toLocaleString("es-PE", { timeZone: "America/Lima" }),
  ]);

  await prisma.respaldoLog.create({
    data: { sesionId, tipo: "EXCEL", usuarioId: session.user.id },
  });

  return xlsxResponse(`Conteo - ${sesion.nombre}.xlsx`, "Conteo", headers, rows);
}
