"use client";

/**
 * SceneEngine — top-level React component.
 *
 * Orchestrates PixiJS canvas + HUD overlay.
 * Given a SceneScript + ThemeDefinition, plays the full sequence.
 *
 * KEY: Scene transitions use crossfade — outgoing scene fades out
 * while incoming scene fades in, with bridge particles carrying
 * visual continuity across the cut.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Application } from "pixi.js";
import type {
  SceneScript,
  ThemeDefinition,
  ActorInstance,
  SceneDefinition,
} from "./types";
import { SceneDirector, type DirectorState } from "./SceneDirector";
import { PixiStage } from "../pixi/PixiStage";
import { EngineThemeProvider } from "../themes/ThemeProvider";
import { createActor } from "../actors/ActorFactory";
import { EventTimeline } from "../events/EventRunner";
import { SceneChrome } from "../hud/SceneChrome";
import { SceneBadge } from "../hud/SceneBadge";
import { SceneCaption } from "../hud/SceneCaption";

// Import all builtin actor renderers (side effects register them)
import "../actors/builtin/ParticleSwarm";
import "../actors/builtin/RingActor";
import "../actors/builtin/TaskCardActor";
import "../actors/builtin/ResultCardActor";
import "../actors/builtin/BeamActor";
import "../actors/builtin/GlyphActor";
import "../actors/builtin/ArchiveZoneActor";
import "../actors/builtin/DataNodeActor";
import "../actors/builtin/StageBackdropActor";

// Import all builtin event handlers
import "../events/builtin/spawn";
import "../events/builtin/despawn";
import "../events/builtin/move";
import "../events/builtin/converge";
import "../events/builtin/orbit";
import "../events/builtin/pulse";
import "../events/builtin/reveal";
import "../events/builtin/filter";
import "../events/builtin/stamp";
import "../events/builtin/highlight";
import "../events/builtin/dim";

export interface SceneEngineProps {
  script: SceneScript;
  theme: ThemeDefinition;
  autoPlay?: boolean;
  scrubIndex?: number;
  onComplete?: () => void;
  className?: string;
}

/** Cached PixiJS classes from dynamic import */
let PixiContainerClass: typeof import("pixi.js").Container | null = null;
let PixiGraphicsClass: typeof import("pixi.js").Graphics | null = null;

/** Transition duration in seconds */
const CROSSFADE_DURATION = 0.45;

/** Bridge particle count during transition */
const BRIDGE_PARTICLE_COUNT = 12;

interface SceneLayer {
  container: import("pixi.js").Container;
  actorMap: Map<string, ActorInstance>;
  timeline: EventTimeline;
  sceneId: string;
}

export function SceneEngine({
  script,
  theme,
  autoPlay = true,
  scrubIndex,
  onComplete,
  className,
}: SceneEngineProps) {
  const [directorState, setDirectorState] = useState<DirectorState | null>(
    null
  );
  const directorRef = useRef<SceneDirector | null>(null);
  const appRef = useRef<Application | null>(null);

  // Active scene layer
  const activeLayerRef = useRef<SceneLayer | null>(null);
  // Outgoing scene layer (during crossfade)
  const outgoingLayerRef = useRef<SceneLayer | null>(null);
  // Bridge particles container
  const bridgeContainerRef = useRef<import("pixi.js").Container | null>(null);

  const timelineRef = useRef<EventTimeline | null>(null);
  const lastSceneIdRef = useRef<string | null>(null);

  // Crossfade state
  const crossfadeRef = useRef<{
    active: boolean;
    progress: number; // 0..1
    fromAccent: number; // hex color
    toAccent: number;
  }>({ active: false, progress: 0, fromAccent: 0x3b82f6, toAccent: 0x3b82f6 });

  // Initialize director
  useEffect(() => {
    const director = new SceneDirector(script);
    directorRef.current = director;
    const unsub = director.subscribe(setDirectorState);
    setDirectorState(director.state);
    return () => {
      unsub();
    };
  }, [script]);

  // Handle scrub mode
  useEffect(() => {
    const d = directorRef.current;
    if (!d) return;
    if (typeof scrubIndex === "number") {
      d.pause();
      d.jumpTo(scrubIndex);
    }
  }, [scrubIndex]);

  /** Resolve scene theme with accent overrides */
  const resolveSceneTheme = useCallback(
    (scene: SceneDefinition): ThemeDefinition => {
      const sceneAccent = theme.sceneAccents[scene.id];
      if (!sceneAccent) return theme;
      return {
        ...theme,
        actorSkins: Object.fromEntries(
          Object.entries(theme.actorSkins).map(([k, v]) => [
            k,
            {
              ...v,
              fill:
                k === "taskCard" || k === "resultCard"
                  ? v.fill
                  : sceneAccent.accent,
              stroke: sceneAccent.accent,
              glow: sceneAccent.accent,
            },
          ])
        ),
      };
    },
    [theme]
  );

  /** Create a scene layer (container + actors + timeline) without destroying anything */
  const createSceneLayer = useCallback(
    (scene: SceneDefinition, app: Application): SceneLayer => {
      if (!PixiContainerClass) throw new Error("PixiJS not loaded");

      const container = new PixiContainerClass();
      const stageW = app.renderer.width;
      const stageH = app.renderer.height;
      const sceneTheme = resolveSceneTheme(scene);

      // Create actors
      const actorMap = new Map<string, ActorInstance>();
      for (const actorDef of scene.actors) {
        try {
          const instance = createActor(actorDef, sceneTheme, stageW, stageH);
          container.addChild(instance.container);
          actorMap.set(actorDef.id, instance);
        } catch (e) {
          console.warn(`[SceneEngine] Actor create failed:`, e);
        }
      }

      // Create event timeline
      const timeline = new EventTimeline(
        scene.events,
        actorMap,
        sceneTheme,
        stageW,
        stageH
      );

      return { container, actorMap, timeline, sceneId: scene.id };
    },
    [resolveSceneTheme]
  );

  /** Parse hex color string to number */
  const colorToNum = (c: string) => parseInt(c.replace("#", ""), 16);

  /** Create bridge particles between scenes */
  const spawnBridgeParticles = useCallback(
    (app: Application, fromAccent: number, toAccent: number) => {
      if (!PixiContainerClass || !PixiGraphicsClass) return;

      // Clean up existing bridge
      if (bridgeContainerRef.current) {
        bridgeContainerRef.current.destroy({ children: true });
      }

      const bridgeContainer = new PixiContainerClass();
      app.stage.addChild(bridgeContainer);
      bridgeContainerRef.current = bridgeContainer;

      const stageW = app.renderer.width;
      const stageH = app.renderer.height;
      const cx = stageW / 2;
      const cy = stageH / 2;

      // Create glowing bridge particles
      for (let i = 0; i < BRIDGE_PARTICLE_COUNT; i++) {
        const g = new PixiGraphicsClass();
        const angle = (i / BRIDGE_PARTICLE_COUNT) * Math.PI * 2;
        const radius = 60 + Math.random() * 140;
        const size = 3 + Math.random() * 4;

        // Blend color from outgoing to incoming
        const t = i / BRIDGE_PARTICLE_COUNT;
        const color = t < 0.5 ? fromAccent : toAccent;

        // Outer glow
        g.circle(0, 0, size * 3);
        g.fill({ color, alpha: 0.08 });
        // Mid glow
        g.circle(0, 0, size * 1.8);
        g.fill({ color, alpha: 0.15 });
        // Core
        g.circle(0, 0, size);
        g.fill({ color, alpha: 0.4 });
        // White center
        g.circle(0, 0, size * 0.4);
        g.fill({ color: 0xffffff, alpha: 0.6 });

        g.x = cx + Math.cos(angle) * radius;
        g.y = cy + Math.sin(angle) * radius;

        // Store animation params
        (g as unknown as Record<string, unknown>).__angle = angle;
        (g as unknown as Record<string, unknown>).__radius = radius;
        (g as unknown as Record<string, unknown>).__speed = 0.3 + Math.random() * 0.5;
        (g as unknown as Record<string, unknown>).__baseSize = size;

        bridgeContainer.addChild(g);
      }

      // Add a central glow wash
      const wash = new PixiGraphicsClass();
      wash.circle(cx, cy, 100);
      wash.fill({ color: toAccent, alpha: 0.04 });
      wash.circle(cx, cy, 60);
      wash.fill({ color: toAccent, alpha: 0.06 });
      bridgeContainer.addChildAt(wash, 0);
    },
    []
  );

  /** Animate bridge particles during crossfade */
  const tickBridgeParticles = useCallback(
    (progress: number, app: Application) => {
      const bridge = bridgeContainerRef.current;
      if (!bridge) return;

      const cx = app.renderer.width / 2;
      const cy = app.renderer.height / 2;

      // Envelope: fade in (0-0.3), hold (0.3-0.7), fade out (0.7-1.0)
      let alpha: number;
      if (progress < 0.3) {
        alpha = progress / 0.3;
      } else if (progress < 0.7) {
        alpha = 1;
      } else {
        alpha = 1 - (progress - 0.7) / 0.3;
      }
      bridge.alpha = alpha;

      // Animate each particle: drift inward toward center
      for (let i = 0; i < bridge.children.length - 1; i++) {
        const child = bridge.children[i];
        const rec = child as unknown as Record<string, unknown>;
        const angle = (rec.__angle as number) ?? 0;
        const baseRadius = (rec.__radius as number) ?? 100;
        const speed = (rec.__speed as number) ?? 0.4;

        // Particles spiral inward during transition
        const r = baseRadius * (1 - progress * 0.6);
        const a = angle + progress * speed * Math.PI * 2;
        child.x = cx + Math.cos(a) * r;
        child.y = cy + Math.sin(a) * r;

        // Scale pulse
        const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
        child.scale.set(scale);
      }
    },
    []
  );

  /** Transition from current scene to next scene with crossfade */
  const transitionToScene = useCallback(
    (scene: SceneDefinition, app: Application) => {
      if (!PixiContainerClass) return;

      // Get accent colors for bridge particles
      const oldSceneId = lastSceneIdRef.current;
      const oldAccent = oldSceneId
        ? colorToNum(theme.sceneAccents[oldSceneId]?.accent ?? theme.palette.primary)
        : colorToNum(theme.palette.primary);
      const newAccent = colorToNum(
        theme.sceneAccents[scene.id]?.accent ?? theme.palette.primary
      );

      // Move current active layer to outgoing
      if (activeLayerRef.current) {
        // Clean up any previous outgoing layer
        if (outgoingLayerRef.current) {
          outgoingLayerRef.current.container.destroy({ children: true });
        }
        outgoingLayerRef.current = activeLayerRef.current;
      }

      // Create new scene layer
      const newLayer = createSceneLayer(scene, app);
      newLayer.container.alpha = 0; // Start invisible
      app.stage.addChild(newLayer.container);
      activeLayerRef.current = newLayer;
      timelineRef.current = newLayer.timeline;

      // Spawn bridge particles (between outgoing and incoming layers)
      spawnBridgeParticles(app, oldAccent, newAccent);

      // Start crossfade
      crossfadeRef.current = {
        active: true,
        progress: 0,
        fromAccent: oldAccent,
        toAccent: newAccent,
      };
    },
    [theme, createSceneLayer, spawnBridgeParticles]
  );

  /** Setup initial scene (no crossfade) */
  const setupInitialScene = useCallback(
    (scene: SceneDefinition, app: Application) => {
      if (!PixiContainerClass) return;

      const layer = createSceneLayer(scene, app);
      app.stage.addChild(layer.container);
      activeLayerRef.current = layer;
      timelineRef.current = layer.timeline;
    },
    [createSceneLayer]
  );

  /** Tick the crossfade animation */
  const tickCrossfade = useCallback(
    (deltaSec: number, app: Application) => {
      const cf = crossfadeRef.current;
      if (!cf.active) return;

      cf.progress += deltaSec / CROSSFADE_DURATION;

      if (cf.progress >= 1) {
        cf.progress = 1;
        cf.active = false;

        // Finalize: destroy outgoing layer
        if (outgoingLayerRef.current) {
          outgoingLayerRef.current.container.destroy({ children: true });
          outgoingLayerRef.current = null;
        }

        // Destroy bridge particles
        if (bridgeContainerRef.current) {
          bridgeContainerRef.current.destroy({ children: true });
          bridgeContainerRef.current = null;
        }

        // Ensure active layer is fully visible
        if (activeLayerRef.current) {
          activeLayerRef.current.container.alpha = 1;
        }
        return;
      }

      // Ease the crossfade (smooth cubic)
      const t = cf.progress;
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Fade out old scene
      if (outgoingLayerRef.current) {
        outgoingLayerRef.current.container.alpha = 1 - eased;
        // Slight scale-down + drift for cinematic feel
        outgoingLayerRef.current.container.scale.set(1 - eased * 0.02);
      }

      // Fade in new scene
      if (activeLayerRef.current) {
        activeLayerRef.current.container.alpha = eased;
        // Slight scale-up from 0.98
        activeLayerRef.current.container.scale.set(0.98 + eased * 0.02);
      }

      // Animate bridge particles
      tickBridgeParticles(cf.progress, app);
    },
    [tickBridgeParticles]
  );

  // PixiJS ready callback
  const handlePixiReady = useCallback(
    async (app: Application) => {
      appRef.current = app;

      // Cache PixiJS classes
      if (!PixiContainerClass || !PixiGraphicsClass) {
        const PIXI = await import("pixi.js");
        PixiContainerClass = PIXI.Container;
        PixiGraphicsClass = PIXI.Graphics;
      }

      const director = directorRef.current;
      if (!director) return;

      // Setup initial scene (no crossfade for first scene)
      const state = director.state;
      setupInitialScene(state.scene, app);
      lastSceneIdRef.current = state.scene.id;

      // Start autoplay
      if (autoPlay && typeof scrubIndex !== "number") {
        director.play();
      }

      // Wall-clock engine driver
      let lastWallTime = performance.now();

      const advanceEngine = () => {
        const d = directorRef.current;
        if (!d) return;

        const now = performance.now();
        const wallDelta = Math.min(now - lastWallTime, 100);
        if (wallDelta < 1) return;
        lastWallTime = now;

        const wallDeltaSec = wallDelta / 1000;

        // Tick crossfade animation
        tickCrossfade(wallDeltaSec, app);

        const sceneChanged = d.tick(wallDelta);

        // Update event timeline for active scene
        const currentState = d.state;
        const elapsedSec = currentState.elapsedMs / 1000;
        timelineRef.current?.tick(elapsedSec);

        // Scene transition
        if (sceneChanged) {
          if (currentState.phase === "completed") {
            onComplete?.();
            // Loop back to start
            d.reset();
            d.play();
            const resetState = d.state;
            // For loop restart, use crossfade too
            transitionToScene(resetState.scene, app);
            lastSceneIdRef.current = resetState.scene.id;
          } else if (currentState.scene.id !== lastSceneIdRef.current) {
            // Normal scene transition with crossfade
            transitionToScene(currentState.scene, app);
            lastSceneIdRef.current = currentState.scene.id;
          }
        }
      };

      // Primary: PixiJS RAF ticker
      app.ticker.add(() => advanceEngine());

      // Backup: setInterval for background-tab survival
      const backupInterval = setInterval(() => advanceEngine(), 32);
      (app as unknown as Record<string, unknown>).__backupInterval =
        backupInterval;
    },
    [
      autoPlay,
      scrubIndex,
      setupInitialScene,
      transitionToScene,
      tickCrossfade,
      onComplete,
    ]
  );

  // Re-setup scene when scrubIndex changes
  useEffect(() => {
    const app = appRef.current;
    const director = directorRef.current;
    if (!app || !director || typeof scrubIndex !== "number") return;
    if (!PixiContainerClass) return;

    const state = director.state;
    // For scrub mode, do immediate switch (no crossfade)
    if (activeLayerRef.current) {
      activeLayerRef.current.container.destroy({ children: true });
      activeLayerRef.current = null;
    }
    if (outgoingLayerRef.current) {
      outgoingLayerRef.current.container.destroy({ children: true });
      outgoingLayerRef.current = null;
    }
    setupInitialScene(state.scene, app);
    lastSceneIdRef.current = state.scene.id;
  }, [scrubIndex, setupInitialScene]);

  const currentScene = directorState?.scene ?? script.scenes[0];
  const sceneAccent =
    theme.sceneAccents[currentScene.id]?.accent ?? theme.palette.primary;

  return (
    <EngineThemeProvider theme={theme}>
      <div
        className={`relative flex h-full w-full flex-col overflow-hidden ${className ?? ""}`}
        style={{
          background: `linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 40%, #F1F5F9 100%)`,
        }}
      >
        {/* HUD: Top chrome */}
        {directorState && (
          <SceneChrome
            scene={currentScene}
            sceneIndex={directorState.sceneIndex}
            totalScenes={script.scenes.length}
            overallProgress={directorState.overallProgress}
            theme={theme}
          />
        )}

        {/* Stage area */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center px-8 py-4">
          <div
            className="relative h-full w-full max-w-[960px] rounded-3xl overflow-hidden"
            style={{
              background: theme.stageBackground,
              boxShadow:
                "inset 0 2px 14px rgba(15,23,42,0.08), 0 24px 60px -20px rgba(15,23,42,0.18), 0 2px 0 rgba(255,255,255,0.8)",
              border: "1px solid rgba(203,213,225,0.9)",
            }}
          >
            {/* Stage floor grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(to right, ${theme.stageGrid.color}0D 1px, transparent 1px), linear-gradient(to bottom, ${theme.stageGrid.color}0D 1px, transparent 1px)`,
                backgroundSize: `${theme.stageGrid.size}px ${theme.stageGrid.size}px`,
                maskImage:
                  "radial-gradient(ellipse 68% 56% at 50% 58%, black 35%, transparent 85%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 68% 56% at 50% 58%, black 35%, transparent 85%)",
              }}
            />

            {/* PixiJS Canvas */}
            <PixiStage onReady={handlePixiReady}>
              {/* HUD overlay inside stage */}
              <SceneBadge
                sceneIndex={directorState?.sceneIndex ?? 0}
                totalScenes={script.scenes.length}
              />
              <SceneCaption
                text={currentScene.description}
                accent={sceneAccent}
              />
            </PixiStage>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="shrink-0 h-10" />
      </div>
    </EngineThemeProvider>
  );
}
