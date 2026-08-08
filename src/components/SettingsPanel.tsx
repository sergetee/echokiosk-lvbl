import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClockSettings, ThemeName } from "@/hooks/use-clock-settings";
import { PIXEL_FONTS } from "@/lib/pixel-font";

const pad2 = (n: number) => n.toString().padStart(2, "0");

function Stepper({
  value,
  onChange,
  step,
  min = 0,
  max,
  cyclic = false,
  horizontal = false,
}: {
  value: number;
  onChange: (v: number) => void;
  step: number;
  min?: number;
  max: number;
  cyclic?: boolean;
  horizontal?: boolean;
}) {
  const change = (delta: number) => {
    const next = value + delta;
    onChange(
      cyclic
        ? ((next % max) + max) % max
        : Math.min(max, Math.max(min, next)),
    );
  };
  const decreaseDisabled = !cyclic && value <= min;
  const increaseDisabled = !cyclic && value >= max;
  const buttonClassName =
    "flex size-11 touch-manipulation items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40";

  if (horizontal) {
    return (
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => change(-step)}
          aria-label="Decrease"
          disabled={decreaseDisabled}
          className={buttonClassName}
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="font-mono text-lg tabular-nums">{pad2(value)}</span>
        <button
          onClick={() => change(step)}
          aria-label="Increase"
          disabled={increaseDisabled}
          className={buttonClassName}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => change(step)}
        aria-label="Increase"
        className={buttonClassName}
      >
        <ChevronUp className="size-5" />
      </button>
      <span className="font-mono text-lg tabular-nums">{pad2(value)}</span>
      <button
        onClick={() => change(-step)}
        aria-label="Decrease"
        className={buttonClassName}
      >
        <ChevronDown className="size-5" />
      </button>
    </div>
  );
}

function TimeStepper({
  label,
  hour,
  minute,
  onHour,
  onMinute,
  align,
}: {
  label: string;
  hour: number;
  minute: number;
  onHour: (v: number) => void;
  onMinute: (v: number) => void;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex w-fit flex-col items-center p-3 text-center ${
        align === "right" ? "justify-self-end" : "justify-self-start"
      }`}
    >
      <p className="mb-2 text-xs tracking-[0.18em] uppercase text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <Stepper value={hour} onChange={onHour} step={1} max={24} cyclic />
        <span className="text-lg">:</span>
        <Stepper value={minute} onChange={onMinute} step={10} max={60} cyclic />
      </div>
    </div>
  );
}

const THEMES: { id: ThemeName; label: string; swatch: string }[] = [
  { id: "amber", label: "Amber", swatch: "oklch(0.82 0.16 75)" },
  { id: "phosphor", label: "Phosphor", swatch: "oklch(0.85 0.2 145)" },
  { id: "ice", label: "Ice", swatch: "oklch(0.85 0.13 220)" },
  { id: "magenta", label: "Magenta", swatch: "oklch(0.78 0.2 340)" },
  { id: "paper", label: "Mono", swatch: "oklch(0.98 0 0)" },
];

const TOGGLES: { key: keyof ClockSettings; label: string }[] = [
  { key: "showSeconds", label: "Seconds" },
  { key: "showDate", label: "Date" },
  { key: "blinkColon", label: "Blink colon" },
  { key: "showGrid", label: "Dot grid" },
  { key: "scanlines", label: "Scanlines" }
];

type Props = {
  open: boolean;
  settings: ClockSettings;
  update: <K extends keyof ClockSettings>(k: K, v: ClockSettings[K]) => void;
  onClose: () => void;
};

export function SettingsPanel({ open, settings, update, onClose }: Props) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      let innerFrame: number;
      const frame = requestAnimationFrame(() => {
        innerFrame = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(frame);
        cancelAnimationFrame(innerFrame);
      };
    }
    setVisible(false);
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
        onPointerDown={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      <aside
        className={`kiosk-panel fixed top-0 right-0 z-50 flex h-full w-[min(22rem,100vw)] flex-col gap-1 overflow-y-auto p-6 ${
          visible ? "kiosk-panel-visible" : ""
        }`}
        onTransitionEnd={(e) => {
          if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
          if (!visible && !open) setMounted(false);
        }}
      >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-[0.22em] uppercase">SETTINGS</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings">
          <X className="size-4" />
        </Button>
      </div>

      <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground">COLOR</p>
      <div className="mt-2 mb-4 grid grid-cols-5 gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => update("theme", t.id)}
            aria-label={t.label}
            title={t.label}
            className={`aspect-square rounded-md border transition-transform hover:scale-105 ${
              settings.theme === t.id
                ? "border-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "border-border"
            }`}
            style={{ backgroundImage: `linear-gradient(${t.swatch}, ${t.swatch})` }}
          />
        ))}
      </div>

      {/* ---------- FONT SWITCHER ---------- */}   
      <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground">FONT</p>
      <div className="mt-2 mb-4 grid grid-cols-2 gap-2">
        {PIXEL_FONTS.map((f) => (
          <button
            key={f.id}
            onClick={() => update("font", f.id)}
            aria-pressed={settings.font === f.id}
            className={`rounded-md border px-3 py-2.5 text-xs transition-colors ${
              settings.font === f.id
                ? "border-primary bg-primary text-primary-foreground font-semibold"
                : "border-border bg-secondary/40 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <span className="font-semibold tracking-[0.12em] uppercase">{f.name}</span>
          </button>
        ))}
      </div>

      {/* ---------- SCALE & GLOW ---------- */}   
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className="mb-2 text-xs tracking-[0.18em] uppercase text-muted-foreground">Size</p>
          <Stepper
            value={settings.scale}
            onChange={(v) => update("scale", v)}
            step={1}
            min={15}
            max={30}
            horizontal
          />
        </div>
        <div className="text-center">
          <p className="mb-2 text-xs tracking-[0.18em] uppercase text-muted-foreground">Glow</p>
          <Stepper
            value={settings.glow}
            onChange={(v) => update("glow", v)}
            step={5}
            max={100}
            horizontal
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {TOGGLES.map(({ key, label }) => {
          const active = settings[key] as boolean;
          return (
            <button
              key={key}
              onClick={() => update(key, !active as ClockSettings[typeof key])}
              aria-pressed={active}
              className={`rounded-md border px-3 py-3 text-xs tracking-[0.14em] uppercase transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary/40 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-md border border-border p-3">
        <div className="mb-2">
          <button
            onClick={() => update("dim", !settings.dim)}
            aria-pressed={settings.dim}
            className={`w-full rounded-md border px-3 py-3 text-xs tracking-[0.14em] uppercase transition-colors ${
              settings.dim
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary/40 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            DIM
          </button>
        </div>
        <div className={settings.dim ? "" : "pointer-events-none opacity-40"}>
          <div className="grid grid-cols-2 gap-3">
            <TimeStepper
              label="FROM"
              hour={settings.dimStartHour}
              minute={settings.dimStartMinute}
              onHour={(v) => update("dimStartHour", v)}
              onMinute={(v) => update("dimStartMinute", v)}
              align="left"
            />
            <TimeStepper
              label="TILL"
              hour={settings.dimEndHour}
              minute={settings.dimEndMinute}
              onHour={(v) => update("dimEndHour", v)}
              onMinute={(v) => update("dimEndMinute", v)}
              align="right"
            />
          </div>
        </div>
      </div>
      
      </aside>
    </>
  );
}
