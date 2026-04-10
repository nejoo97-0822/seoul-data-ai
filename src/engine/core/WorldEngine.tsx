"use client";

/**
 * WorldEngine — persistent world React component.
 *
 * ONE world that never gets destroyed. Zones, agents, and data packets
 * persist throughout the entire session. Phases drive state progression.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Application } from "pixi.js";
import type { WorldScript, PhaseCommand, PhaseDefinition } from "./types";
import { PixiStage } from "../pixi/PixiStage";
import { EngineThemeProvider } from "../themes/ThemeProvider";
import { seoulDataHubTheme } from "../themes/builtin/seoul-data-hub";
import { ZoneRenderer } from "../world/ZoneRenderer";
import { PathRenderer } from "../world/PathRenderer";
import { AgentRenderer } from "../world/AgentRenderer";
import { DataPacketRenderer } from "../world/DataPacketRenderer";
import { PhaseDirector, type PhaseDirectorState } from "../world/PhaseDirector";

export interface WorldEngineProps {
  script: WorldScript;
  autoPlay?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function WorldEngine({
  script,
  autoPlay = true,
  onComplete,
  className,
}: WorldEngineProps) {
  const theme = seoulDataHubTheme;
  const [directorState, setDirectorState] = useState<PhaseDirectorState | null>(null);
  const directorRef = useRef<PhaseDirector | null>(null);
  const zoneRendererRef = useRef<ZoneRenderer | null>(null);
  const agentRendererRef = useRef<AgentRenderer | null>(null);
  const dataRendererRef = useRef<DataPacketRenderer | null>(null);
  const appRef = useRef<Application | null>(null);

  // Get current phase info for HUD
  const currentPhase = directorState?.phaseDef ?? script.phases[0];
  const phaseAccent = script.zones.find(z =>
    currentPhase.id === "query-intake" ? z.id === "intake"
    : currentPhase.id === "data-search" ? z.id === "catalog"
    : currentPhase.id === "calibration" ? z.id === "calibration"
    : currentPhase.id === "analysis" ? z.id === "reactor"
    : z.id === "report"
  )?.accent ?? theme.palette.primary;

  /** Handle phase commands — the core of the persistent world */
  const handleCommand = useCallback((cmd: PhaseCommand, phaseDef: PhaseDefinition) => {
    const zones = zoneRendererRef.current;
    const agents = agentRendererRef.current;
    const data = dataRendererRef.current;
    const app = appRef.current;
    if (!zones || !agents || !data || !app) return;

    const stageW = app.renderer.width;
    const stageH = app.renderer.height;

    switch (cmd.type) {
      case "zone-state": {
        const state = cmd.params?.state as string;
        if (state) zones.setState(cmd.target, state as "idle" | "active" | "processing" | "complete");
        break;
      }
      case "agent-walk": {
        const pathId = cmd.params?.pathId as string | undefined;
        const toZone = cmd.params?.toZone as string | undefined;
        if (pathId) {
          const path = script.paths.find(p => p.id === pathId);
          if (path) agents.walkPath(cmd.target, path.waypoints);
        } else if (toZone) {
          const zone = script.zones.find(z => z.id === toZone);
          if (zone) {
            agents.walkToZone(cmd.target, {
              x: zone.center.x * stageW,
              y: zone.center.y * stageH,
            });
          }
        }
        break;
      }
      case "agent-work": {
        const duration = (cmd.params?.duration as number) ?? 1.0;
        agents.startWork(cmd.target, duration);
        break;
      }
      case "agent-pickup": {
        const items = (cmd.params?.items as string[]) ?? [];
        const item = cmd.params?.item as string | undefined;
        const count = items.length || (item ? 1 : 0);
        agents.pickup(cmd.target, count);
        break;
      }
      case "agent-drop": {
        agents.drop(cmd.target);
        // Move data packets to zone
        const zoneId = cmd.params?.zoneId as string;
        if (zoneId) {
          const zonePos = zones.getZoneWorldPosition(zoneId);
          if (zonePos) {
            const allPacketIds = script.dataPackets.map(dp => dp.id);
            data.arrangeAtZone(allPacketIds, zonePos.x, zonePos.y);
          }
        }
        break;
      }
      case "data-state": {
        const state = cmd.params?.state as string;
        if (state) data.setState(cmd.target, state as "dormant" | "found" | "carried" | "processing" | "combined" | "delivered");
        break;
      }
      case "zone-effect": {
        // Future: trigger visual effects inside zones
        break;
      }
      case "spawn-effect": {
        // Future: spawn ring/pulse effects
        break;
      }
    }
  }, [script]);

  /** Handle world loop restart */
  const handleReset = useCallback(() => {
    zoneRendererRef.current?.resetAll();
    agentRendererRef.current?.resetAll();
    dataRendererRef.current?.resetAll();
  }, []);

  const handlePixiReady = useCallback(async (app: Application) => {
    appRef.current = app;
    const PIXI = await import("pixi.js");
    const stageW = app.renderer.width;
    const stageH = app.renderer.height;

    // === Create persistent world (NEVER destroyed) ===

    // Background grid floor
    const bgLayer = new PIXI.Container();
    const gridG = new PIXI.Graphics();
    // Subtle grid
    for (let x = 0; x < stageW; x += 30) {
      gridG.moveTo(x, 0);
      gridG.lineTo(x, stageH);
      gridG.stroke({ color: 0x94a3b8, width: 0.3, alpha: 0.08 });
    }
    for (let y = 0; y < stageH; y += 30) {
      gridG.moveTo(0, y);
      gridG.lineTo(stageW, y);
      gridG.stroke({ color: 0x94a3b8, width: 0.3, alpha: 0.08 });
    }
    bgLayer.addChild(gridG);
    app.stage.addChild(bgLayer);

    // Paths layer
    const pathRenderer = new PathRenderer(script.paths, stageW, stageH);
    app.stage.addChild(pathRenderer.container);

    // Zones layer (always visible)
    const zoneRenderer = new ZoneRenderer(
      script.zones,
      stageW,
      stageH,
      theme.fontFamily
    );
    app.stage.addChild(zoneRenderer.container);
    zoneRendererRef.current = zoneRenderer;

    // Data packets layer
    const dataRenderer = new DataPacketRenderer(
      script.dataPackets,
      stageW,
      stageH,
      theme.fontFamily,
      "#10B981"
    );
    app.stage.addChild(dataRenderer.container);
    dataRendererRef.current = dataRenderer;

    // Agents layer (on top)
    const agentRenderer = new AgentRenderer(
      script.agents,
      stageW,
      stageH,
      theme.fontFamily
    );
    app.stage.addChild(agentRenderer.container);
    agentRendererRef.current = agentRenderer;

    // === Phase Director ===
    const director = new PhaseDirector(script);
    directorRef.current = director;
    director.subscribe(setDirectorState);
    setDirectorState(director.state);

    // Wire command handler
    director.onCommand(handleCommand);

    // Auto play
    if (autoPlay) director.play();

    // === Tick loop (wall-clock for background tab survival) ===
    let lastWallTime = performance.now();

    const advanceWorld = () => {
      const now = performance.now();
      const wallDelta = Math.min(now - lastWallTime, 100);
      if (wallDelta < 1) return;
      lastWallTime = now;

      const deltaSec = wallDelta / 1000;

      // Check if we need to reset (director handles loop internally)
      const prevPhase = director.state.phaseIndex;
      director.tick(wallDelta);
      const newPhase = director.state.phaseIndex;
      if (newPhase < prevPhase) {
        // Loop restarted
        handleReset();
        onComplete?.();
      }

      // Animate persistent elements
      agentRenderer.tick(deltaSec);
      dataRenderer.tick(deltaSec);
    };

    app.ticker.add(() => advanceWorld());
    const backupInterval = setInterval(() => advanceWorld(), 32);
    (app as unknown as Record<string, unknown>).__backupInterval = backupInterval;
  }, [script, theme, autoPlay, handleCommand, handleReset, onComplete]);

  return (
    <EngineThemeProvider theme={theme}>
      <div
        className={`relative flex h-full w-full flex-col overflow-hidden ${className ?? ""}`}
        style={{
          background: `linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 40%, #F1F5F9 100%)`,
        }}
      >
        {/* HUD: Phase progress */}
        {directorState && (
          <div className="flex items-center gap-4 px-6 pt-5 pb-4 shrink-0">
            {/* Phase chip */}
            <div
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white shadow-sm transition-all duration-500"
              style={{ borderColor: `${phaseAccent}40` }}
            >
              <div
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: phaseAccent, boxShadow: `0 0 10px ${phaseAccent}` }}
              />
              <span className="text-[10px] font-bold tabular-nums tracking-widest" style={{ color: phaseAccent }}>
                {String(directorState.phaseIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-[11px] font-bold tracking-[0.08em]" style={{ color: phaseAccent }}>
                {currentPhase.labelKo}
              </span>
            </div>

            {/* Description */}
            <span className="text-[13px] text-slate-500 font-medium truncate">
              {currentPhase.description}
            </span>

            {/* Zone status dots */}
            <div className="ml-auto flex items-center gap-1.5">
              {script.zones.map(z => {
                const zState = zoneRendererRef.current?.getState(z.id) ?? "idle";
                return (
                  <div
                    key={z.id}
                    className="flex items-center gap-1 transition-all duration-300"
                    title={`${z.labelKo}: ${zState}`}
                  >
                    <div
                      className="h-2 w-2 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: zState === "idle" ? "#CBD5E1"
                          : zState === "complete" ? z.accent
                          : z.accent,
                        opacity: zState === "idle" ? 0.4
                          : zState === "processing" ? 1
                          : zState === "active" ? 0.7
                          : 0.5,
                        boxShadow: zState === "processing" ? `0 0 6px ${z.accent}` : "none",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-bold text-slate-400 tabular-nums tracking-widest">
                {Math.round(directorState.overallProgress * 100)}%
              </div>
              <div className="relative h-[3px] w-[100px] rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-200"
                  style={{
                    width: `${directorState.overallProgress * 100}%`,
                    background: `linear-gradient(90deg, ${theme.palette.accent}, ${phaseAccent})`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* World Stage */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center px-8 py-4">
          <div
            className="relative h-full w-full max-w-[960px] rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 50%, #F1F5F9 100%)",
              boxShadow: "inset 0 2px 14px rgba(15,23,42,0.06), 0 24px 60px -20px rgba(15,23,42,0.15), 0 2px 0 rgba(255,255,255,0.8)",
              border: "1px solid rgba(203,213,225,0.9)",
            }}
          >
            <PixiStage onReady={handlePixiReady}>
              {/* Phase badge */}
              <div className="absolute right-4 bottom-3 text-[9px] font-bold tracking-[0.2em] text-slate-300">
                PHASE {String((directorState?.phaseIndex ?? 0) + 1).padStart(2, "0")} / {String(script.phases.length).padStart(2, "0")}
              </div>
              {/* Phase caption */}
              <div
                className="absolute left-1/2 bottom-3 -translate-x-1/2 text-[11px] font-medium tracking-wide select-none transition-colors duration-500"
                style={{ color: `${phaseAccent}99` }}
              >
                {currentPhase.description}
              </div>
            </PixiStage>
          </div>
        </div>

        <div className="shrink-0 h-6" />
      </div>
    </EngineThemeProvider>
  );
}
