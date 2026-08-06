import { layout, SEGMENT_MAP, type PixelFontId, type SegmentName } from "@/lib/pixel-font";

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

export function PixelMatrix({ text, font = "classic", size, showGrid, glow, className }: Props) {
  if (font === "segment") {
    const digitWidth = Math.max(12, Math.round(size * 2.8));
    const digitHeight = Math.max(20, Math.round(size * 5));
    const t = Math.max(2, Math.round(size * 0.55));
    const halfH = digitHeight / 2;
    const colonWidth = Math.max(6, Math.round(size * 1.5));
    const charGap = Math.max(3, Math.round(size * 0.7));

    const chars = text.toUpperCase().split("");

    // Calculate total width
    let totalW = 0;
    chars.forEach((ch, idx) => {
      const isColon = ch === ":" || ch === ";";
      totalW += (isColon ? colonWidth : digitWidth) + (idx < chars.length - 1 ? charGap : 0);
    });

    return (
      <div
        className={className}
        style={{
          position: "relative",
          width: totalW,
          height: digitHeight,
          display: "flex",
          alignItems: "center",
          gap: charGap,
        }}
        aria-hidden
      >
        {chars.map((ch, idx) => {
          const isColon = ch === ":" || ch === ";";
          const isBlinkOff = ch === ";";

          if (isColon) {
            return (
              <div
                key={idx}
                style={{
                  position: "relative",
                  width: colonWidth,
                  height: digitHeight,
                  flexShrink: 0,
                }}
              >
                {[0.3, 0.7].map((ratio, dotIdx) => {
                  const on = !isBlinkOff;
                  if (!on && !showGrid) return null;
                  return (
                    <span
                      key={dotIdx}
                      style={{
                        position: "absolute",
                        top: Math.round(digitHeight * ratio - t / 2),
                        left: Math.round(colonWidth / 2 - t / 2),
                        width: t,
                        height: t,
                        borderRadius: "50%",
                        backgroundImage: on
                          ? "linear-gradient(var(--dot-on), var(--dot-on))"
                          : "linear-gradient(var(--dot-off), var(--dot-off))",
                        boxShadow: on && glow > 0 ? `0 0 ${t * (glow / 35)}px var(--dot-glow)` : undefined,
                        transition: "background 220ms linear",
                      }}
                    />
                  );
                })}
              </div>
            );
          }

          const activeSegs = SEGMENT_MAP[ch] ?? [];

          return (
            <div
              key={idx}
              style={{
                position: "relative",
                width: digitWidth,
                height: digitHeight,
                flexShrink: 0,
              }}
            >
              {ALL_SEGMENTS.map((seg) => {
                const on = activeSegs.includes(seg);
                if (!on && !showGrid) return null;

                let style: React.CSSProperties = {
                  position: "absolute",
                  borderRadius: Math.max(1, Math.round(t * 0.35)),
                  backgroundImage: on
                    ? "linear-gradient(var(--dot-on), var(--dot-on))"
                    : "linear-gradient(var(--dot-off), var(--dot-off))",
                  boxShadow: on && glow > 0 ? `0 0 ${t * (glow / 35)}px var(--dot-glow)` : undefined,
                  transition: "background 220ms linear",
                };

                const inset = Math.round(t * 0.55);

                switch (seg) {
                  case "a": // top horizontal
                    style = {
                      ...style,
                      top: 0,
                      left: inset,
                      width: digitWidth - inset * 2,
                      height: t,
                    };
                    break;
                  case "f": // top left vertical
                    style = {
                      ...style,
                      top: inset,
                      left: 0,
                      width: t,
                      height: halfH - inset * 1.1,
                    };
                    break;
                  case "b": // top right vertical
                    style = {
                      ...style,
                      top: inset,
                      right: 0,
                      width: t,
                      height: halfH - inset * 1.1,
                    };
                    break;
                  case "g": // middle horizontal
                    style = {
                      ...style,
                      top: Math.round(halfH - t / 2),
                      left: inset,
                      width: digitWidth - inset * 2,
                      height: t,
                    };
                    break;
                  case "e": // bottom left vertical
                    style = {
                      ...style,
                      bottom: inset,
                      left: 0,
                      width: t,
                      height: halfH - inset * 1.1,
                    };
                    break;
                  case "c": // bottom right vertical
                    style = {
                      ...style,
                      bottom: inset,
                      right: 0,
                      width: t,
                      height: halfH - inset * 1.1,
                    };
                    break;
                  case "d": // bottom horizontal
                    style = {
                      ...style,
                      bottom: 0,
                      left: inset,
                      width: digitWidth - inset * 2,
                      height: t,
                    };
                    break;
                }

                return <span key={seg} style={style} />;
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // STANDARD DOT MATRIX RENDERER (Classic, Tall, Chonky, Arcade)
  const { dots, width, height } = layout(text, font);
  const gap = Math.max(1, Math.round(size * 0.18));
  const pitch = size + gap;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: width * pitch - gap,
        height: height * pitch - gap,
      }}
      aria-hidden
    >
      {dots.map((d) =>
        !d.on && !showGrid ? null : (
          <span
            key={`${d.x}-${d.y}`}
            style={{
              position: "absolute",
              left: d.x * pitch,
              top: d.y * pitch,
              width: size,
              height: size,
              borderRadius: Math.max(1, size * 0.22),
              backgroundImage: d.on
                ? "linear-gradient(var(--dot-on), var(--dot-on))"
                : "linear-gradient(var(--dot-off), var(--dot-off))",
              boxShadow: d.on && glow > 0 ? `0 0 ${size * (glow / 45)}px var(--dot-glow)` : undefined,
              transition: "background 220ms linear",
            }}
          />
        ),
      )}
    </div>
  );
}
