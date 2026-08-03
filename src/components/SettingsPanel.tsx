import { Monitor, RotateCcw, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ClockSettings, ThemeName } from "@/hooks/use-clock-settings";

const THEMES: { id: ThemeName; label: string; swatch: string }[] = [
  { id: "amber", label: "Amber CRT", swatch: "oklch(0.82 0.16 75)" },
  { id: "phosphor", label: "Phosphor", swatch: "oklch(0.85 0.2 145)" },
  { id: "ice", label: "Ice", swatch: "oklch(0.85 0.13 220)" },
  { id: "magenta", label: "Magenta", swatch: "oklch(0.78 0.2 340)" },
  { id: "paper", label: "Paper", swatch: "oklch(0.3 0.01 250)" },
];

type Props = {
  settings: ClockSettings;
  update: <K extends keyof ClockSettings>(k: K, v: ClockSettings[K]) => void;
  reset: () => void;
  onClose: () => void;
  onFullscreen: () => void;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <Label className="text-xs tracking-[0.18em] uppercase text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function SettingsPanel({ settings, update, reset, onClose, onFullscreen }: Props) {
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

      <Row label="Seconds">
        <Switch checked={settings.showSeconds} onCheckedChange={(v) => update("showSeconds", v)} />
      </Row>
      <Row label="Date">
        <Switch checked={settings.showDate} onCheckedChange={(v) => update("showDate", v)} />
      </Row>
      <Row label="Blink colon">
        <Switch checked={settings.blinkColon} onCheckedChange={(v) => update("blinkColon", v)} />
      </Row>
      <Row label="Dot grid">
        <Switch checked={settings.showGrid} onCheckedChange={(v) => update("showGrid", v)} />
      </Row>
      <Row label="Scanlines">
        <Switch checked={settings.scanlines} onCheckedChange={(v) => update("scanlines", v)} />
      </Row>
      <Row label="Anti burn-in">
        <Switch checked={settings.drift} onCheckedChange={(v) => update("drift", v)} />
      </Row>

      <div className="mt-4 space-y-5">
        {(
          [
            ["Size", "scale", 40, 160],
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
              step={1}
              value={[settings[key]]}
              onValueChange={([v]) => update(key, v!)}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onFullscreen}>
          <Monitor className="mr-2 size-4" /> Fullscreen
        </Button>
        <Button variant="outline" onClick={reset} aria-label="Reset settings">
          <RotateCcw className="size-4" />
        </Button>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        Press <kbd>S</kbd> to toggle this panel, <kbd>F</kbd> for fullscreen. Settings are saved on
        this device, so the kiosk restores them on reboot.
      </p>
    </aside>
  );
}
