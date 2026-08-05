import { useCallback, useEffect, useState } from "react";

export type ThemeName = "amber" | "phosphor" | "ice" | "magenta" | "paper";

export type ClockSettings = {
  theme: ThemeName;
  showSeconds: boolean;
  showDate: boolean;
  showGrid: boolean;
  glow: number; // 0-100
  scale: number; // dot size multiplier 40-160
  blinkColon: boolean;
  drift: boolean; // burn-in prevention
  scanlines: boolean;
  dim: boolean;
  dimStartHour: number;
  dimStartMinute: number;
  dimEndHour: number;
  dimEndMinute: number;
};

export const DEFAULT_SETTINGS: ClockSettings = {
  theme: "amber",
  showSeconds: true,
  showDate: true,
  showGrid: true,
  glow: 55,
  scale: 160,
  blinkColon: true,
  drift: true,
  scanlines: true,
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
