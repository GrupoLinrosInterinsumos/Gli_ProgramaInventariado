import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { contentDisposition } from "./content-disposition";

export async function xlsxResponse(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
  });

  for (const row of rows) sheet.addRow(row);

  sheet.columns.forEach((col) => {
    col.width = 20;
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": contentDisposition("attachment", filename),
    },
  });
}
