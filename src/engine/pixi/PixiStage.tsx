"use client";

/**
 * PixiStage — SSR-safe PixiJS canvas mount point.
 * Canvas renders transparent; React DOM overlay sits on top.
 */

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Application } from "pixi.js";

export interface PixiStageProps {
  children?: ReactNode;
  onReady?: (app: Application) => void;
  className?: string;
}

export function PixiStage({ children, onReady, className }: PixiStageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  // Store onReady in a ref so useEffect doesn't re-run when it changes
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvasEl = canvasRef.current;
    if (!wrapper || !canvasEl) return;

    let pixiApp: Application;
    let cancelled = false;
    let resizeObs: ResizeObserver | null = null;

    (async () => {
      console.log("[PixiStage] Starting init...");
      const PIXI = await import("pixi.js");
      if (cancelled) return;

      const rect = wrapper.getBoundingClientRect();
      console.log("[PixiStage] Container size:", rect.width, "x", rect.height);
      pixiApp = new PIXI.Application();

      try {
        await pixiApp.init({
          width: rect.width,
          height: rect.height,
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
        });
      } catch (e) {
        console.error("[PixiStage] Init failed:", e);
        return;
      }

      if (cancelled) return;
      console.log("[PixiStage] Canvas created, appending...");
      canvasEl.appendChild(pixiApp.canvas as HTMLCanvasElement);

      resizeObs = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            pixiApp.renderer.resize(width, height);
          }
        }
      });
      resizeObs.observe(wrapper);

      setReady(true);
      onReadyRef.current?.(pixiApp);
    })();

    return () => {
      cancelled = true;
      resizeObs?.disconnect();
      if (pixiApp) {
        // Clean up backup interval from SceneEngine
        const backup = (pixiApp as unknown as Record<string, unknown>).__backupInterval;
        if (backup) clearInterval(backup as ReturnType<typeof setInterval>);
        pixiApp.destroy(true, { children: true });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount once only — onReady is accessed via ref

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full h-full ${className ?? ""}`}
    >
      <div ref={canvasRef} className="absolute inset-0" />
      {ready && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {children}
        </div>
      )}
    </div>
  );
}
