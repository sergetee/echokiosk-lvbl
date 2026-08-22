import { useCallback, useEffect, useState } from "react";
import type { PixelFontId } from "@/lib/pixel-font";

export type ThemeName = "amber" | "phosphor" | "ice" | "magenta" | "paper";

export type ClockSettings = {
  theme: ThemeName;
  font: PixelFontId;
  showSeconds: boolean;
  showDate: boolean;
  showGrid: boolean;
  dotSize: number;
  dotRoundness: number;
  dotGapRatio: number;
  glow: number;
  blinkColon: boolean;
  scanlines: boolean;
  phosphorDecay: boolean;
  dim: boolean;
  dimStartHour: number;
  dimStartMinute: number;
  dimEndHour: number;
  dimEndMinute: number;
};

export const DEFAULT_SETTINGS: ClockSettings = {
  theme: "amber",
  font: "classic",
  showSeconds: false,
  showDate: true,
  showGrid: true,
  dotSize: 20,
  dotRoundness: 10,
  dotGapRatio: 0.2,
  glow: 55,
  blinkColon: true,
  scanlines: true,
  phosphorDecay: false,
  dim: false,
  dimStartHour: 22,
  dimStartMinute: 0,
  dimEndHour: 7,
  dimEndMinute: 0,
};

const KEY = "pixel-kiosk-settings-v2";

export function useClockSettings() {
  const [settings, setSettings] = useState<ClockSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings, loaded]);

  const update = useCallback(
    <K extends keyof ClockSettings>(key: K, value: ClockSettings[K]) =>
      setSettings((s) => ({ ...s, [key]: value })),
    [],
  );

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  return { settings, update, reset, loaded };
}
