import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { IconClock } from "@/app/components/ui/icons";

export default async function DashboardIndexPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const esSupervisor = session.user.rol === "SUPERVISOR";

  // Los operadores solo ven el/los inventariados abiertos ahora mismo — el
  // historial completo (cerrados) es cosa del supervisor, para no saturarlos.
  const sesiones = await prisma.conteoSesion.findMany({
    where: esSupervisor ? {} : { estado: "ABIERTA" },
    include: { almacen: true, _count: { select: { lineas: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-headline-md text-on-surface">Dashboard</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        {esSupervisor ? "Elige un inventariado para ver su avance en tiempo real." : "Avance en tiempo real del inventariado en curso."}
      </p>

      <div className="mt-6 space-y-3">
        {sesiones.length === 0 ? (
          <Card className="p-6 text-center text-sm text-on-surface-variant">
            {esSupervisor ? "Todavía no hay ningún conteo iniciado." : "No hay ningún inventariado abierto ahora mismo."}
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
                  {s.almacen.nombre} · {s._count.lineas} líneas
                </p>
              </div>
              <Link
                href={`/conteo/${s.id}/dashboard`}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container"
              >
                Ver dashboard
              </Link>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
