import React from "react";
import { SEGMENT_MAP, type SegmentName } from "@/lib/pixel-font";
import type { PixelGroupItem } from "./PixelMatrix";

type SegmentMatrixProps = {
  groups: PixelGroupItem[];
  isColonVisible?: boolean;
};

const ALL_SEGMENTS: SegmentName[] = ["a", "b", "c", "d", "e", "f", "g"];

export const SegmentMatrix: React.FC<SegmentMatrixProps> = ({
  groups,
  isColonVisible = true,
}) => {
  return (
    <>
      {groups.map((group) => (
        <div key={group.id} className={`pixel-group ${group.className ?? ""}`.trim()}>
          {group.text
            .toUpperCase()
            .split("")
            .map((ch, idx) => {
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
      ))}
    </>
  );
};