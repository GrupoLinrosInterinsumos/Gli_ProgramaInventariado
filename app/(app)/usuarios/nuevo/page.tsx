import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card } from "@/app/components/ui/card";
import { UsuarioForm } from "../usuario-form";

export default async function NuevoUsuarioPage() {
  const session = await auth();
  if (!session || session.user.rol !== "SUPERVISOR") redirect("/conteo");

  return (
    <div className="max-w-xl">
      <h1 className="text-headline-md text-on-surface">Nuevo usuario</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Crea la cuenta de un operador o supervisor con su correo @gli.pe.
      </p>

      <Card className="mt-6 p-6">
        <UsuarioForm />
      </Card>
    </div>
  );
}
