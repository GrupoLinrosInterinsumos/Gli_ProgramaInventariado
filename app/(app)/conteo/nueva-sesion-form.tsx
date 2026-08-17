"use client";

import { useActionState } from "react";
import { Button } from "@/app/components/ui/button";
import { IconUpload } from "@/app/components/ui/icons";
import { crearSesionAction, type CrearSesionState } from "./actions";

export function NuevaSesionForm({ almacenes }: { almacenes: { id: string; nombre: string }[] }) {
  const [state, formAction, pending] = useActionState<CrearSesionState, FormData>(crearSesionAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Nombre del conteo
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            placeholder="Ej. Inventariado Agosto 2026"
            className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="almacenId" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Almacén
          </label>
          <select
            id="almacenId"
            name="almacenId"
            required
            defaultValue=""
            className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="" disabled>
              Seleccionar...
            </option>
            {almacenes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="archivo" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Excel de carga previa
        </label>
        <div className="mt-1 flex items-center gap-3">
          <input
            id="archivo"
            name="archivo"
            type="file"
            required
            accept=".xlsx,.xls"
            className="block w-full text-sm text-on-surface-variant file:mr-3 file:rounded-md file:border-0 file:bg-primary-fixed file:px-3 file:py-2 file:text-sm file:font-semibold file:text-on-primary-fixed hover:file:bg-primary-fixed-dim"
          />
        </div>
        <p className="mt-1 text-xs text-on-surface-variant">
          Columnas: Producto | Presentacion | Peso_kg | Lote | F_Produccion | F_Vencimiento | Cantidad_Stock
        </p>
        <p className="text-xs text-on-surface-variant">
          &ldquo;Codigo&rdquo; es opcional: si tu Producto ya trae el código entre corchetes (ej.
          &ldquo;[ACEK1-160-025] Acesulfame K Foture x 25kg&rdquo;), se detecta solo.
        </p>
      </div>

      {state?.error ? (
        <div className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">
          <p>{state.error}</p>
          {state.errores && state.errores.length > 0 ? (
            <ul className="mt-1 list-disc pl-4">
              {state.errores.slice(0, 8).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <Button type="submit" loading={pending}>
        <IconUpload size={16} />
        {pending ? "Procesando..." : "Iniciar conteo"}
      </Button>
    </form>
  );
}
