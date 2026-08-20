import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";
import { AutoRefresh } from "@/app/components/auto-refresh";
import { CerrarSesionButton } from "./cerrar-sesion-button";
import { ConteoForm } from "./conteo-form";
import { LineasTabla } from "./lineas-tabla";

export default async function ConteoSesionPage({ params }: PageProps<"/conteo/[sesionId]">) {
  const { sesionId } = await params;
  const session = await auth();
  if (!session) return null;

  const sesion = await prisma.conteoSesion.findUnique({
    where: { id: sesionId },
    include: { almacen: true, creadoPor: true },
  });
  if (!sesion) notFound();

  const [productos, lineas] = await Promise.all([
    prisma.producto.findMany({
      where: { almacenId: sesion.almacenId, activo: true },
      include: { lotes: { orderBy: { codigo: "asc" } } },
      orderBy: { nombre: "asc" },
    }),
    prisma.conteoLinea.findMany({
      where: { sesionId },
      include: { producto: true, usuario: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const productosSerializables = productos.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    presentacion: p.presentacion,
    pesoKg: p.pesoKg,
    lotes: p.lotes.map((l) => ({
      id: l.id,
      codigo: l.codigo,
      fProduccion: l.fProduccion?.toISOString() ?? null,
      fVencimiento: l.fVencimiento.toISOString(),
    })),
  }));

  const lineasSerializables = lineas.map((l) => ({
    id: l.id,
    productoNombre: l.producto.nombre,
    presentacion: l.presentacion,
    pesoKg: l.pesoKg,
    unidades: l.unidades,
    total: l.total,
    loteCodigo: l.loteCodigo,
    fProduccion: l.fProduccion?.toISOString() ?? null,
    fVencimiento: l.fVencimiento.toISOString(),
    ubicacion: l.ubicacion,
    usuarioNombre: l.usuario.nombre,
    usuarioId: l.usuarioId,
    createdAt: l.createdAt.toISOString(),
  }));

  const abierta = sesion.estado === "ABIERTA";

  return (
    <div className="max-w-6xl">
      {abierta ? <AutoRefresh /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-headline-md text-on-surface">{sesion.nombre}</h1>
            <Badge variant={abierta ? "success" : "neutral"}>{abierta ? "Abierta" : "Cerrada"}</Badge>
          </div>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {sesion.almacen.nombre} · {lineas.length} líneas registradas
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/conteo/${sesion.id}/dashboard`}
            className="rounded-md border border-outline-variant px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
          >
            Ver dashboard
          </Link>
          {session.user.rol === "SUPERVISOR" && abierta ? <CerrarSesionButton sesionId={sesion.id} /> : null}
        </div>
      </div>

      {abierta ? (
        <div className="mt-6 rounded-card border border-outline-variant bg-surface-container-lowest p-4">
          <p className="text-sm font-semibold text-on-surface">Agregar producto contado</p>
          <div className="mt-4">
            <ConteoForm sesionId={sesion.id} productos={productosSerializables} />
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-card border border-outline-variant bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
          Este conteo está cerrado. Ya no se pueden agregar ni editar líneas.
        </p>
      )}

      <div className="mt-6">
        <LineasTabla
          lineas={lineasSerializables}
          currentUserId={session.user.id}
          currentUserRol={session.user.rol}
          editable={abierta}
        />
      </div>
    </div>
  );
}
