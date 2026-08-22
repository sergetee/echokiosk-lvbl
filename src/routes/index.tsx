import { createFileRoute } from "@tanstack/react-router";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Settings, X } from "lucide-react";
import { PixelMatrix, type PixelGroupItem } from "@/components/PixelMatrix";
const SettingsPanel = React.lazy(() => import("@/components/SettingsPanel").then((m) => ({ default: m.SettingsPanel })));
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
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const FAB_HIDE_MS = 4000;
const pad = (n: number) => n.toString().padStart(2, "0");

function formatClockData(now: Date = new Date(), blinkColon: boolean, showSeconds: boolean) {
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  const isColonVisible = !blinkColon || s % 2 === 0;

  // Формируем группы для часов
  const timeItems: PixelGroupItem[] = [
    { id: "h", text: pad(h), className: "hours" },
    { id: "c1", text: ":", className: "colon" },
    { id: "m", text: pad(m), className: "minutes" },
  ];

  if (showSeconds) {
    timeItems.push(
      { id: "c2", text: ":", className: "colon colon-seconds" },
      { id: "s", text: pad(s), className: "seconds" }
    );
  }

  // Формируем группы для даты
  const dateItems: PixelGroupItem[] = [
    { id: "dn", text: DAYS[now.getDay()], className: "day-name" },
    { id: "d", text: pad(now.getDate()), className: "day-number" },
    { id: "m", text: MONTHS[now.getMonth()], className: "month" },
  ];

  return { timeItems, dateItems, isColonVisible };
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
  const [now, setNow] = useState<Date>(() => new Date());
  const [open, setOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);

  const hideFabRef = useRef<number | null>(null);

  useEffect(() => {
    setNow(new Date());
    const tick = () => setNow(new Date());
    const nowMs = new Date().getMilliseconds();
    const timeoutId = window.setTimeout(() => {
      tick();
      const id = window.setInterval(tick, 1000);
      (window as any).__echokiosk_clockInterval = id;
    }, 1000 - nowMs);

    return () => {
      window.clearTimeout(timeoutId);
      const id = (window as any).__echokiosk_clockInterval;
      if (id) window.clearInterval(id);
    };
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

  useEffect(() => {
    if (open) {
      clearFabTimer();
    } else if (showFab) {
      revealFab();
    }
  }, [open, showFab, revealFab, clearFabTimer]);

  useEffect(() => () => clearFabTimer(), [clearFabTimer]);

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

  const themeClass = settings.theme === "amber" ? "" : `kiosk-${settings.theme}`;

  const { timeItems, dateItems, isColonVisible } = formatClockData(
    now, 
    settings.blinkColon, 
    settings.showSeconds
  );
  
  const dimmed = now ? calculateIsDimmed(now, settings) : false;

  const glowPx = settings.glow > 0 
    ? `${settings.dotSize * (settings.glow / 35)}px` 
    : "0";
  
  const clockfaceStyle = {
    "--dot": `${settings.dotSize}px`,
    "--dot-roundness": `${settings.dotRoundness}`,
    "--dot-gap-ratio": `${settings.dotGapRatio}`,
    "--glow": settings.glow > 0 ? `${settings.dotSize * (settings.glow / 35)}px` : "0",
    transition: "opacity 1200ms linear",
} as React.CSSProperties;

  return (
    <main
      className={`kiosk relative min-h-screen overflow-hidden select-none ${themeClass}`}
      onPointerDown={handleScreenPointerDown}
    >
      <div
        className={`clockface gap-[12vh] ${dimmed ? "dimmed" : ""} ${
          settings.scanlines ? "kiosk-scanlines" : ""
        }`}
        data-show-grid={settings.showGrid}
        data-phosphor-decay={settings.phosphorDecay}
        style={clockfaceStyle}
        >
        {loaded && now && (
          <>
            <PixelMatrix
              className="clock"
              items={timeItems}
              font={settings.font}
              isColonVisible={isColonVisible}
            />
            
            {settings.showDate && (
              <PixelMatrix
                className="date"
                items={dateItems}
                font={settings.font}
              />
            )}
          </>
        )}
      </div>

      <div className="kiosk-vignette" />

      <button
        onClick={() => (open ? setOpen(false) : setOpen(true))}
        aria-label={open ? "Close settings" : "Open kiosk settings"}
        tabIndex={showFab || open ? 0 : -1}
        className={`kiosk-fab fixed left-6 z-50 rounded-full p-3 transition-all duration-300 ${
          open
            ? "bottom-[calc(var(--panel-height,0px)+1.5rem)] pointer-events-auto opacity-100"
            : showFab
            ? "bottom-6 pointer-events-auto opacity-70 hover:opacity-100"
            : "bottom-6 pointer-events-none opacity-0"
        }`}
      >
        {open ? <X className="size-5" /> : <Settings className="size-5" />}
      </button>

      <Suspense fallback={null}>
        <SettingsPanel
          open={open}
          settings={settings}
          update={update}
          onClose={() => setOpen(false)}
        />
      </Suspense>
    </main>
  );
}