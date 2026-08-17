import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumenProducto } from "@/lib/conteo-resumen";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#464651", marginBottom: 14 },
  table: { display: "flex", width: "100%", borderWidth: 1, borderColor: "#c7c5d2" },
  row: { flexDirection: "row" },
  headerRow: { backgroundColor: "#edeef0" },
  cell: { padding: 5, borderRightWidth: 1, borderRightColor: "#c7c5d2", borderBottomWidth: 1, borderBottomColor: "#c7c5d2" },
  headerCell: { fontWeight: 700 },
  colProducto: { width: "32%" },
  colCodigo: { width: "14%" },
  colNum: { width: "14%", textAlign: "right" as const },
  colEstado: { width: "12%" },
});

function estadoLabel(estado: ResumenProducto["estado"]) {
  if (estado === "excedido") return "Excedido";
  if (estado === "completo") return "Completo";
  if (estado === "en_progreso") return "En progreso";
  return "Pendiente";
}

export function ConteoPdfDocument({
  sesionNombre,
  fecha,
  filas,
}: {
  sesionNombre: string;
  fecha: string;
  filas: ResumenProducto[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Conteo de inventario — {sesionNombre}</Text>
        <Text style={styles.subtitle}>Generado el {fecha}</Text>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell, styles.colProducto]}>Producto</Text>
            <Text style={[styles.cell, styles.headerCell, styles.colCodigo]}>Código</Text>
            <Text style={[styles.cell, styles.headerCell, styles.colNum]}>Stock previo</Text>
            <Text style={[styles.cell, styles.headerCell, styles.colNum]}>Contado</Text>
            <Text style={[styles.cell, styles.headerCell, styles.colNum]}>%</Text>
            <Text style={[styles.cell, styles.headerCell, styles.colEstado]}>Estado</Text>
          </View>

          {filas.map((f) => (
            <View style={styles.row} key={f.productoId}>
              <Text style={[styles.cell, styles.colProducto]}>{f.nombre}</Text>
              <Text style={[styles.cell, styles.colCodigo]}>{f.codigo}</Text>
              <Text style={[styles.cell, styles.colNum]}>{f.stockPrevio.toLocaleString("es-PE")}</Text>
              <Text style={[styles.cell, styles.colNum]}>{f.contado.toLocaleString("es-PE")}</Text>
              <Text style={[styles.cell, styles.colNum]}>{Math.round(f.pct)}%</Text>
              <Text style={[styles.cell, styles.colEstado]}>{estadoLabel(f.estado)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
