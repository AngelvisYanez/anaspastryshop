import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { calendarDay, type DateRange, type ReportRow } from "./filters";

export async function downloadReport(title: string, range: DateRange, rows: ReportRow[]) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const supported = new Set(font.getCharacterSet());
  const text = (value: string) => Array.from(value.normalize("NFC").replace(/\s+/g, " "), (char) =>
    supported.has(char.codePointAt(0)!) ? char : "?"
  ).join("");
  document.setTitle(title);

  const ink = rgb(0.19, 0.13, 0.17);
  const accent = rgb(0.52, 0.19, 0.31);
  function addPage() {
    const page = document.addPage([595, 842]);
    page.drawText("ANA'S PASTRY SHOP", { x: 42, y: 794, font: bold, size: 10, color: accent });
    page.drawText(text(title), { x: 42, y: 766, font: bold, size: 22, color: ink });
    page.drawText(text(`${range.from || "Inicio"} a ${range.to || "Actualidad"} · ${rows.length} registros`), {
      x: 42, y: 746, font, size: 10, color: ink,
    });
    return page;
  }

  let page = addPage();
  let y = 713;
  for (const row of rows) {
    const line = text([row.date ? calendarDay(row.date) : "", ...row.values]
      .filter((value) => value != null && value !== "").join("  |  "));
    let fragment = "";
    for (const char of line) {
      if (font.widthOfTextAtSize(fragment + char, 10) > 510) {
        writeLine(fragment);
        fragment = "";
      }
      fragment += char;
    }
    writeLine(fragment);
    y -= 5;
  }

  function writeLine(line: string) {
    if (y < 58) {
      page = addPage();
      y = 713;
    }
    page.drawText(line, { x: 42, y, font, size: 10, color: ink });
    y -= 15;
  }

  const pages = document.getPages();
  pages.forEach((sheet, index) => {
    sheet.drawText(`Página ${index + 1} de ${pages.length}`, { x: 42, y: 30, font, size: 9, color: accent });
  });
  const bytes = await document.save();
  const url = URL.createObjectURL(new Blob([Uint8Array.from(bytes)], { type: "application/pdf" }));
  const link = window.document.createElement("a");
  link.href = url;
  const slug = title.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  link.download = `${slug}-${range.from || "inicio"}-${range.to || "actualidad"}.pdf`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
