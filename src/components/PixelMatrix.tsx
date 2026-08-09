import React from "react";
import { FONT_MAPS, SEGMENT_MAP, type PixelFontId, type SegmentName } from "@/lib/pixel-font";
import "./pixel-matrix.css";

type Props = {
  text: string;
  font?: PixelFontId;
  dotSize: number;
  dotRoundness: number;
  dotGap: number;
  showGrid: boolean;
  glow: number;
  isColonVisible?: boolean;
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
  dotSize,
  dotRoundness,
  dotGap,
  showGrid,
  glow,
  isColonVisible = true,
  className = "",
}: Props) {
  const glowPx = glow > 0 ? `${dotSize * (glow / 35)}px` : "0";

  const rootStyle = {
    "--dot": `${dotSize}px`,
    "--dot-roundness": `${dotRoundness}`,
    "--dot-gap-ratio": `${dotGap}`,
    "--glow": glowPx,
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
          if (ch === ":") {
            return (
              <div key={idx} className="segment-colon">
                <span className="segment-colon-dot" data-on={isColonVisible} />
                <span className="segment-colon-dot" data-on={isColonVisible} />
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
  const baseCols = fontMap["0"]?.[0]?.length ?? 5;
  const combinedStyle = {
    ...rootStyle,
    "--cols": baseCols,
  } as React.CSSProperties;

  return (
    <div
      className={`pixel-matrix ${className}`.trim()}
      data-show-grid={showGrid}
      style={combinedStyle}
      aria-hidden
    >

    {chars.map((char, charIdx) => {
      const matrix = getCharMatrix(char, fontMap);
      const isColon = char === ":";
      const isSpace = char === " ";

      return (
        <div key={`${font}-${char}-${charIdx}`} className="pixel-char">
          {matrix.map((row, y) => (
            <div key={y} className="pixel-row">
              {row.map((isOn, x) => {
                let dataOn: string | undefined;

                if (isSpace) {
                  dataOn = undefined;
                } else if (isColon) {
                  // - Empty matrix cells (!isOn) are always transparent (undefined)
                  // - Colon dots (isOn) switch between "true" и "false"
                  dataOn = !isOn ? undefined : isColonVisible ? "true" : "false";
                } else {
                  dataOn = isOn ? "true" : "false";
                }
              
                return <span key={x} className="pixel-dot" data-on={dataOn} />;
              })}
            </div>
          ))}
        </div>
      );
    })}
      
    </div>
  );
  
}
