import { layout } from "@/lib/pixel-font";

type Props = {
  text: string;
  /** dot size in px */
  size: number;
  showGrid: boolean;
  glow: number;
  className?: string;
};

export function PixelMatrix({ text, size, showGrid, glow, className }: Props) {
  const { dots, width, height } = layout(text);
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
              // A gradient (not background-color) survives Android WebView's
              // force-dark inversion, which would otherwise grey out light dots.
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
