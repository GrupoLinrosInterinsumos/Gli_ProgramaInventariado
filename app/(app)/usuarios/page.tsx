import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { LinkButton } from "@/app/components/ui/link-button";
import { toggleUsuarioActivoAction } from "./actions";

export default async function UsuariosPage() {
  const session = await auth();
  if (!session || session.user.rol !== "SUPERVISOR") redirect("/conteo");

  const usuarios = await prisma.usuario.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md text-on-surface">Usuarios</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">Cuentas de operadores y supervisores.</p>
        </div>
        <LinkButton href="/usuarios/nuevo">Nuevo usuario</LinkButton>
      </div>

      <div className="mt-6 space-y-2">
        {usuarios.map((u) => (
          <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-on-surface">{u.nombre}</p>
                <Badge variant={u.rol === "SUPERVISOR" ? "info" : "neutral"}>{u.rol === "SUPERVISOR" ? "Supervisor" : "Operador"}</Badge>
                <Badge variant={u.activo ? "success" : "danger"}>{u.activo ? "Activo" : "Inactivo"}</Badge>
              </div>
              <p className="mt-1 text-xs text-on-surface-variant">{u.email}</p>
            </div>

            {u.id !== session.user.id ? (
              <form action={toggleUsuarioActivoAction.bind(null, u.id)}>
                <button
                  type="submit"
                  className="rounded-md border border-outline-variant px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
                >
                  {u.activo ? "Desactivar" : "Activar"}
                </button>
              </form>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
