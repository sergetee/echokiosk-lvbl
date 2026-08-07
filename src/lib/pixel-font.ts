export type PixelFontId = string;

export type FontMeta = {
  id: PixelFontId;
  name: string;
  tagline: string;
};

export type Dot = { x: number; y: number; on: boolean };

// Резервный глиф 3x5 (вопросительный знак/заглушка)
const FALLBACK_GLYPH = [
  "###",
  "###",
  "###",
  "###",
  "###"
];

// Автоматический импорт всех .txt файлов из папки src/fonts/
const fontFiles = import.meta.glob<string>("../fonts/*.txt", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** Парсит метаданные [META] и символы [CHAR:] из текстового файла */
function parseFontFile(rawText: string): { meta: FontMeta; glyphs: Record<string, string[]> } {
  const glyphs: Record<string, string[]> = {};
  const meta: FontMeta = { id: "", name: "", tagline: "" };

  const metaMatch = rawText.match(/\[META\]([\s\S]*?)(?=\[CHAR:|$)/);
  if (metaMatch) {
    const metaLines = metaMatch[1].split("\n");
    for (const line of metaLines) {
      const [key, ...values] = line.split(":");
      if (key && values.length > 0) {
        const k = key.trim();
        const v = values.join(":").trim();
        if (k === "id") meta.id = v;
        if (k === "name") meta.name = v;
        if (k === "tagline") meta.tagline = v;
      }
    }
  }

  const blocks = rawText.split(/^\[CHAR:(.+)\]$/gm);

  for (let i = 1; i < blocks.length; i += 2) {
    let charKey = blocks[i].trim();
    if (charKey === "SPACE") charKey = " ";

    const lines = blocks[i + 1]
      .split("\n")
      .map((line) => line.replace(/\r$/, ""));

    // Удаляем служебные пустые строки в начале и конце блока
    while (lines.length > 0 && lines[0] === "") {
      lines.shift();
    }
    while (lines.length > 0 && lines[lines.length - 1] === "") {
      lines.pop();
    }

    if (lines.length > 0) {
      glyphs[charKey] = lines;
    }
  }

  return { meta, glyphs };
}

export const PIXEL_FONTS: FontMeta[] = [];
export const FONT_MAPS: Record<PixelFontId, Record<string, string[]>> = {};

// Инициализация карт шрифтов
Object.values(fontFiles).forEach((rawText) => {
  if (typeof rawText === "string") {
    const { meta, glyphs } = parseFontFile(rawText);
    if (meta.id) {
      PIXEL_FONTS.push(meta);
      FONT_MAPS[meta.id] = glyphs;
    }
  }
});

// Фолбек для 7-Segment
if (!FONT_MAPS["segment"] && FONT_MAPS["classic"]) {
  FONT_MAPS["segment"] = FONT_MAPS["classic"];
  PIXEL_FONTS.push({
    id: "segment",
    name: "7-Segment",
    tagline: "Segment Display",
  });
}

// 7-SEGMENT LED MAP
export type SegmentName = "a" | "b" | "c" | "d" | "e" | "f" | "g";

export const SEGMENT_MAP: Record<string, SegmentName[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "d", "e", "g"],
  "3": ["a", "b", "c", "d", "g"],
  "4": ["b", "c", "f", "g"],
  "5": ["a", "c", "d", "f", "g"],
  "6": ["a", "c", "d", "e", "f", "g"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
  "-": ["g"],
  A: ["a", "b", "c", "e", "f", "g"],
  B: ["c", "d", "e", "f", "g"],
  C: ["a", "d", "e", "f"],
  D: ["b", "c", "d", "e", "g"],
  E: ["a", "d", "e", "f", "g"],
  F: ["a", "e", "f", "g"],
  G: ["a", "c", "d", "e", "f"],
  H: ["b", "c", "e", "f", "g"],
  I: ["b", "c"],
  J: ["b", "c", "d", "e"],
  K: ["b", "c", "e", "f", "g"],
  L: ["d", "e", "f"],
  M: ["a", "b", "c", "e", "f"],
  N: ["a", "b", "c", "e", "f"],
  O: ["a", "b", "c", "d", "e", "f"],
  P: ["a", "b", "e", "f", "g"],
  Q: ["a", "b", "c", "f", "g"],
  R: ["e", "g"],
  S: ["a", "c", "d", "f", "g"],
  T: ["d", "e", "f", "g"],
  U: ["b", "c", "d", "e", "f"],
  V: ["b", "c", "d", "e", "f"],
  W: ["b", "c", "d", "e", "f"],
  X: ["b", "c", "e", "f", "g"],
  Y: ["b", "c", "d", "f", "g"],
  Z: ["a", "b", "d", "e", "g"],
};

export function layout(
  text: string,
  fontId: PixelFontId = "classic"
): { dots: Dot[]; width: number; height: number } {
  const fontMap = FONT_MAPS[fontId] ?? FONT_MAPS.classic;
  const chars = text.toUpperCase().split("");
  const dots: Dot[] = [];
  let cursor = 0;

  const sampleGlyph = fontMap["0"] ?? fontMap[" "];
  const fontHeight = sampleGlyph ? sampleGlyph.length : 5;

  for (const ch of chars) {
    const isColon = ch === ":" || ch === ";";
    
    // Безопасный поиск глифа
    let glyph = isColon ? fontMap[":"] : fontMap[ch];
    if (!glyph || glyph.length === 0) {
      glyph = fontMap[" "] ?? FALLBACK_GLYPH;
    }
    
    const glyphWidth = glyph[0]?.length ?? 3;
    const glyphHeight = glyph.length;

    const w = ch === "." ? 2 : glyphWidth;

    for (let y = 0; y < glyphHeight; y++) {
      for (let x = 0; x < w; x++) {
        const line = glyph[y] ?? "";
        const charAtPos = line[x] ?? " ";
        const inMask = charAtPos === "#";
        
        if (isColon && !inMask) continue;
        
        dots.push({
          x: cursor + x,
          y,
          on: isColon ? ch === ":" : inMask,
        });
      }
    }
    cursor += w + 1;
  }
  
  const maxX = dots.reduce((max, d) => Math.max(max, d.x), 0);
  return { dots, width: Math.max(maxX + 1, 1), height: fontHeight };
}
