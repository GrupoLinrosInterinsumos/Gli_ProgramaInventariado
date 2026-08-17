"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { RadialProgress } from "@/app/components/ui/radial-progress";
import { IconSearch } from "@/app/components/ui/icons";
import type { EstadoAvance, ResumenLote, ResumenProducto } from "@/lib/conteo-resumen";

type Linea = {
  productoId: string;
  presentacion: string;
  pesoKg: number;
  unidades: number;
  total: number;
  loteCodigo: string;
  fProduccion: string;
  fVencimiento: string;
  ubicacion: string;
  usuarioNombre: string;
  createdAt: string;
};

const ESTADO_UI: Record<EstadoAvance, { label: string; badge: "neutral" | "warning" | "success" | "danger"; tono: "primary" | "warning" | "success" | "danger" }> = {
  pendiente: { label: "Pendiente", badge: "neutral", tono: "primary" },
  en_progreso: { label: "En progreso", badge: "warning", tono: "warning" },
  completo: { label: "Completo", badge: "success", tono: "success" },
  excedido: { label: "¡Excedido!", badge: "danger", tono: "danger" },
};

function fmt(n: number) {
  return n.toLocaleString("es-PE", { maximumFractionDigits: 2 });
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", { timeZone: "UTC" });
}

export function DashboardClient({
  general,
  porLotes,
  lineas,
}: {
  general: ResumenProducto[];
  porLotes: ResumenLote[];
  lineas: Linea[];
}) {
  const [vista, setVista] = useState<"general" | "lotes">("general");
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);

  const lineasPorProducto = useMemo(() => {
    const map = new Map<string, Linea[]>();
    for (const l of lineas) {
      const arr = map.get(l.productoId) ?? [];
      arr.push(l);
      map.set(l.productoId, arr);
    }
    return map;
  }, [lineas]);

  const lineasPorLote = useMemo(() => {
    const map = new Map<string, Linea[]>();
    for (const l of lineas) {
      const clave = `${l.productoId}::${l.loteCodigo}`;
      const arr = map.get(clave) ?? [];
      arr.push(l);
      map.set(clave, arr);
    }
    return map;
  }, [lineas]);

  const generalFiltrado = useMemo(
    () => general.filter((r) => `${r.nombre} ${r.codigo}`.toLowerCase().includes(q.toLowerCase())),
    [general, q]
  );
  const lotesFiltrado = useMemo(
    () => porLotes.filter((r) => `${r.nombre} ${r.codigo} ${r.loteCodigo}`.toLowerCase().includes(q.toLowerCase())),
    [porLotes, q]
  );

  function toggle(key: string) {
    setAbierto((prev) => (prev === key ? null : key));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto o código..."
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2 pl-9 pr-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="inline-flex rounded-md border border-outline-variant bg-surface-container-lowest p-1">
          <button
            type="button"
            onClick={() => {
              setVista("general");
              setAbierto(null);
            }}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${vista === "general" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => {
              setVista("lotes");
              setAbierto(null);
            }}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${vista === "lotes" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
          >
            Por lotes
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {vista === "general"
          ? generalFiltrado.map((r) => (
              <TarjetaResumen
                key={r.productoId}
                claveTarjeta={r.productoId}
                titulo={r.nombre}
                subtitulo={r.codigo}
                r={r}
                lineas={lineasPorProducto.get(r.productoId) ?? []}
                abierto={abierto === r.productoId}
                onToggle={() => toggle(r.productoId)}
              />
            ))
          : lotesFiltrado.map((r) => {
              const clave = `${r.productoId}::${r.loteCodigo}`;
              return (
                <TarjetaResumen
                  key={clave}
                  claveTarjeta={clave}
                  titulo={r.productoNombre}
                  subtitulo={`Lote ${r.loteCodigo}`}
                  r={r}
                  lineas={lineasPorLote.get(clave) ?? []}
                  abierto={abierto === clave}
                  onToggle={() => toggle(clave)}
                />
              );
            })}

        {(vista === "general" ? generalFiltrado.length : lotesFiltrado.length) === 0 ? (
          <Card className="col-span-full p-6 text-center text-sm text-on-surface-variant">
            Sin resultados todavía.
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function TarjetaResumen({
  claveTarjeta,
  titulo,
  subtitulo,
  r,
  lineas,
  abierto,
  onToggle,
}: {
  claveTarjeta: string;
  titulo: string;
  subtitulo: string;
  r: ResumenProducto;
  lineas: Linea[];
  abierto: boolean;
  onToggle: () => void;
}) {
  const ui = ESTADO_UI[r.estado];

  return (
    <Card className={abierto ? "col-span-full p-4" : "p-4"}>
      <button type="button" onClick={onToggle} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-label-md uppercase tracking-wide text-on-surface-variant">Prod.</p>
            <p className="truncate text-sm font-semibold text-on-surface">{titulo}</p>
            <p className="text-xs text-on-surface-variant">{subtitulo}</p>
          </div>
          <div className="shrink-0 rounded-md border border-outline-variant bg-surface-container-low px-2.5 py-1.5 text-right">
            <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">Cantidad Stock</p>
            <p className="text-sm font-bold text-on-surface">{fmt(r.stockPrevio)}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="min-w-0 flex-1 rounded-md border border-outline-variant">
            <div className="grid grid-cols-2 border-b border-outline-variant bg-surface-container-low text-label-sm uppercase tracking-wide text-on-surface-variant">
              <span className="px-2 py-1">Pos</span>
              <span className="border-l border-outline-variant px-2 py-1 text-right">Kg</span>
            </div>
            <div className={abierto ? "" : "max-h-28 overflow-y-auto"}>
              {lineas.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-on-surface-variant">Sin conteos aún</p>
              ) : (
                lineas.map((l, i) => (
                  <div key={i} className="grid grid-cols-2 border-t border-outline-variant text-xs first:border-t-0">
                    <span className="px-2 py-1 text-on-surface-variant">{i + 1}</span>
                    <span className="border-l border-outline-variant px-2 py-1 text-right font-medium text-on-surface">{fmt(l.total)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <RadialProgress pct={r.pct} tone={ui.tono} />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-outline-variant pt-2">
          <span className="text-xs font-medium text-on-surface-variant">Total contado</span>
          <span className="text-sm font-bold text-on-surface">{fmt(r.contado)}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-medium text-primary">{abierto ? "Ocultar tabla ▲" : "Ver tabla ▼"}</span>
          <Badge variant={ui.badge}>{ui.label}</Badge>
        </div>
      </button>

      {abierto ? (
        <div className="mt-4 overflow-hidden rounded-md border border-outline-variant" key={claveTarjeta}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-outline-variant">
              <thead className="bg-surface-container">
                <tr>
                  {["#", "Presentación", "Peso", "Unid.", "Total", "Lote", "F. Prod.", "F. Venc.", "Ubicación", "Usuario"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                {lineas.map((l, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-sm text-on-surface-variant">{i + 1}</td>
                    <td className="px-3 py-2 text-sm text-on-surface-variant">{l.presentacion}</td>
                    <td className="px-3 py-2 text-sm text-on-surface-variant">{l.pesoKg}</td>
                    <td className="px-3 py-2 text-sm text-on-surface-variant">{l.unidades}</td>
                    <td className="px-3 py-2 text-sm font-semibold text-on-surface">{fmt(l.total)}</td>
                    <td className="px-3 py-2 text-sm text-on-surface-variant">{l.loteCodigo}</td>
                    <td className="px-3 py-2 text-sm text-on-surface-variant">{formatFecha(l.fProduccion)}</td>
                    <td className="px-3 py-2 text-sm text-on-surface-variant">{formatFecha(l.fVencimiento)}</td>
                    <td className="px-3 py-2 text-sm text-on-surface-variant">{l.ubicacion}</td>
                    <td className="px-3 py-2 text-sm text-on-surface-variant">{l.usuarioNombre}</td>
                  </tr>
                ))}
                {lineas.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-6 text-center text-sm text-on-surface-variant">
                      Sin conteos aún.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
