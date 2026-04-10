"use client";

/**
 * StationCanvas — React wrapper for the Phaser Orbital Data Station
 * ═══════════════════════════════════════════════════════════════════
 * SSR-safe: dynamically imports Phaser.
 * Mounts a single Phaser game into a div, passes the StationScript.
 */

import { useEffect, useRef } from "react";
import type { StationScript } from "./types";

interface StationCanvasProps {
  script: StationScript;
  className?: string;
}

export function StationCanvas({ script, className }: StationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<unknown>(null);
  const scriptRef = useRef(script);
  scriptRef.current = script;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    let game: { destroy: (removeCanvas: boolean) => void; events: { once: (e: string, cb: () => void) => void }; scene: { add: (key: string, cls: unknown, autoStart: boolean, data: unknown) => void }; loop: { wake: () => void; running: boolean } } | null = null;

    // Visibility handler hoisted for cleanup
    const handleVisibility = () => {
      if (game && !game.loop.running) game.loop.wake();
    };

    (async () => {
      // Dynamic import for SSR safety
      const Phaser = await import("phaser");
      const { StationScene } = await import("./StationScene");

      if (cancelled) return;

      const rect = el.getBoundingClientRect();
      const w = rect.width || 800;
      const h = rect.height || 600;

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: el,
        width: w,
        height: h,
        backgroundColor: "#0a0e1a",
        scene: [],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        render: {
          antialias: true,
          pixelArt: false,
          roundPixels: false,
        },
        audio: { noAudio: true },
        banner: false,
      }) as unknown as typeof game;

      gameRef.current = game;

      // Force wake on visibility change (background tab fix)
      document.addEventListener("visibilitychange", handleVisibility);

      // Start scene manually with data
      game!.events.once("ready", () => {
        if (cancelled || !game) return;
        game.scene.add("StationScene", StationScene as unknown as never, true, {
          script: scriptRef.current,
        });
      });
    })();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      if (game) {
        game.destroy(true);
        gameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className ?? ""}`}
      style={{ minHeight: 400 }}
    />
  );
}
