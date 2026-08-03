import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
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

function Kiosk() {
  const { settings, update, reset, loaded } = useClockSettings();
  const [now, setNow] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 500);
    return () => window.clearInterval(id);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => {});
  }, []);

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
  const dotSize = Math.max(3, Math.round((settings.scale / 100) * 14));

  let timeText = "";
  let dateText = "";
  let meridiem = "";
  if (now) {
    const h24 = now.getHours();
    const h = settings.hour24 ? h24 : h24 % 12 === 0 ? 12 : h24 % 12;
    const sep = settings.blinkColon && now.getSeconds() % 2 === 1 ? " " : ":";
    timeText = `${settings.hour24 ? pad(h) : h.toString()}${sep}${pad(now.getMinutes())}`;
    if (settings.showSeconds) timeText += `${sep}${pad(now.getSeconds())}`;
    meridiem = settings.hour24 ? "" : h24 < 12 ? "AM" : "PM";
    dateText = `${DAYS[now.getDay()]} ${pad(now.getDate())} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  }

  return (
    <main
      className={`kiosk relative min-h-screen overflow-hidden select-none ${themeClass} ${
        settings.scanlines ? "kiosk-scanlines" : ""
      }`}
      style={{ opacity: settings.brightness / 100 }}
    >
      <h1 className="sr-only">Pixel Clock Kiosk</h1>

      <div
        className={`flex min-h-screen flex-col items-center justify-center gap-[4vh] ${
          settings.drift ? "kiosk-drift" : ""
        }`}
      >
        {loaded && now ? (
          <>
            <div className="flex items-end gap-[2vw]">
              <PixelMatrix
                text={timeText}
                size={dotSize}
                showGrid={settings.showGrid}
                glow={settings.glow}
              />
              {meridiem ? (
                <PixelMatrix
                  text={meridiem}
                  size={Math.max(2, Math.round(dotSize * 0.4))}
                  showGrid={settings.showGrid}
                  glow={settings.glow}
                  className="mb-[0.5vh]"
                />
              ) : null}
            </div>
            {settings.showDate ? (
              <PixelMatrix
                text={dateText}
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
        className="fixed bottom-6 left-6 z-40 rounded-full border border-current/30 p-3 opacity-25 transition-opacity hover:opacity-100"
      >
        <Settings className="size-5" />
      </button>

      {open ? (
        <SettingsPanel
          settings={settings}
          update={update}
          reset={reset}
          onClose={() => setOpen(false)}
          onFullscreen={toggleFullscreen}
        />
      ) : null}
    </main>
  );
}
