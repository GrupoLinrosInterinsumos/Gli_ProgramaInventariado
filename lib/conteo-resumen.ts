import { prisma } from "@/lib/prisma";

export type EstadoAvance = "pendiente" | "en_progreso" | "completo" | "excedido";

// Margen solo para el error de redondeo de sumar floats (kg), no para
// aceptar conteos "casi completos" como si fueran exactos.
const EPSILON_PCT = 0.01;

export function calcularEstado(pct: number): EstadoAvance {
  if (pct <= 0) return "pendiente";
  if (pct > 100 + EPSILON_PCT) return "excedido";
  if (pct >= 100 - EPSILON_PCT) return "completo";
  return "en_progreso";
}

export type ResumenProducto = {
  productoId: string;
  codigo: string;
  nombre: string;
  stockPrevio: number;
  contado: number;
  pct: number;
  estado: EstadoAvance;
};

export type ResumenLote = ResumenProducto & {
  productoNombre: string;
  loteCodigo: string;
};

export async function getResumenGeneral(sesionId: string): Promise<ResumenProducto[]> {
  const sesion = await prisma.conteoSesion.findUniqueOrThrow({ where: { id: sesionId } });

  const [productos, stockGrupos, contadoGrupos] = await Promise.all([
    prisma.producto.findMany({ where: { almacenId: sesion.almacenId, activo: true } }),
    prisma.stockPrevio.groupBy({ by: ["productoId"], where: { sesionId }, _sum: { cantidad: true } }),
    prisma.conteoLinea.groupBy({ by: ["productoId"], where: { sesionId }, _sum: { total: true } }),
  ]);

  const stockPorProducto = new Map(stockGrupos.map((g) => [g.productoId, g._sum.cantidad ?? 0]));
  const contadoPorProducto = new Map(contadoGrupos.map((g) => [g.productoId, g._sum.total ?? 0]));

  return productos
    .filter((p) => stockPorProducto.has(p.id) || contadoPorProducto.has(p.id))
    .map((p) => {
      const stockPrevio = stockPorProducto.get(p.id) ?? 0;
      const contado = contadoPorProducto.get(p.id) ?? 0;
      const pct = stockPrevio > 0 ? (contado / stockPrevio) * 100 : contado > 0 ? 100.5 : 0;
      return {
        productoId: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        stockPrevio,
        contado,
        pct,
        estado: calcularEstado(pct),
      };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function getResumenPorLotes(sesionId: string): Promise<ResumenLote[]> {
  const sesion = await prisma.conteoSesion.findUniqueOrThrow({ where: { id: sesionId } });

  const productos = await prisma.producto.findMany({ where: { almacenId: sesion.almacenId } });
  const productoIds = productos.map((p) => p.id);

  const [lotes, stockGrupos, contadoGrupos] = await Promise.all([
    productoIds.length > 0 ? prisma.lote.findMany({ where: { productoId: { in: productoIds } } }) : Promise.resolve([]),
    prisma.stockPrevio.groupBy({ by: ["productoId", "loteId"], where: { sesionId }, _sum: { cantidad: true } }),
    prisma.conteoLinea.groupBy({ by: ["productoId", "loteId", "loteCodigo"], where: { sesionId }, _sum: { total: true } }),
  ]);

  const productosPorId = new Map(productos.map((p) => [p.id, p]));
  const lotesPorId = new Map(lotes.map((l) => [l.id, l]));

  type Clave = string;
  const claveDe = (productoId: string, loteCodigo: string) => `${productoId}::${loteCodigo}`;

  const filas = new Map<Clave, ResumenLote>();

  for (const g of stockGrupos) {
    const producto = productosPorId.get(g.productoId);
    if (!producto) continue;
    const loteCodigo = g.loteId ? (lotesPorId.get(g.loteId)?.codigo ?? "—") : "Sin lote";
    const clave = claveDe(g.productoId, loteCodigo);
    filas.set(clave, {
      productoId: g.productoId,
      codigo: producto.codigo,
      nombre: producto.nombre,
      productoNombre: producto.nombre,
      loteCodigo,
      stockPrevio: g._sum.cantidad ?? 0,
      contado: 0,
      pct: 0,
      estado: "pendiente",
    });
  }

  for (const g of contadoGrupos) {
    const producto = productosPorId.get(g.productoId);
    if (!producto) continue;
    const clave = claveDe(g.productoId, g.loteCodigo);
    const existente = filas.get(clave);
    const contado = g._sum.total ?? 0;
    if (existente) {
      existente.contado += contado;
    } else {
      filas.set(clave, {
        productoId: g.productoId,
        codigo: producto.codigo,
        nombre: producto.nombre,
        productoNombre: producto.nombre,
        loteCodigo: g.loteCodigo,
        stockPrevio: 0,
        contado,
        pct: 0,
        estado: "pendiente",
      });
    }
  }

  return [...filas.values()]
    .map((f) => {
      const pct = f.stockPrevio > 0 ? (f.contado / f.stockPrevio) * 100 : f.contado > 0 ? 100.5 : 0;
      return { ...f, pct, estado: calcularEstado(pct) };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre) || a.loteCodigo.localeCompare(b.loteCodigo));
}
