import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { PixelMatrix } from "@/components/PixelMatrix";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useClockSettings } from "@/hooks/use-clock-settings";

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
const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const pad = (n: number) => n.toString().padStart(2, "0");
const FAB_HIDE_MS = 4000;

function Kiosk() {
  const { settings, update, loaded } = useClockSettings();
  const [now, setNow] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const hideFabRef = useRef<number>();
  const openRef = useRef(false);
  openRef.current = open;

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 500);
    return () => window.clearInterval(id);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => {});
  }, []);

  const revealFab = useCallback(() => {
    setShowFab(true);
    window.clearTimeout(hideFabRef.current);
    hideFabRef.current = window.setTimeout(() => {
      if (!openRef.current) setShowFab(false);
    }, FAB_HIDE_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(hideFabRef.current), []);

  useEffect(() => {
    if (open) window.clearTimeout(hideFabRef.current);
    else if (showFab) revealFab();
  }, [open, showFab, revealFab]);

  const handleScreenPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".kiosk-panel, .kiosk-fab")) return;
    revealFab();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "s" || e.key === "S") setOpen((o) => !o);
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleFullscreen]);

  const themeClass = settings.theme === "amber" ? "" : `kiosk-${settings.theme}`;
  const dotSize = settings.scale;

  let timeText = "";
  let dateText = "";
  if (now) {
    const h = now.getHours();
    // ";" is a blank colon with the same width as ":", so blinking cannot shift digits.
    const sep = settings.blinkColon && now.getSeconds() % 2 === 1 ? ";" : ":";
    timeText = `${pad(h)}${sep}${pad(now.getMinutes())}`;
    if (settings.showSeconds) timeText += `${sep}${pad(now.getSeconds())}`;
    dateText = `${DAYS[now.getDay()]} ${pad(now.getDate())} ${MONTHS[now.getMonth()]}`;
  }
  let dimmed = false;
  if (now && settings.dim) {
    const mins = now.getHours() * 60 + now.getMinutes();
    const start = settings.dimStartHour * 60 + settings.dimStartMinute;
    const end = settings.dimEndHour * 60 + settings.dimEndMinute;
    dimmed = start === end ? false : start < end ? mins >= start && mins < end : mins >= start || mins < end;
  }

  return (
    <main
      className={`kiosk relative min-h-screen overflow-hidden select-none ${themeClass} ${
        settings.scanlines ? "kiosk-scanlines" : ""
      }`}
      style={{ opacity: 0.92 }}
      onPointerDown={handleScreenPointerDown}
    >
      <h1 className="sr-only">Pixel Clock Kiosk</h1>

      <div
        className={`flex min-h-screen flex-col items-center justify-center gap-[12vh] ${
          settings.drift ? "kiosk-drift" : ""
        }`}
        style={{ opacity: dimmed ? 0.25 : 1, transition: "opacity 1200ms linear" }}
      >
        {loaded && now ? (
          <>
            <div className="flex items-end gap-[2vw]">
              <PixelMatrix
                text={timeText}
                font={settings.font}
                size={dotSize}
                showGrid={settings.showGrid}
                glow={settings.glow}
              />
            </div>
            {settings.showDate ? (
              <PixelMatrix
                text={dateText}
                font={settings.font}
                size={Math.max(2, Math.round(dotSize * 0.34))}
                showGrid={settings.showGrid}
                glow={settings.glow * 0.6}
              />
            ) : null}
          </>
        ) : null}
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
