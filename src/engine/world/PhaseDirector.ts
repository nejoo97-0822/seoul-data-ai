/**
 * PhaseDirector — drives phase progression in the persistent world.
 *
 * Unlike SceneDirector, nothing is destroyed between phases.
 * Only time advances, and PhaseCommands are fired.
 */

import type { WorldScript, PhaseDefinition, PhaseCommand } from "../core/types";

export interface PhaseDirectorState {
  playing: boolean;
  phaseIndex: number;
  phaseDef: PhaseDefinition;
  phaseProgress: number;
  overallProgress: number;
  elapsedMs: number;
}

export type PhaseListener = (state: PhaseDirectorState) => void;
export type CommandListener = (cmd: PhaseCommand, phaseDef: PhaseDefinition) => void;

export class PhaseDirector {
  private script: WorldScript;
  private listeners: PhaseListener[] = [];
  private commandListeners: CommandListener[] = [];
  private _phaseIndex = 0;
  private _elapsedMs = 0;
  private _playing = false;
  private _totalDurationMs: number;
  private _phaseDurationsMs: number[];
  private _firedCommands = new Set<string>(); // "phaseIdx:cmdIdx"

  constructor(script: WorldScript) {
    this.script = script;
    this._phaseDurationsMs = script.phases.map(p => p.durationSec * 1000);
    this._totalDurationMs = this._phaseDurationsMs.reduce((a, b) => a + b, 0);
  }

  get state(): PhaseDirectorState {
    const phase = this.script.phases[this._phaseIndex];
    const durMs = this._phaseDurationsMs[this._phaseIndex];
    const phaseProgress = Math.min(1, this._elapsedMs / durMs);
    const completedMs = this._phaseDurationsMs
      .slice(0, this._phaseIndex)
      .reduce((a, b) => a + b, 0);
    const overallProgress =
      (completedMs + phaseProgress * durMs) / this._totalDurationMs;
    return {
      playing: this._playing,
      phaseIndex: this._phaseIndex,
      phaseDef: phase,
      phaseProgress,
      overallProgress,
      elapsedMs: this._elapsedMs,
    };
  }

  /** Called every frame */
  tick(deltaMs: number) {
    if (!this._playing) return;

    this._elapsedMs += deltaMs;
    const phase = this.script.phases[this._phaseIndex];
    const elapsedSec = this._elapsedMs / 1000;

    // Fire due commands
    for (let ci = 0; ci < phase.commands.length; ci++) {
      const key = `${this._phaseIndex}:${ci}`;
      if (this._firedCommands.has(key)) continue;
      const cmd = phase.commands[ci];
      if (elapsedSec >= cmd.at) {
        this._firedCommands.add(key);
        for (const fn of this.commandListeners) fn(cmd, phase);
      }
    }

    // Check phase end
    const durMs = this._phaseDurationsMs[this._phaseIndex];
    if (this._elapsedMs >= durMs) {
      const nextIndex = this._phaseIndex + 1;
      if (nextIndex >= this.script.phases.length) {
        // Loop restart
        this.reset();
        this.play();
      } else {
        this._phaseIndex = nextIndex;
        this._elapsedMs = 0;
      }
    }

    this.emit();
  }

  play() {
    this._playing = true;
    this.emit();
  }

  pause() {
    this._playing = false;
    this.emit();
  }

  reset() {
    this._phaseIndex = 0;
    this._elapsedMs = 0;
    this._playing = false;
    this._firedCommands.clear();
    this.emit();
  }

  subscribe(fn: PhaseListener) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  onCommand(fn: CommandListener) {
    this.commandListeners.push(fn);
    return () => {
      this.commandListeners = this.commandListeners.filter(l => l !== fn);
    };
  }

  private emit() {
    const s = this.state;
    for (const fn of this.listeners) fn(s);
  }
}
