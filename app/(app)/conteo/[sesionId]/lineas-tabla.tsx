"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { IconTrash } from "@/app/components/ui/icons";
import { actualizarLineaAction, eliminarLineaAction } from "./actions";

type Linea = {
  id: string;
  productoNombre: string;
  presentacion: string;
  pesoKg: number;
  unidades: number;
  total: number;
  loteCodigo: string;
  fProduccion: string | null;
  fVencimiento: string;
  ubicacion: string;
  usuarioNombre: string;
  usuarioId: string;
  createdAt: string;
};

function formatFecha(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", { timeZone: "UTC" });
}

/** ISO -> "YYYY-MM-DD" para precargar un <input type="date">. */
function fechaParaInput(iso: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function LineasTabla({
  lineas,
  currentUserId,
  currentUserRol,
  editable,
}: {
  lineas: Linea[];
  currentUserId: string;
  currentUserRol: "OPERADOR" | "SUPERVISOR";
  editable: boolean;
}) {
  const [editandoId, setEditandoId] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-outline-variant">
          <thead className="bg-surface-container">
            <tr>
              {["Producto", "Presentación", "Peso", "Unid.", "Total", "Lote", "F. Prod.", "F. Venc.", "Ubicación", "Usuario", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {lineas.map((linea) => {
              const puedeEditar = editable && (currentUserRol === "SUPERVISOR" || linea.usuarioId === currentUserId);
              return editandoId === linea.id ? (
                <FilaEdicion key={linea.id} linea={linea} onDone={() => setEditandoId(null)} />
              ) : (
                <FilaLectura
                  key={linea.id}
                  linea={linea}
                  puedeEditar={puedeEditar}
                  onEditar={() => setEditandoId(linea.id)}
                />
              );
            })}
            {lineas.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-sm text-on-surface-variant">
                  Todavía no se ha contado ningún producto en esta sesión.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilaLectura({ linea, puedeEditar, onEditar }: { linea: Linea; puedeEditar: boolean; onEditar: () => void }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <tr className="transition-colors hover:bg-surface-container">
      <td className="px-3 py-2 text-sm text-on-surface">{linea.productoNombre}</td>
      <td className="px-3 py-2 text-sm text-on-surface-variant">{linea.presentacion}</td>
      <td className="px-3 py-2 text-sm text-on-surface-variant">{linea.pesoKg}</td>
      <td className="px-3 py-2 text-sm text-on-surface-variant">{linea.unidades}</td>
      <td className="px-3 py-2 text-sm font-semibold text-on-surface">{linea.total.toLocaleString("es-PE", { maximumFractionDigits: 2 })}</td>
      <td className="px-3 py-2 text-sm text-on-surface-variant">{linea.loteCodigo}</td>
      <td className="px-3 py-2 text-sm text-on-surface-variant">{formatFecha(linea.fProduccion)}</td>
      <td className="px-3 py-2 text-sm text-on-surface-variant">{formatFecha(linea.fVencimiento)}</td>
      <td className="px-3 py-2 text-sm text-on-surface-variant">{linea.ubicacion}</td>
      <td className="px-3 py-2 text-sm text-on-surface-variant">{linea.usuarioNombre}</td>
      <td className="px-3 py-2 text-sm">
        {puedeEditar ? (
          <div className="flex items-center gap-2">
            <button type="button" onClick={onEditar} className="text-xs font-medium text-primary hover:text-primary-container">
              Editar
            </button>
            <button
              type="button"
              disabled={pending}
              aria-label="Eliminar línea"
              onClick={() =>
                startTransition(async () => {
                  await eliminarLineaAction(linea.id);
                  router.refresh();
                })
              }
              className="rounded p-1 text-secondary transition-colors hover:bg-error-container disabled:opacity-50"
            >
              <IconTrash size={14} />
            </button>
          </div>
        ) : null}
      </td>
    </tr>
  );
}

function FilaEdicion({ linea, onDone }: { linea: Linea; onDone: () => void }) {
  const [presentacion, setPresentacion] = useState(linea.presentacion);
  const [pesoKg, setPesoKg] = useState(String(linea.pesoKg));
  const [unidades, setUnidades] = useState(String(linea.unidades));
  const [fProduccion, setFProduccion] = useState(fechaParaInput(linea.fProduccion));
  const [ubicacion, setUbicacion] = useState(linea.ubicacion);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function guardar() {
    startTransition(async () => {
      const result = await actualizarLineaAction(linea.id, {
        presentacion,
        pesoKg: Number(pesoKg),
        unidades: Number(unidades),
        fProduccion: fProduccion || null,
        ubicacion,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
      onDone();
    });
  }

  return (
    <tr className="bg-surface-container-low">
      <td className="px-3 py-2 text-sm text-on-surface">{linea.productoNombre}</td>
      <td className="px-3 py-2">
        <input value={presentacion} onChange={(e) => setPresentacion(e.target.value)} className="w-28 rounded border border-outline-variant px-1.5 py-1 text-sm" />
      </td>
      <td className="px-3 py-2">
        <input type="number" step="0.01" value={pesoKg} onChange={(e) => setPesoKg(e.target.value)} className="w-16 rounded border border-outline-variant px-1.5 py-1 text-sm" />
      </td>
      <td className="px-3 py-2">
        <input type="number" step="1" value={unidades} onChange={(e) => setUnidades(e.target.value)} className="w-16 rounded border border-outline-variant px-1.5 py-1 text-sm" />
      </td>
      <td className="px-3 py-2 text-sm text-on-surface-variant">{(Number(pesoKg) * Number(unidades) || 0).toLocaleString("es-PE", { maximumFractionDigits: 2 })}</td>
      <td className="px-3 py-2 text-sm text-on-surface-variant">{linea.loteCodigo}</td>
      <td className="px-3 py-2">
        <input
          type="date"
          value={fProduccion}
          onChange={(e) => setFProduccion(e.target.value)}
          className="w-36 rounded border border-outline-variant px-1.5 py-1 text-sm"
        />
      </td>
      <td className="px-3 py-2 text-sm text-on-surface-variant">{formatFecha(linea.fVencimiento)}</td>
      <td className="px-3 py-2">
        <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className="w-28 rounded border border-outline-variant px-1.5 py-1 text-sm" />
      </td>
      <td className="px-3 py-2 text-sm text-on-surface-variant">{linea.usuarioNombre}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <Button size="sm" loading={pending} onClick={guardar}>
            Guardar
          </Button>
          <Button size="sm" variant="ghost" onClick={onDone}>
            Cancelar
          </Button>
        </div>
        {error ? <p className="mt-1 text-xs text-secondary">{error}</p> : null}
      </td>
    </tr>
  );
}
