import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { PixelMatrix } from "@/components/PixelMatrix";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useClockSettings, type ClockSettings } from "@/hooks/use-clock-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pixel Clock Kiosk — Fullscreen Screensaver Clock" },
      {
        name: "description",
        content:
          "A fullscreen kiosk screensaver with a configurable pixel-matrix clock: palettes, glow, seconds, date and burn-in protection.",
      },
      { property: "og:title", content: "Pixel Clock Kiosk" },
      {
        property: "og:description",
        content: "Configurable pixel-matrix clock built for always-on kiosk and screensaver displays.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Kiosk,
});

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",];
const FAB_HIDE_MS = 4000;
const pad = (n: number) => n.toString().padStart(2, "0");

function formatClockData(now: Date = new Date(), blinkColon: boolean, showSeconds: boolean) {
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  // Colon is always visible if blinking is off (!blinkColon) OR on even seconds
  const isColonVisible = !blinkColon || s % 2 === 0;
  
  let timeText = `${pad(h)}:${pad(m)}`;
  if (showSeconds) { timeText += `:${pad(s)}`; }
  const dateText = `${DAYS[now.getDay()]} ${pad(now.getDate())} ${MONTHS[now.getMonth()]}`;
  return { timeText, dateText, isColonVisible };
}

function calculateIsDimmed(now: Date, settings: ClockSettings): boolean {
  if (!settings.dim) return false;

  const mins = now.getHours() * 60 + now.getMinutes();
  const start = settings.dimStartHour * 60 + settings.dimStartMinute;
  const end = settings.dimEndHour * 60 + settings.dimEndMinute;

  if (start === end) return false;
  return start < end ? mins >= start && mins < end : mins >= start || mins < end;
}

function Kiosk() {
  const { settings, update, loaded } = useClockSettings();
  const [now, setNow] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);

  const hideFabRef = useRef<number | null>(null);

  // Обновление текущего времени
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 500);
    return () => window.clearInterval(id);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  const clearFabTimer = useCallback(() => {
    if (hideFabRef.current !== null) {
      window.clearTimeout(hideFabRef.current);
      hideFabRef.current = null;
    }
  }, []);

  const revealFab = useCallback(() => {
    setShowFab(true);
    clearFabTimer();
    hideFabRef.current = window.setTimeout(() => {
      setShowFab(false);
    }, FAB_HIDE_MS);
  }, [clearFabTimer]);

  // Сброс таймера при открытой панели настроек
  useEffect(() => {
    if (open) {
      clearFabTimer();
    } else if (showFab) {
      revealFab();
    }
  }, [open, showFab, revealFab, clearFabTimer]);

  useEffect(() => () => clearFabTimer(), [clearFabTimer]);

  // Горячие клавиши
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "s") setOpen((prev) => !prev);
      if (key === "f") toggleFullscreen();
      if (key === "escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleFullscreen]);

  const handleScreenPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".kiosk-panel, .kiosk-fab")) return;
    revealFab();
  };

  // Вычисляемые данные
  const themeClass = settings.theme === "amber" ? "" : `kiosk-${settings.theme}`;

  //const { timeText, dateText } = now
  //  ? formatClockData(now, settings.blinkColon, settings.showSeconds)
  //  : { timeText: "", dateText: "" };

  const { timeText, dateText, isColonVisible } = formatClockData(
    now, 
    settings.blinkColon, 
    settings.showSeconds
  );
  
  const dimmed = now ? calculateIsDimmed(now, settings) : false;

  return (
    <main
      className={`kiosk relative min-h-screen overflow-hidden select-none ${themeClass} ${settings.scanlines ? "kiosk-scanlines" : ""}`}
      onPointerDown={handleScreenPointerDown}
    >
      <div
        className={`flex min-h-screen flex-col items-center justify-center gap-[12vh] ${dimmed ? "dimmed" : ""}`}
        style={{ transition: "opacity 1200ms linear" }}
      >
        {loaded && now && (
          <>
            <PixelMatrix
              className="clock"
              text={timeText}
              font={settings.font}
              dotSize={settings.scale}
              dotRoundness={settings.dotRoundness}
              dotGap={settings.dotGap}
              showGrid={settings.showGrid}
              glow={settings.glow}
              isColonVisible={isColonVisible}
            />
            
            {settings.showDate && (
              <PixelMatrix
                className="date"
                text={dateText}
                font={settings.font}
                dotSize={settings.scale}
                dotRoundness={settings.dotRoundness}
                dotGap={settings.dotGap}
                showGrid={settings.showGrid}
                glow={settings.glow * 0.6}
              />
            )}
          </>
        )}
      </div>

      <div className="kiosk-vignette" />

      <button
        onClick={() => setOpen(true)}
        aria-label="Open kiosk settings"
        aria-hidden={!showFab || open}
        tabIndex={showFab && !open ? 0 : -1}
        className={`kiosk-fab fixed bottom-6 left-6 z-40 rounded-full p-3 transition-opacity duration-300 ${
          showFab && !open
            ? "pointer-events-auto opacity-70 hover:opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <Settings className="size-5" />
      </button>

      <SettingsPanel
        open={open}
        settings={settings}
        update={update}
        onClose={() => setOpen(false)}
      />
    </main>
  );
}
