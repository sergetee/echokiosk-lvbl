import React from "react";

type PixelCharProps = {
  char: string;
  fontMap: Record<string, string[]>;
  isColonVisible?: boolean;
};

function getCharMatrix(char: string, fontMap: Record<string, string[]>): boolean[][] {
  const upperChar = char.toUpperCase();
  const glyph = fontMap[upperChar] ?? fontMap[" "] ?? [];
  return glyph.map((line) => line.split("").map((c) => c === "#"));
}

export const PixelChar: React.FC<PixelCharProps> = ({
  char,
  fontMap,
  isColonVisible = true,
}) => {
  const matrix = getCharMatrix(char, fontMap);
  const charWidth = matrix[0]?.length;
  const isColon = char === ":";
  const isSpace = char === " ";

  return (
    <div
      className="pixel-char"
      style={charWidth ? ({ "--cols": charWidth } as React.CSSProperties) : undefined}
    >
      {matrix.flat().map((isOn, index) => {
        let dataOn: string | undefined;

        if (isSpace) {
          dataOn = undefined;
        } else if (isColon) {
          dataOn = !isOn ? undefined : isColonVisible ? "true" : "false";
        } else {
          dataOn = isOn ? "true" : "false";
        }

        return <span key={index} className="pixel-dot" data-on={dataOn} />;
      })}
    </div>
  );
};