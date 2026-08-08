import React from "react";
import { FONT_MAPS, SEGMENT_MAP, type PixelFontId, type SegmentName } from "@/lib/pixel-font";
import "./сss/pixel-matrix.css";

type Props = {
  text: string;
  font?: PixelFontId;
  /** dot size in px */
  size: number;
  showGrid: boolean;
  glow: number;
  className?: string;
};

const ALL_SEGMENTS: SegmentName[] = ["a", "b", "c", "d", "e", "f", "g"];

function getCharMatrix(char: string, fontMap: Record<string, string[]>): boolean[][] {
  const upperChar = char.toUpperCase();
  const glyph = fontMap[upperChar] ?? fontMap[" "] ?? [];
  return glyph.map((line) => line.split("").map((c) => c === "#"));
}

export function PixelMatrix({
  text,
  font = "classic",
  size,
  showGrid,
  glow,
  className = "",
}: Props) {
  const glowPx = glow > 0 ? `${size * (glow / 35)}px` : "0px";

  const rootStyle = {
    "--pixel-size": `${size}px`,
    "--glow-amount": glowPx,
  } as React.CSSProperties;

  // 1. Отрисовка векторного 7-сегментного индикатора
  if (font === "segment") {
    const chars = text.toUpperCase().split("");

    return (
      <div
        className={`pixel-matrix ${className}`.trim()}
        data-show-grid={showGrid}
        style={rootStyle}
        aria-hidden
      >
        {chars.map((ch, idx) => {
          const isColon = ch === ":" || ch === ";";
          const isBlinkOff = ch === ";";

          if (isColon) {
            return (
              <div key={idx} className="segment-colon">
                <span className="segment-colon-dot" data-on={!isBlinkOff} />
                <span className="segment-colon-dot" data-on={!isBlinkOff} />
              </div>
            );
          }

          const activeSegs = SEGMENT_MAP[ch] ?? [];

          return (
            <div key={idx} className="segment-digit">
              {ALL_SEGMENTS.map((seg) => (
                <span
                  key={seg}
                  className={`segment-bar seg-${seg}`}
                  data-on={activeSegs.includes(seg)}
                />
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  // 2. Отрисовка точечной матрицы для всех текстовых шрифтов
  const fontMap = FONT_MAPS[font] ?? FONT_MAPS.classic;
  const chars = text.split("");

  return (
    <div
      className={`pixel-matrix ${className}`.trim()}
      data-show-grid={showGrid}
      style={rootStyle}
      aria-hidden
    >
      {chars.map((char, charIdx) => {
        const matrix = getCharMatrix(char, fontMap);

        return (
          <div key={`${char}-${charIdx}`} className="pixel-char">
            {matrix.map((row, y) => (
              <div key={y} className="pixel-row">
                {row.map((isOn, x) => (
                  <span key={x} className="pixel-dot" data-on={isOn} />
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
