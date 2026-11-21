import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { calendarDay, type DateRange, type ReportRow } from "./filters";

const width = 595;
const height = 842;
const margin = 36;
const contentWidth = width - margin * 2;
const bodyTop = 644;
const bodyBottom = 60;
const padding = 14;
const lineHeight = 15;

// Light surfaces and brand colors from app/globals.css.
const plum = rgb(43 / 255, 9 / 255, 56 / 255);
const plumLight = rgb(68 / 255, 17 / 255, 84 / 255);
const pink = rgb(197 / 255, 30 / 255, 117 / 255);
const pinkLight = rgb(249 / 255, 168 / 255, 212 / 255);
const muted = rgb(122 / 255, 91 / 255, 121 / 255);
const border = rgb(243 / 255, 217 / 255, 232 / 255);
const blush = rgb(250 / 255, 240 / 255, 246 / 255);
const white = rgb(1, 1, 1);

export const reportLogoPath = "/logo-anas-pastry-shop-white.png";

function panel(page: PDFPage, x: number, top: number, w: number, h: number, color: RGB, outline?: RGB) {
  const r = Math.min(12, h / 2);
  page.drawSvgPath(
    `M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`,
    { x, y: top, color, borderColor: outline, borderWidth: outline ? 0.75 : 0 },
  );
}

function wrap(value: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of value.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = "";
    for (const char of word) {
      if (font.widthOfTextAtSize(line + char, size) > maxWidth) {
        lines.push(line);
        line = "";
      }
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function createReport(
  title: string,
  range: DateRange,
  rows: ReportRow[],
  subtitle?: string,
  logoBytes?: ArrayBuffer | Uint8Array,
) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const logo = logoBytes ? await document.embedPng(logoBytes) : undefined;
  const supported = new Set(font.getCharacterSet());
  const text = (value: string) => Array.from(value.normalize("NFC").replace(/\s+/g, " ").trim(), (char) =>
    supported.has(char.codePointAt(0)!) ? char : "?"
  ).join("");
  const period = text(`${range.from || "Inicio"} a ${range.to || "Actualidad"}`);
  const count = rows.filter((row) => !row.heading).length;
  const scope = text(subtitle ?? (count === 1 ? "1 registro" : `${count} registros`));
  document.setTitle(title);
  document.setAuthor("Ana's Pastry Shop");

  function addPage() {
    const page = document.addPage([width, height]);
    panel(page, margin, 806, contentWidth, 98, plum);
    page.drawLine({ start: { x: 54, y: 788 }, end: { x: 77, y: 788 }, thickness: 2, color: pinkLight });
    page.drawText("ANA'S PASTRY SHOP", { x: 84, y: 785, font: bold, size: 9, color: pinkLight });
    const titleLines = wrap(text(title), bold, 24, 365);
    titleLines.forEach((line, index) => {
      page.drawText(line, { x: 54, y: 751 - index * 25, font: bold, size: 24, color: white });
    });
    if (logo) {
      panel(page, 446, 792, 96, 70, plumLight);
      const size = logo.scaleToFit(80, 58);
      page.drawImage(logo, { x: 494 - size.width / 2, y: 757 - size.height / 2, ...size });
    }

    panel(page, margin, 696, contentWidth, 40, blush, border);
    page.drawText("PERÍODO", { x: 50, y: 671, font: bold, size: 9, color: pink });
    page.drawText(period, { x: 104, y: 671, font: bold, size: 10, color: plum });
    page.drawText(scope, { x: width - 50 - font.widthOfTextAtSize(scope, 10), y: 671, font, size: 10, color: muted });
    return page;
  }

  let page = addPage();
  let y = bodyTop;
  let section = "";

  function sectionHeading(label: string) {
    panel(page, margin, y, contentWidth, 29, blush, border);
    page.drawCircle({ x: margin + 14, y: y - 14.5, size: 2.5, color: pink });
    page.drawText(label, { x: margin + 24, y: y - 19, font: bold, size: 11, color: plum });
    y -= 37;
  }

  function nextPage() {
    page = addPage();
    y = bodyTop;
    if (section) sectionHeading(`${section} (continuación)`);
  }

  if (!rows.length) {
    panel(page, margin, y, contentWidth, 46, white, border);
    page.drawText("No hay registros para el período seleccionado.", {
      x: margin + padding, y: y - 28, font, size: 11, color: muted,
    });
  }

  for (const [index, row] of rows.entries()) {
    const values = row.values.filter((value) => value != null && value !== "").map((value) => text(String(value)));
    if (row.heading) {
      const nextRow = rows[index + 1];
      if (y - (nextRow && !nextRow.heading ? 92 : 29) < bodyBottom) {
        page = addPage();
        y = bodyTop;
      }
      section = values.join(" · ");
      sectionHeading(section);
      continue;
    }

    const date = row.date ? calendarDay(row.date) : "";
    const dateWidth = date ? 80 : 0;
    const textWidth = contentWidth - 2 * padding - dateWidth;
    const label = values[0] || "";
    const detail = values.slice(1).join("  ·  ").replace(/\b(USD|VES) (?=\d)/g, "$1\u00a0");
    const paired = !date && values.length === 2 &&
      bold.widthOfTextAtSize(label, 11) + font.widthOfTextAtSize(detail, 10) + 24 <= textWidth;
    const lines = [
      ...wrap(label, bold, 11, textWidth).map((value) => ({ value, primary: true })),
      ...(!paired ? wrap(detail, font, 10, textWidth).map((value) => ({ value, primary: false })) : []),
    ];
    const cardHeight = 16 + Math.max(1, lines.length) * lineHeight;
    const followsHeading = rows[index - 1]?.heading;
    const freshPageSpace = bodyTop - bodyBottom - (section ? 37 : 0);
    if (y - 31 < bodyBottom || (!followsHeading && cardHeight <= freshPageSpace && y - cardHeight < bodyBottom)) {
      nextPage();
    }

    let offset = 0;
    do {
      const capacity = Math.floor((y - bodyBottom - 16) / lineHeight);
      const chunk = lines.slice(offset, offset + capacity);
      const chunkHeight = 16 + Math.max(1, chunk.length) * lineHeight;
      panel(page, margin, y, contentWidth, chunkHeight, white, border);
      if (date) {
        panel(page, margin + padding, y - 7, 68, 17, blush);
        page.drawText(date, { x: margin + padding + 7, y: y - 19, font: bold, size: 9, color: pink });
      }
      chunk.forEach(({ value, primary }, lineIndex) => {
        page.drawText(value, {
          x: margin + padding + dateWidth, y: y - 19 - lineIndex * lineHeight,
          font: primary ? bold : font, size: primary ? 11 : 10, color: primary ? plum : muted,
        });
      });
      if (paired) {
        page.drawText(detail, {
          x: width - margin - padding - font.widthOfTextAtSize(detail, 10),
          y: y - 19, font, size: 10, color: muted,
        });
      }
      y -= chunkHeight + 6;
      offset += chunk.length;
      if (offset < lines.length) nextPage();
    } while (offset < lines.length);
  }

  const pages = document.getPages();
  pages.forEach((sheet, index) => {
    sheet.drawLine({ start: { x: margin, y: 47 }, end: { x: width - margin, y: 47 }, thickness: 0.75, color: border });
    sheet.drawText("Ana's Pastry Shop", { x: margin, y: 30, font: bold, size: 9, color: plum });
    const label = `Página ${index + 1} de ${pages.length}`;
    sheet.drawText(label, { x: width - margin - font.widthOfTextAtSize(label, 9), y: 30, font, size: 9, color: muted });
  });
  return document.save();
}
