import React, { useMemo } from "react";
import { FONT_MAPS, type PixelFontId } from "@/lib/pixel-font";
import { SegmentMatrix } from "./Segmented";
import { PixelChar } from "./PixelChar";
import "./dot-matrix.css";

export type MatrixSettings = {
  dotSize: number;
  dotRoundness: number;
  dotGapRatio: number;
  showGrid: boolean;
  phosphorDecay: boolean;
  glow: number;
};

export const DEFAULT_MATRIX_SETTINGS: MatrixSettings = {
  dotSize: 20,
  dotRoundness: 0,
  dotGapRatio: 0.1,
  showGrid: true,
  phosphorDecay: true,
  glow: 0,
};

export type PixelGroupItem = {
  id: string;
  text: string;
  className?: string;
};

type PixelMatrixProps = {
  items: PixelGroupItem[] | string;
  font?: PixelFontId;
  isColonVisible?: boolean;
  //settings?: Partial<MatrixSettings>;
  className?: string;
};

function PixelMatrix({
  items,
  font = "classic",
  isColonVisible = true,
  settings,
  className = "",
}: PixelMatrixProps) {
  const config = { ...DEFAULT_MATRIX_SETTINGS, ...settings };
  const { dotSize, dotRoundness, dotGapRatio, showGrid, phosphorDecay, glow } = config;

  const fontMap = FONT_MAPS[font] ?? FONT_MAPS.classic;
  const baseCols = fontMap["0"]?.[0]?.length ?? 5;

  const combinedStyle = {
    //"--dot": `${dotSize}px`,
    //"--dot-roundness": `${dotRoundness}`,
    //"--dot-gap-ratio": `${dotGapRatio}`,
    //"--glow": glowPx,
    "--cols": baseCols,
  } as React.CSSProperties;

  const normalizedGroups: PixelGroupItem[] = useMemo(() => {
    if (typeof items === "string") {
      return [{ id: "default", text: items }];
    }
    return items;
  }, [items]);

  return (
    <div
      className={`pixel-matrix ${className}`.trim()}
      //data-show-grid={showGrid}
      //data-phosphor-decay={phosphorDecay}
      style={combinedStyle}
      aria-hidden
    >
      {font === "segment" ? (
        <SegmentMatrix groups={normalizedGroups} isColonVisible={isColonVisible} />
      ) : (
        normalizedGroups.map((group) => (
          <div key={group.id} className={`pixel-group ${group.className ?? ""}`.trim()}>
            {group.text.split("").map((char, charIdx) => (
              <PixelChar
                key={`${font}-${charIdx}`}
                char={char}
                fontMap={fontMap}
                isColonVisible={isColonVisible}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export const MemoizedPixelMatrix = React.memo(PixelMatrix);
export { MemoizedPixelMatrix as PixelMatrix };