"use client";

import { useActionState } from "react";
import { Button } from "@/app/components/ui/button";
import { createUsuarioAction, type UsuarioFormState } from "./actions";

export function UsuarioForm() {
  const [state, formAction, pending] = useActionState<UsuarioFormState, FormData>(createUsuarioAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Correo corporativo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="nombre@gli.pe"
            className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="rol" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Rol
          </label>
          <select
            id="rol"
            name="rol"
            defaultValue="OPERADOR"
            className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="OPERADOR">Operador</option>
            <option value="SUPERVISOR">Supervisor</option>
          </select>
        </div>
      </div>

      {state?.error ? (
        <p className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{state.error}</p>
      ) : null}

      <Button type="submit" loading={pending}>
        {pending ? "Creando..." : "Crear usuario"}
      </Button>
    </form>
  );
}
