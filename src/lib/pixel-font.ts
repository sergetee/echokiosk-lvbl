// 3x5 pixel glyphs. Each glyph is 5 rows of 3 chars ("#" = on).
export const GLYPH_W = 3;
export const GLYPH_H = 5;

const G = (...rows: string[]) => rows;

export const PIXEL_FONT: Record<string, string[]> = {
  "0": G("###", "# #", "# #", "# #", "###"),
  "1": G(" # ", "## ", " # ", " # ", "###"),
  "2": G("###", "  #", "###", "#  ", "###"),
  "3": G("###", "  #", "###", "  #", "###"),
  "4": G("# #", "# #", "###", "  #", "  #"),
  "5": G("###", "#  ", "###", "  #", "###"),
  "6": G("###", "#  ", "###", "# #", "###"),
  "7": G("###", "  #", "  #", "  #", "  #"),
  "8": G("###", "# #", "###", "# #", "###"),
  "9": G("###", "# #", "###", "  #", "###"),
  ":": G("   ", " # ", "   ", " # ", "   "),
  // Blank colon: same 2-column footprint as ":" so blinking never shifts layout.
  ";": G("   ", "   ", "   ", "   ", "   "),

  ".": G("   ", "   ", "   ", "   ", " # "),
  "-": G("   ", "   ", "###", "   ", "   "),
  "/": G("  #", "  #", " # ", "#  ", "#  "),
  " ": G("   ", "   ", "   ", "   ", "   "),
  A: G("###", "# #", "###", "# #", "# #"),
  B: G("## ", "# #", "## ", "# #", "## "),
  C: G("###", "#  ", "#  ", "#  ", "###"),
  D: G("## ", "# #", "# #", "# #", "## "),
  E: G("###", "#  ", "## ", "#  ", "###"),
  F: G("###", "#  ", "## ", "#  ", "#  "),
  G: G("###", "#  ", "# #", "# #", "###"),
  H: G("# #", "# #", "###", "# #", "# #"),
  I: G("###", " # ", " # ", " # ", "###"),
  J: G("  #", "  #", "  #", "# #", "###"),
  K: G("# #", "# #", "## ", "# #", "# #"),
  L: G("#  ", "#  ", "#  ", "#  ", "###"),
  M: G("# #", "###", "###", "# #", "# #"),
  N: G("## ", "# #", "# #", "# #", "# #"),
  O: G("###", "# #", "# #", "# #", "###"),
  P: G("###", "# #", "###", "#  ", "#  "),
  Q: G("###", "# #", "###", "  #", "  #"),
  R: G("###", "# #", "## ", "# #", "# #"),
  S: G("###", "#  ", "###", "  #", "###"),
  T: G("###", " # ", " # ", " # ", " # "),
  U: G("# #", "# #", "# #", "# #", "###"),
  V: G("# #", "# #", "# #", "# #", " # "),
  W: G("# #", "# #", "###", "###", "# #"),
  X: G("# #", "# #", " # ", "# #", "# #"),
  Y: G("# #", "# #", "###", " # ", " # "),
  Z: G("###", "  #", " # ", "#  ", "###"),
};

export type Dot = { x: number; y: number; on: boolean };

/** Lay a string out into a dot matrix, 1 empty column between glyphs. */
export function layout(text: string): { dots: Dot[]; width: number; height: number } {
  const chars = text.toUpperCase().split("");
  const dots: Dot[] = [];
  let cursor = 0;
  for (const ch of chars) {
    const glyph = PIXEL_FONT[ch] ?? PIXEL_FONT[" "]!;
    const w = ch === ":" || ch === "." ? 2 : GLYPH_W;
    for (let y = 0; y < GLYPH_H; y++) {
      for (let x = 0; x < w; x++) {
        dots.push({ x: cursor + x, y, on: glyph[y]![x] === "#" });
      }
    }
    cursor += w + 1;
  }
  return { dots, width: Math.max(cursor - 1, 1), height: GLYPH_H };
}
