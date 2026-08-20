import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calcularEstado, getResumenGeneral, getResumenPorLotes } from "@/lib/conteo-resumen";
import { AutoRefresh } from "@/app/components/auto-refresh";
import { Card } from "@/app/components/ui/card";
import { KpiCard } from "@/app/components/ui/kpi-card";
import { RadialProgress } from "@/app/components/ui/radial-progress";
import { IconAlertTriangle, IconClipboardCheck, IconClock, IconDownload, IconPackage } from "@/app/components/ui/icons";
import { DashboardClient } from "./dashboard-client";

const ESTADO_LABEL = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completo: "Completo",
  excedido: "¡Excedido!",
} as const;

const ESTADO_TONO = {
  pendiente: "primary",
  en_progreso: "warning",
  completo: "success",
  excedido: "danger",
} as const;

export default async function DashboardPage({ params }: PageProps<"/conteo/[sesionId]/dashboard">) {
  const session = await auth();
  if (!session) redirect("/login");
  const esSupervisor = session.user.rol === "SUPERVISOR";

  const { sesionId } = await params;

  const sesion = await prisma.conteoSesion.findUnique({ where: { id: sesionId }, include: { almacen: true } });
  if (!sesion) notFound();

  const [general, porLotes, lineas, ultimoRespaldo] = await Promise.all([
    getResumenGeneral(sesionId),
    getResumenPorLotes(sesionId),
    prisma.conteoLinea.findMany({
      where: { sesionId },
      select: {
        productoId: true,
        presentacion: true,
        pesoKg: true,
        unidades: true,
        total: true,
        loteCodigo: true,
        fProduccion: true,
        fVencimiento: true,
        ubicacion: true,
        usuario: { select: { nombre: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.respaldoLog.findFirst({
      where: { sesionId },
      orderBy: { createdAt: "desc" },
      include: { usuario: true },
    }),
  ]);

  const completos = general.filter((r) => r.estado === "completo").length;
  const excedidos = general.filter((r) => r.estado === "excedido").length;
  const pendientes = general.filter((r) => r.estado === "pendiente" || r.estado === "en_progreso").length;

  const totalStock = general.reduce((acc, r) => acc + r.stockPrevio, 0);
  const totalContado = general.reduce((acc, r) => acc + r.contado, 0);
  const pctGeneral = totalStock > 0 ? (totalContado / totalStock) * 100 : totalContado > 0 ? 100.5 : 0;
  const estadoGeneral = calcularEstado(pctGeneral);

  return (
    <div className="max-w-6xl">
      {sesion.estado === "ABIERTA" ? <AutoRefresh /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md text-on-surface">Dashboard — {sesion.nombre}</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">{sesion.almacen.nombre}</p>
        </div>
        {esSupervisor ? (
          <div className="flex gap-2">
            <a href={`/api/conteo/${sesionId}/export`}>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low">
                <IconDownload size={16} /> Excel
              </span>
            </a>
            <a href={`/api/conteo/${sesionId}/pdf`}>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low">
                <IconDownload size={16} /> PDF
              </span>
            </a>
          </div>
        ) : null}
      </div>

      <Card className="mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-label-md uppercase tracking-wide text-on-surface-variant">Progreso general del conteo</p>
          <p className="mt-1 text-2xl font-bold text-on-surface">
            {totalContado.toLocaleString("es-PE")} <span className="text-base font-medium text-on-surface-variant">/ {totalStock.toLocaleString("es-PE")}</span>
          </p>
          <p className="mt-1 text-sm font-medium text-on-surface-variant">{ESTADO_LABEL[estadoGeneral]}</p>
        </div>
        <RadialProgress pct={pctGeneral} tone={ESTADO_TONO[estadoGeneral]} size={96} />
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<IconPackage size={18} />} label="Productos con avance" value={general.length} />
        <KpiCard
          icon={<IconClipboardCheck size={18} />}
          label="Completos (100%)"
          value={completos}
          tone={completos > 0 ? "neutral" : "neutral"}
          chipLabel={`${pendientes} pendientes`}
          chipVariant="neutral"
        />
        <KpiCard
          icon={<IconAlertTriangle size={18} />}
          label="Excedidos"
          value={excedidos}
          tone={excedidos > 0 ? "critical" : "neutral"}
          chipLabel={excedidos > 0 ? "Revisar" : "Sin excedentes"}
          chipVariant={excedidos > 0 ? "danger" : "success"}
        />
        <KpiCard
          icon={<IconClock size={18} />}
          label="Último respaldo"
          value={
            ultimoRespaldo
              ? ultimoRespaldo.createdAt.toLocaleString("es-PE", { timeZone: "America/Lima", dateStyle: "short", timeStyle: "short" })
              : "Ninguno"
          }
          tone={ultimoRespaldo ? "neutral" : "critical"}
          chipLabel={ultimoRespaldo ? ultimoRespaldo.tipo : "Sin respaldar"}
          chipVariant={ultimoRespaldo ? "info" : "warning"}
          helper={ultimoRespaldo ? `Por ${ultimoRespaldo.usuario.nombre}` : "Descarga Excel o PDF para respaldar"}
        />
      </div>

      <div className="mt-6">
        <DashboardClient
          general={general}
          porLotes={porLotes}
          lineas={lineas.map((l) => ({
            productoId: l.productoId,
            presentacion: l.presentacion,
            pesoKg: l.pesoKg,
            unidades: l.unidades,
            total: l.total,
            loteCodigo: l.loteCodigo,
            fProduccion: l.fProduccion?.toISOString() ?? null,
            fVencimiento: l.fVencimiento.toISOString(),
            ubicacion: l.ubicacion,
            usuarioNombre: l.usuario.nombre,
            createdAt: l.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
