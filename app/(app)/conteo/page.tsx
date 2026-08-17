import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { IconClock } from "@/app/components/ui/icons";
import { NuevaSesionForm } from "./nueva-sesion-form";

export default async function ConteoPage() {
  const session = await auth();
  const esSupervisor = session?.user.rol === "SUPERVISOR";

  // Los operadores solo ven el/los inventariados abiertos ahora mismo — el
  // historial completo (cerrados) es cosa del supervisor, para no saturarlos.
  const [sesiones, almacenes] = await Promise.all([
    prisma.conteoSesion.findMany({
      where: esSupervisor ? {} : { estado: "ABIERTA" },
      include: { almacen: true, creadoPor: true, _count: { select: { lineas: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.almacen.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-headline-md text-on-surface">Conteo de inventario</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        {esSupervisor
          ? "Cada inventariado es una sesión independiente con su propio historial."
          : "El inventariado disponible para contar ahora mismo."}
      </p>

      {esSupervisor ? (
        <Card className="mt-6 p-6">
          <p className="text-sm font-semibold text-on-surface">Iniciar nuevo conteo</p>
          <div className="mt-4">
            <NuevaSesionForm almacenes={almacenes} />
          </div>
        </Card>
      ) : null}

      <div className="mt-6 space-y-3">
        {sesiones.length === 0 ? (
          <Card className="p-6 text-center text-sm text-on-surface-variant">
            {esSupervisor ? "Aún no has iniciado ningún conteo." : "No hay ningún inventariado abierto ahora mismo."}
          </Card>
        ) : (
          sesiones.map((s) => (
            <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-on-surface">{s.nombre}</p>
                  <Badge variant={s.estado === "ABIERTA" ? "success" : "neutral"}>
                    {s.estado === "ABIERTA" ? "Abierta" : "Cerrada"}
                  </Badge>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <IconClock size={13} />
                  {s.almacen.nombre} · {s._count.lineas} líneas · creado por {s.creadoPor.nombre}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/conteo/${s.id}/dashboard`}
                  className="rounded-md border border-outline-variant px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
                >
                  Dashboard
                </Link>
                <Link
                  href={`/conteo/${s.id}`}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container"
                >
                  Contar
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
