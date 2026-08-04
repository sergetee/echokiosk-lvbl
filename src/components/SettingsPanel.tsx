import { RotateCcw, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { ClockSettings, ThemeName } from "@/hooks/use-clock-settings";

const THEMES: { id: ThemeName; label: string; swatch: string }[] = [
  { id: "amber", label: "Amber CRT", swatch: "oklch(0.82 0.16 75)" },
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
  { key: "scanlines", label: "Scanlines" },
  { key: "drift", label: "Anti burn-in" },
];

type Props = {
  settings: ClockSettings;
  update: <K extends keyof ClockSettings>(k: K, v: ClockSettings[K]) => void;
  reset: () => void;
  onClose: () => void;
};

export function SettingsPanel({ settings, update, reset, onClose }: Props) {
  return (
    <aside className="kiosk-panel fixed top-0 right-0 z-50 flex h-full w-[min(22rem,100vw)] flex-col gap-1 overflow-y-auto p-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-[0.22em] uppercase">Kiosk setup</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings">
          <X className="size-4" />
        </Button>
      </div>

      <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Palette</p>
      <div className="mt-2 mb-4 grid grid-cols-5 gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => update("theme", t.id)}
            aria-label={t.label}
            title={t.label}
            className={`aspect-square rounded-md border transition-transform hover:scale-105 ${
              settings.theme === t.id ? "border-foreground" : "border-border"
            }`}
            style={{ background: t.swatch }}
          />
        ))}
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


      <div className="mt-6 space-y-5">
        {(
          [
            ["Size", "scale", 160, 320],
            ["Glow", "glow", 0, 100],
          ] as const
        ).map(([label, key, min, max]) => (
          <div key={key}>
            <div className="mb-2 flex justify-between text-xs tracking-[0.18em] uppercase text-muted-foreground">
              <span>{label}</span>
              <span>{settings[key]}</span>
            </div>
            <Slider
              min={min}
              max={max}
              step={5}
              value={[settings[key]]}
              onValueChange={([v]) => update(key, v!)}
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button variant="outline" className="w-full" onClick={reset}>
          <RotateCcw className="mr-2 size-4" /> Reset
        </Button>
      </div>
    </aside>
  );
}
