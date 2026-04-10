/**
 * SceneDirector — drives the scene sequence.
 *
 * Responsibilities:
 *  1. Advance through SceneScript scenes based on elapsed time
 *  2. Emit timing signals (sceneIndex, sceneProgress, overallProgress)
 *  3. Support scrub mode (jump to scene by index)
 *  4. Provide pause/resume
 *
 * This is framework-agnostic; the React hook in useSceneDirector.ts wraps it.
 */

import type { SceneScript, SceneDefinition, ScenePhase } from "./types";

export interface DirectorState {
  phase: ScenePhase;
  sceneIndex: number;
  scene: SceneDefinition;
  /** 0..1 progress within current scene */
  sceneProgress: number;
  /** 0..1 overall progress across all scenes */
  overallProgress: number;
  /** Elapsed ms within current scene */
  elapsedMs: number;
}

export type DirectorListener = (state: DirectorState) => void;

export class SceneDirector {
  private script: SceneScript;
  private listeners: DirectorListener[] = [];
  private _sceneIndex = 0;
  private _elapsedMs = 0;
  private _phase: ScenePhase = "idle";
  private _totalDurationMs: number;
  private _sceneDurationsMs: number[];

  constructor(script: SceneScript) {
    this.script = script;
    this._sceneDurationsMs = script.scenes.map((s) => s.durationSec * 1000);
    this._totalDurationMs = this._sceneDurationsMs.reduce((a, b) => a + b, 0);
  }

  get state(): DirectorState {
    const scene = this.script.scenes[this._sceneIndex];
    const durMs = this._sceneDurationsMs[this._sceneIndex];
    const sceneProgress = Math.min(1, this._elapsedMs / durMs);
    const completedMs = this._sceneDurationsMs
      .slice(0, this._sceneIndex)
      .reduce((a, b) => a + b, 0);
    const overallProgress =
      (completedMs + sceneProgress * durMs) / this._totalDurationMs;
    return {
      phase: this._phase,
      sceneIndex: this._sceneIndex,
      scene,
      sceneProgress,
      overallProgress,
      elapsedMs: this._elapsedMs,
    };
  }

  /** Called every frame with delta ms */
  tick(deltaMs: number): boolean {
    if (this._phase !== "playing") return false;

    this._elapsedMs += deltaMs;
    const durMs = this._sceneDurationsMs[this._sceneIndex];

    if (this._elapsedMs >= durMs) {
      // Advance to next scene
      const nextIndex = this._sceneIndex + 1;
      if (nextIndex >= this.script.scenes.length) {
        this._phase = "completed";
        this._elapsedMs = durMs;
        this.emit();
        return true; // sequence finished
      }
      this._sceneIndex = nextIndex;
      this._elapsedMs = 0;
      this.emit();
      return true; // scene changed
    }

    this.emit();
    return false;
  }

  play() {
    this._phase = "playing";
    this.emit();
  }

  pause() {
    this._phase = "idle";
    this.emit();
  }

  /** Jump to specific scene (scrub mode) */
  jumpTo(sceneIndex: number) {
    this._sceneIndex = Math.max(
      0,
      Math.min(sceneIndex, this.script.scenes.length - 1)
    );
    this._elapsedMs = 0;
    this.emit();
  }

  /** Reset to beginning */
  reset() {
    this._sceneIndex = 0;
    this._elapsedMs = 0;
    this._phase = "idle";
    this.emit();
  }

  subscribe(fn: DirectorListener) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private emit() {
    const s = this.state;
    for (const fn of this.listeners) fn(s);
  }
}
