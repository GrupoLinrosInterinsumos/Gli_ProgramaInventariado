"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { IconPlus } from "@/app/components/ui/icons";
import { agregarLineaAction, crearLoteAction } from "./actions";

type Lote = { id: string; codigo: string; fProduccion: string | null; fVencimiento: string };
type Producto = { id: string; codigo: string; nombre: string; presentacion: string; pesoKg: number | null; lotes: Lote[] };

const NUEVO_LOTE = "__nuevo__";

function formatFecha(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", { timeZone: "UTC" });
}

export function ConteoForm({ sesionId, productos }: { sesionId: string; productos: Producto[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [productoId, setProductoId] = useState("");
  const [presentacion, setPresentacion] = useState("");
  const [pesoKg, setPesoKg] = useState("");
  const [unidades, setUnidades] = useState("");
  const [loteId, setLoteId] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [lotesExtra, setLotesExtra] = useState<Record<string, Lote[]>>({});
  const [nuevoLote, setNuevoLote] = useState({ codigo: "", fProduccion: "", fVencimiento: "" });

  const productosPorId = useMemo(() => new Map(productos.map((p) => [p.id, p])), [productos]);
  const producto = productoId ? productosPorId.get(productoId) : undefined;

  const lotesDisponibles = useMemo(() => {
    if (!producto) return [] as Lote[];
    const extra = lotesExtra[producto.id] ?? [];
    const combinados = [...producto.lotes, ...extra.filter((l) => !producto.lotes.some((pl) => pl.id === l.id))];
    return combinados.sort((a, b) => a.codigo.localeCompare(b.codigo));
  }, [producto, lotesExtra]);

  const loteSeleccionado = lotesDisponibles.find((l) => l.id === loteId);
  const total = (Number(pesoKg) || 0) * (Number(unidades) || 0);

  function elegirProducto(id: string) {
    setProductoId(id);
    const p = productosPorId.get(id);
    setPresentacion(p?.presentacion ?? "");
    setPesoKg(p?.pesoKg != null ? String(p.pesoKg) : "");
    setLoteId("");
    setError(null);
  }

  function guardarNuevoLote() {
    if (!producto) return;
    startTransition(async () => {
      const result = await crearLoteAction(producto.id, nuevoLote.codigo, nuevoLote.fProduccion, nuevoLote.fVencimiento);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setLotesExtra((prev) => ({ ...prev, [producto.id]: [...(prev[producto.id] ?? []), result.lote] }));
      setLoteId(result.lote.id);
      setNuevoLote({ codigo: "", fProduccion: "", fVencimiento: "" });
      setError(null);
      router.refresh();
    });
  }

  function agregar() {
    if (!productoId) return setError("Elige un producto.");
    if (!presentacion.trim()) return setError("La presentación es obligatoria.");
    if (!(Number(pesoKg) > 0)) return setError("El peso debe ser mayor a 0.");
    if (!(Number(unidades) > 0)) return setError("Las unidades deben ser mayor a 0.");
    if (!loteId || loteId === NUEVO_LOTE) return setError("Elige o crea un lote.");
    if (!ubicacion.trim()) return setError("La ubicación es obligatoria.");

    setError(null);
    startTransition(async () => {
      const result = await agregarLineaAction(sesionId, {
        productoId,
        presentacion: presentacion.trim(),
        pesoKg: Number(pesoKg),
        unidades: Number(unidades),
        loteId,
        ubicacion: ubicacion.trim(),
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setUnidades("");
      setUbicacion("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1 lg:col-span-2">
          <label className="block text-label-md uppercase tracking-wide text-on-surface-variant">Producto</label>
          <select
            value={productoId}
            onChange={(e) => elegirProducto(e.target.value)}
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Seleccionar...</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.codigo})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-label-md uppercase tracking-wide text-on-surface-variant">Presentación</label>
          <input
            type="text"
            value={presentacion}
            onChange={(e) => setPresentacion(e.target.value)}
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-label-md uppercase tracking-wide text-on-surface-variant">Peso (kg)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={pesoKg}
            onChange={(e) => setPesoKg(e.target.value)}
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-label-md uppercase tracking-wide text-on-surface-variant"># Unidades</label>
          <input
            type="number"
            min="0"
            step="1"
            value={unidades}
            onChange={(e) => setUnidades(e.target.value)}
            placeholder="0"
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-label-md uppercase tracking-wide text-on-surface-variant">Total</label>
          <p className="mt-1 flex h-[34px] items-center rounded-md bg-surface-container px-2 text-sm font-semibold text-on-surface">
            {total.toLocaleString("es-PE", { maximumFractionDigits: 2 })}
          </p>
        </div>

        <div>
          <label className="block text-label-md uppercase tracking-wide text-on-surface-variant">Lote</label>
          <select
            value={loteId}
            disabled={!producto}
            onChange={(e) => setLoteId(e.target.value)}
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-surface-container"
          >
            <option value="">Seleccionar...</option>
            {lotesDisponibles.map((l) => (
              <option key={l.id} value={l.id}>
                {l.codigo}
              </option>
            ))}
            <option value={NUEVO_LOTE}>+ Agregar nuevo lote</option>
          </select>
        </div>

        <div>
          <label className="block text-label-md uppercase tracking-wide text-on-surface-variant">F. Producción</label>
          <p className="mt-1 flex h-[34px] items-center rounded-md bg-surface-container px-2 text-sm text-on-surface-variant">
            {loteSeleccionado ? formatFecha(loteSeleccionado.fProduccion) : "—"}
          </p>
        </div>

        <div>
          <label className="block text-label-md uppercase tracking-wide text-on-surface-variant">F. Vencimiento</label>
          <p className="mt-1 flex h-[34px] items-center rounded-md bg-surface-container px-2 text-sm text-on-surface-variant">
            {loteSeleccionado ? formatFecha(loteSeleccionado.fVencimiento) : "—"}
          </p>
        </div>

        <div className="sm:col-span-2 md:col-span-1 lg:col-span-2">
          <label className="block text-label-md uppercase tracking-wide text-on-surface-variant">Ubicación</label>
          <input
            type="text"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ej. Rack 3 - Nivel 2"
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {loteId === NUEVO_LOTE && producto ? (
        <div className="rounded-md border border-dashed border-outline-variant bg-surface-container-low p-3">
          <p className="text-sm font-semibold text-on-surface">Nuevo lote para {producto.nombre}</p>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              type="text"
              placeholder="Código de lote"
              value={nuevoLote.codigo}
              onChange={(e) => setNuevoLote((p) => ({ ...p, codigo: e.target.value }))}
              className="rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="date"
              title="Fecha de producción (opcional)"
              value={nuevoLote.fProduccion}
              onChange={(e) => setNuevoLote((p) => ({ ...p, fProduccion: e.target.value }))}
              className="rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="date"
              title="Fecha de vencimiento (obligatoria)"
              required
              value={nuevoLote.fVencimiento}
              onChange={(e) => setNuevoLote((p) => ({ ...p, fVencimiento: e.target.value }))}
              className="rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button type="button" variant="outline" size="sm" loading={pending} onClick={guardarNuevoLote}>
              Guardar lote
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{error}</p> : null}

      <Button type="button" loading={pending} onClick={agregar}>
        <IconPlus size={16} />
        Agregar
      </Button>
    </div>
  );
}
