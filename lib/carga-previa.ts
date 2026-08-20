import ExcelJS from "exceljs";
import type { PrismaClient } from "@/app/generated/prisma/client";
import type { Prisma } from "@/app/generated/prisma/client";

export type FilaCargaPrevia = {
  fila: number;
  codigo: string;
  nombre: string;
  presentacion: string;
  pesoKg: number | null;
  loteCodigo: string | null;
  fProduccion: Date | null;
  fVencimiento: Date | null;
  cantidadStock: number;
  almacenCodigo: string | null;
};

const COLUMNAS = {
  codigo: ["codigo", "código", "cod. producto", "cod producto"],
  nombre: ["producto", "n.producto"],
  presentacion: ["presentacion", "presentación", "n.producto/presentacion", "n.producto/presentación"],
  pesoKg: ["peso_kg", "peso kg", "peso", "n.producto/peso unitario"],
  lote: ["lote"],
  fProduccion: [
    "f_produccion",
    "fproduccion",
    "f. produccion",
    "f. producción",
    "lote/fecha de fabricacion",
    "lote/fecha de fabricación",
  ],
  fVencimiento: ["f_vencimiento", "fvencimiento", "f. vencimiento", "lote/fecha de caducidad"],
  cantidadStock: ["cantidad_stock", "cantidad stock", "stock"],
  almacen: ["almacen", "almacén", "n.almacen", "n.almacén"],
} as const;

/** Subcategoría de almacén que cuenta como stock real a comparar; el resto
 * (Pre-Producción, No conformes, etc.) se ignora en el conteo físico. */
const SUBCATEGORIA_VALIDA = "stock";

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function encontrarColumna(headers: string[], candidatos: readonly string[]) {
  const idx = headers.findIndex((h) => candidatos.includes(normalizar(h)));
  return idx === -1 ? null : idx;
}

function celdaTexto(row: ExcelJS.Row, col: number | null): string {
  if (col === null) return "";
  const value = row.getCell(col + 1).value;
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in value) return String((value as { text: unknown }).text ?? "").trim();
  return String(value).trim();
}

function celdaNumero(row: ExcelJS.Row, col: number | null): number | null {
  const texto = celdaTexto(row, col);
  if (!texto) return null;
  const num = Number(texto.replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

function celdaFecha(row: ExcelJS.Row, col: number | null): Date | null {
  if (col === null) return null;
  const value = row.getCell(col + 1).value;
  if (!value) return null;
  if (value instanceof Date) return value;
  const texto = celdaTexto(row, col);
  if (!texto) return null;
  const parsed = new Date(texto);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function parseCargaPreviaWorkbook(buffer: ArrayBuffer, almacenObjetivo?: string) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];

  if (!sheet) {
    return { filas: [] as FilaCargaPrevia[], errores: ["El archivo no tiene hojas."] };
  }

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value ?? "");
  });

  const colCodigo = encontrarColumna(headers, COLUMNAS.codigo);
  const colNombre = encontrarColumna(headers, COLUMNAS.nombre);
  const colPresentacion = encontrarColumna(headers, COLUMNAS.presentacion);
  const colPeso = encontrarColumna(headers, COLUMNAS.pesoKg);
  const colLote = encontrarColumna(headers, COLUMNAS.lote);
  const colFProd = encontrarColumna(headers, COLUMNAS.fProduccion);
  const colFVenc = encontrarColumna(headers, COLUMNAS.fVencimiento);
  const colStock = encontrarColumna(headers, COLUMNAS.cantidadStock);
  const colAlmacen = encontrarColumna(headers, COLUMNAS.almacen);

  const errores: string[] = [];
  if (colNombre === null) errores.push('Falta la columna "Producto".');
  if (colStock === null) errores.push('Falta la columna "Cantidad_Stock".');
  if (errores.length > 0) return { filas: [] as FilaCargaPrevia[], errores };

  const almacenObjetivoNorm = almacenObjetivo ? normalizar(almacenObjetivo) : null;

  const filas: FilaCargaPrevia[] = [];
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const nombreCelda = celdaTexto(row, colNombre);
    if (!nombreCelda) continue;

    // Columna tipo "AQP/Stock", "BSF/Pre-Producción", "BSF/No conformes":
    // código de almacén + subcategoría interna. Solo interesa el stock
    // normal ("Stock") del almacén de esta sesión — el resto se descarta.
    let almacenCodigo: string | null = null;
    if (colAlmacen !== null) {
      const valor = celdaTexto(row, colAlmacen);
      const [codigoParte, ...resto] = valor.split("/");
      almacenCodigo = codigoParte.trim() || null;
      const subcategoria = resto.join("/").trim();
      if (normalizar(subcategoria) !== SUBCATEGORIA_VALIDA) continue;
      if (almacenObjetivoNorm && normalizar(almacenCodigo ?? "") !== almacenObjetivoNorm) continue;
    }

    // Si no hay columna "Codigo" (o viene vacía), se busca un código entre
    // corchetes al inicio del nombre — formato típico exportado de otros
    // sistemas: "[ACEK1-160-025] ACESULFAME K FOTURE X 25kg".
    let codigo = celdaTexto(row, colCodigo);
    let nombre = nombreCelda;
    if (!codigo) {
      const match = nombreCelda.match(/^\[([^\]]+)\]\s*(.*)$/);
      if (match) {
        codigo = match[1].trim();
        nombre = match[2].trim() || nombreCelda;
      } else {
        codigo = nombreCelda;
      }
    }

    const loteCodigo = celdaTexto(row, colLote) || null;
    const cantidadStock = celdaNumero(row, colStock);

    if (cantidadStock === null) {
      errores.push(`Fila ${rowNumber}: "Cantidad_Stock" vacío o inválido para ${codigo}.`);
      continue;
    }

    filas.push({
      fila: rowNumber,
      codigo,
      nombre,
      presentacion: celdaTexto(row, colPresentacion),
      pesoKg: celdaNumero(row, colPeso),
      loteCodigo,
      fProduccion: celdaFecha(row, colFProd),
      fVencimiento: celdaFecha(row, colFVenc),
      cantidadStock,
      almacenCodigo,
    });

    if (loteCodigo && !celdaFecha(row, colFVenc)) {
      errores.push(`Fila ${rowNumber}: el lote "${loteCodigo}" no tiene F_Vencimiento, se ignoró el lote.`);
    }
  }

  if (filas.length === 0) errores.push("El archivo no tiene filas de datos.");

  return { filas, errores };
}

function agruparFilas(filas: FilaCargaPrevia[]) {
  const porProducto = new Map<string, FilaCargaPrevia>();
  const stockPorClave = new Map<
    string,
    { producto: FilaCargaPrevia; loteCodigo: string | null; cantidad: number; fProduccion: Date | null; fVencimiento: Date | null }
  >();

  for (const fila of filas) {
    porProducto.set(fila.codigo, fila);

    const loteValido = fila.loteCodigo && fila.fVencimiento ? fila.loteCodigo : null;
    const clave = `${fila.codigo}::${loteValido ?? ""}`;
    const existente = stockPorClave.get(clave);
    if (existente) {
      existente.cantidad += fila.cantidadStock;
    } else {
      stockPorClave.set(clave, {
        producto: fila,
        loteCodigo: loteValido,
        cantidad: fila.cantidadStock,
        fProduccion: loteValido ? fila.fProduccion : null,
        fVencimiento: loteValido ? fila.fVencimiento : null,
      });
    }
  }

  return { porProducto, stockPorClave };
}

/**
 * Aplica una carga previa ya parseada a una sesión: upsert de Producto y
 * Lote, y acumulación de StockPrevio. Se usa tanto desde la server action
 * de creación de sesión como desde scripts de prueba.
 */
export async function aplicarCargaPrevia(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"> | Prisma.TransactionClient,
  sesionId: string,
  almacenId: string,
  filas: FilaCargaPrevia[]
) {
  const { porProducto, stockPorClave } = agruparFilas(filas);

  const productoIdPorCodigo = new Map<string, string>();
  for (const fila of porProducto.values()) {
    const producto = await tx.producto.upsert({
      where: { codigo: fila.codigo },
      update: {
        nombre: fila.nombre,
        ...(fila.presentacion ? { presentacion: fila.presentacion } : {}),
        ...(fila.pesoKg !== null ? { pesoKg: fila.pesoKg } : {}),
      },
      create: {
        codigo: fila.codigo,
        nombre: fila.nombre,
        presentacion: fila.presentacion || "—",
        pesoKg: fila.pesoKg,
        almacenId,
      },
    });
    productoIdPorCodigo.set(fila.codigo, producto.id);
  }

  for (const entrada of stockPorClave.values()) {
    const productoId = productoIdPorCodigo.get(entrada.producto.codigo)!;

    let loteId: string | null = null;
    const { loteCodigo, fProduccion, fVencimiento } = entrada;
    if (loteCodigo && fVencimiento) {
      const lote = await tx.lote.upsert({
        where: { productoId_codigo: { productoId, codigo: loteCodigo } },
        update: { fProduccion, fVencimiento },
        create: { productoId, codigo: loteCodigo, fProduccion, fVencimiento },
      });
      loteId = lote.id;
    }

    const existente = await tx.stockPrevio.findFirst({ where: { sesionId, productoId, loteId } });
    if (existente) {
      await tx.stockPrevio.update({ where: { id: existente.id }, data: { cantidad: { increment: entrada.cantidad } } });
    } else {
      await tx.stockPrevio.create({ data: { sesionId, productoId, loteId, cantidad: entrada.cantidad } });
    }
  }
}
