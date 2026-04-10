/**
 * StationScene — Orbital Data Station Diorama
 * ════════════════════════════════════════════
 * A living miniature world, NOT a diagram.
 * Each zone is an environment structure, not a labeled box.
 * Characters are prominent actors, not small markers.
 */

import * as Phaser from "phaser";
import type {
  StationScript,
  ZoneState,
  AgentAnim,
  CargoState,
  PhaseCmd,
} from "./types";

/* ── Palette ───────────────────────────── */
const BG           = 0x070b14;
const FLOOR_DARK   = 0x0c1220;
const FLOOR_LIGHT  = 0x111d2e;
const METAL_DARK   = 0x1a2332;
const METAL_MID    = 0x243044;
const METAL_LIGHT  = 0x2e3d54;
const ACCENT_GLOW  = 0x38bdf8;
const CYAN         = 0x06b6d4;
const EMERALD      = 0x10b981;
const AMBER        = 0xf59e0b;
const VIOLET       = 0x8b5cf6;
const ROSE         = 0xf43f5e;
const WHITE_DIM    = 0x94a3b8;

const WALK_SPEED = 130;

/* ── Runtime Interfaces ────────────────── */
interface ZoneRT {
  id: string;
  cx: number; cy: number;
  container: Phaser.GameObjects.Container;
  state: ZoneState;
  accent: number;
  glowElements: Phaser.GameObjects.GameObject[];
}

interface AgentRT {
  id: string;
  container: Phaser.GameObjects.Container;
  color: number;
  anim: AgentAnim;
  carrying: boolean;
  carryBox: Phaser.GameObjects.Container | null;
  walkTarget: { x: number; y: number } | null;
  workTimer: number;
  bobPhase: number;
  shadow: Phaser.GameObjects.Ellipse;
  body: Phaser.GameObjects.Container;
}

interface CargoRT {
  id: string;
  container: Phaser.GameObjects.Container;
  state: CargoState;
  homeX: number;
  homeY: number;
}

interface CardRT {
  container: Phaser.GameObjects.Container;
  revealed: boolean;
}

interface PhaseState {
  phaseIndex: number;
  phaseElapsed: number;
  totalElapsed: number;
  firedCmds: Set<string>;
}

/* ══════════════════════════════════════════
   STATION SCENE
   ══════════════════════════════════════════ */
export class StationScene extends Phaser.Scene {
  private script!: StationScript;
  private W = 0;
  private H = 0;

  private zones = new Map<string, ZoneRT>();
  private agents = new Map<string, AgentRT>();
  private cargos = new Map<string, CargoRT>();
  private cards = new Map<string, CardRT>();

  private phase: PhaseState = { phaseIndex: 0, phaseElapsed: 0, totalElapsed: 0, firedCmds: new Set() };
  private lastTime = 0;
  private backupInterval: ReturnType<typeof setInterval> | null = null;

  // HUD
  private hudPhaseLabel!: Phaser.GameObjects.Text;
  private hudDesc!: Phaser.GameObjects.Text;
  private hudProgressBar!: Phaser.GameObjects.Rectangle;
  private hudDots: Phaser.GameObjects.Arc[] = [];

  // Ambient animation refs
  private reactorRing!: Phaser.GameObjects.Arc;
  private reactorRing2!: Phaser.GameObjects.Arc;
  private reactorCore!: Phaser.GameObjects.Arc;
  private scanBeamRef: Phaser.GameObjects.Rectangle | null = null;
  private starField: { g: Phaser.GameObjects.Arc; baseAlpha: number }[] = [];
  private floorLights: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super({ key: "StationScene" });
  }

  init(data: { script: StationScript }) {
    if (data?.script) this.script = data.script;
  }

  create() {
    if (!this.script) { console.error("[Station] No script"); return; }
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.lastTime = performance.now();

    this.cameras.main.setBackgroundColor(BG);

    this.buildStationInterior();
    this.buildDock();
    this.buildArchive();
    this.buildAlignmentGate();
    this.buildReactorCore();
    this.buildReportBridge();
    this.buildFloorRails();
    this.buildAgents();
    this.buildCargoPods();
    this.buildHUD();
    this.resetPhases();

    this.backupInterval = setInterval(() => {
      if (!this.script || !this.W) return;
      const now = performance.now();
      const deltaMs = Math.min(now - this.lastTime, 100);
      if (deltaMs > 40) {
        this.lastTime = now;
        this.tickPhases(deltaMs / 1000);
        this.updateAgents(deltaMs);
        this.animateWorld(deltaMs);
      }
    }, 32);
  }

  shutdown() {
    if (this.backupInterval) { clearInterval(this.backupInterval); this.backupInterval = null; }
  }

  /* ══════════════════════════════════════
     STATION INTERIOR — the living world
     ══════════════════════════════════════ */
  private buildStationInterior() {
    const W = this.W, H = this.H;

    // --- Metal floor panels ---
    const floorG = this.add.graphics();
    // Large floor tiles
    const tileW = 48, tileH = 48;
    for (let x = 0; x < W; x += tileW) {
      for (let y = 0; y < H; y += tileH) {
        const shade = ((x / tileW + y / tileH) % 2 === 0) ? FLOOR_DARK : FLOOR_LIGHT;
        floorG.fillStyle(shade, 0.6);
        floorG.fillRect(x, y, tileW - 1, tileH - 1);
      }
    }
    // Floor seam lines
    floorG.lineStyle(1, METAL_DARK, 0.3);
    for (let x = 0; x <= W; x += tileW) { floorG.moveTo(x, 0); floorG.lineTo(x, H); }
    for (let y = 0; y <= H; y += tileH) { floorG.moveTo(0, y); floorG.lineTo(W, y); }
    floorG.strokePath();

    // --- Station walls (top & bottom bands) ---
    const wallTop = this.add.rectangle(W / 2, 18, W, 36, METAL_DARK, 0.85);
    const wallBot = this.add.rectangle(W / 2, H - 18, W, 36, METAL_DARK, 0.85);

    // Wall detail rivets
    for (let x = 30; x < W; x += 60) {
      this.add.circle(x, 8, 2, METAL_MID, 0.5);
      this.add.circle(x, H - 8, 2, METAL_MID, 0.5);
    }

    // --- Ceiling light strips ---
    const lightG = this.add.graphics();
    lightG.fillStyle(0x1e3a5f, 0.25);
    lightG.fillRect(0, 36, W, 2);
    lightG.fillRect(0, H - 38, W, 2);
    // Horizontal ambient light bars
    for (let x = 80; x < W - 80; x += 180) {
      const bar = this.add.rectangle(x + 40, 37, 80, 1, ACCENT_GLOW, 0.12);
      this.floorLights.push(bar);
    }

    // --- Circular viewport windows (space outside) ---
    const viewports = [
      { x: W * 0.15, y: 18 },
      { x: W * 0.50, y: 18 },
      { x: W * 0.85, y: 18 },
    ];
    for (const vp of viewports) {
      // Window frame
      this.add.circle(vp.x, vp.y, 14, METAL_MID, 0.8).setStrokeStyle(2, METAL_LIGHT, 0.6);
      // Space view (dark with tiny stars)
      this.add.circle(vp.x, vp.y, 11, 0x020510, 0.9);
      for (let i = 0; i < 4; i++) {
        const sx = vp.x + Phaser.Math.Between(-8, 8);
        const sy = vp.y + Phaser.Math.Between(-8, 8);
        this.add.circle(sx, sy, 0.5, 0xffffff, 0.6);
      }
    }

    // --- Side wall pillars ---
    for (const x of [0, W - 8]) {
      this.add.rectangle(x + 4, H / 2, 8, H, METAL_DARK, 0.7);
      // Pillar light strips
      this.add.rectangle(x + 4, H * 0.3, 2, 40, CYAN, 0.06);
      this.add.rectangle(x + 4, H * 0.7, 2, 40, VIOLET, 0.06);
    }

    // --- Star field through floor viewport (center) ---
    for (let i = 0; i < 40; i++) {
      const s = this.add.circle(
        Phaser.Math.Between(20, W - 20),
        Phaser.Math.Between(40, H - 40),
        Phaser.Math.FloatBetween(0.3, 0.8),
        0xffffff,
        Phaser.Math.FloatBetween(0.02, 0.08),
      );
      this.starField.push({ g: s, baseAlpha: s.alpha });
    }

    // --- Floor guide lights (embedded LEDs along pathways) ---
    const guidePaths = [
      // Dock → Archive
      { x1: W * 0.14, y1: H * 0.48, x2: W * 0.30, y2: H * 0.38 },
      // Archive → Gate
      { x1: W * 0.44, y1: H * 0.32, x2: W * 0.56, y2: H * 0.42 },
      // Gate → Reactor
      { x1: W * 0.62, y1: H * 0.52, x2: W * 0.50, y2: H * 0.65 },
      // Reactor → Bridge
      { x1: W * 0.55, y1: H * 0.72, x2: W * 0.74, y2: H * 0.58 },
    ];
    for (const p of guidePaths) {
      const dx = p.x2 - p.x1, dy = p.y2 - p.y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(dist / 16);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const led = this.add.circle(
          p.x1 + dx * t, p.y1 + dy * t,
          1.5, ACCENT_GLOW, 0.04 + (i % 3 === 0 ? 0.03 : 0),
        );
        this.floorLights.push(led as unknown as Phaser.GameObjects.Rectangle);
      }
    }
  }

  /* ──────────────────────────────────────
     DOCK — Landing platform with gate
     ────────────────────────────────────── */
  private buildDock() {
    const cx = this.W * 0.10, cy = this.H * 0.42;
    const c = this.add.container(cx, cy);

    // Platform base (raised metal pad)
    const platform = this.add.rectangle(0, 0, 100, 70, METAL_DARK, 0.75);
    platform.setStrokeStyle(1, METAL_MID, 0.4);

    // Platform surface detail
    const surface = this.add.rectangle(0, 0, 90, 60, FLOOR_LIGHT, 0.5);

    // Docking arm (left side, mechanical arm)
    const armBase = this.add.rectangle(-52, 0, 6, 30, METAL_LIGHT, 0.7);
    const armJoint = this.add.circle(-52, -15, 4, METAL_MID, 0.8);
    armJoint.setStrokeStyle(1, METAL_LIGHT, 0.5);
    const armExtend = this.add.rectangle(-52, -28, 4, 20, METAL_MID, 0.6);

    // Landing guide lights (yellow strips)
    for (let i = -2; i <= 2; i++) {
      this.add.rectangle(i * 16, 28, 8, 2, CYAN, 0.15).setData("dockLight", true);
      c.add(this.add.rectangle(i * 16, 28, 8, 2, CYAN, 0.15));
    }

    // Arrival gate arch
    const archL = this.add.rectangle(-38, -10, 4, 40, CYAN, 0.12);
    const archR = this.add.rectangle(38, -10, 4, 40, CYAN, 0.12);
    const archTop = this.add.rectangle(0, -30, 80, 3, CYAN, 0.08);

    // Gate status light
    const statusLight = this.add.circle(0, -33, 3, CYAN, 0.15);

    // Tiny label (etched into platform edge, very subtle)
    const label = this.add.text(0, 38, "DOCK", {
      fontFamily: "'DM Sans', monospace",
      fontSize: "6px",
      color: "#475569",
      letterSpacing: 2,
    }).setOrigin(0.5).setAlpha(0.3);

    c.add([platform, surface, armBase, armJoint, armExtend, archL, archR, archTop, statusLight, label]);

    this.zones.set("dock", {
      id: "dock", cx, cy, container: c, state: "idle", accent: CYAN,
      glowElements: [statusLight, archL, archR, archTop],
    });
  }

  /* ──────────────────────────────────────
     ARCHIVE — Shelving racks + scan tower
     ────────────────────────────────────── */
  private buildArchive() {
    const cx = this.W * 0.35, cy = this.H * 0.28;
    const c = this.add.container(cx, cy);

    // Floor platform
    const floor = this.add.rectangle(0, 6, 150, 90, METAL_DARK, 0.7);
    floor.setStrokeStyle(1, METAL_MID, 0.3);
    const floorSurface = this.add.rectangle(0, 6, 140, 80, FLOOR_LIGHT, 0.4);

    // Shelving racks (4 vertical shelf units)
    const shelfPositions = [-50, -20, 10, 40];
    for (const sx of shelfPositions) {
      // Shelf frame
      const frame = this.add.rectangle(sx, -8, 12, 50, METAL_MID, 0.6);
      frame.setStrokeStyle(1, METAL_LIGHT, 0.3);
      // Shelf slots (data capsule holders)
      for (let row = 0; row < 4; row++) {
        const slot = this.add.rectangle(sx, -24 + row * 12, 8, 6, 0x0d1b2a, 0.7);
        slot.setStrokeStyle(0.5, EMERALD, 0.08);
        c.add(slot);
      }
      c.add(frame);
    }

    // Scan tower (right side, tall structure)
    const tower = this.add.rectangle(62, -10, 10, 60, METAL_LIGHT, 0.6);
    tower.setStrokeStyle(1, EMERALD, 0.15);
    const towerLight = this.add.circle(62, -38, 3, EMERALD, 0.12);
    const towerBeam = this.add.rectangle(62, -5, 2, 30, EMERALD, 0);

    // Console desk (front)
    const desk = this.add.rectangle(-5, 36, 50, 12, METAL_MID, 0.6);
    desk.setStrokeStyle(1, METAL_LIGHT, 0.3);
    const screen = this.add.rectangle(-5, 33, 30, 6, EMERALD, 0.06);

    const label = this.add.text(0, 56, "ARCHIVE", {
      fontFamily: "'DM Sans', monospace",
      fontSize: "6px",
      color: "#475569",
      letterSpacing: 2,
    }).setOrigin(0.5).setAlpha(0.25);

    c.add([floor, floorSurface, tower, towerLight, towerBeam, desk, screen, label]);

    this.zones.set("archive", {
      id: "archive", cx, cy, container: c, state: "idle", accent: EMERALD,
      glowElements: [towerLight, towerBeam, screen],
    });
    this.scanBeamRef = towerBeam;
  }

  /* ──────────────────────────────────────
     ALIGNMENT GATE — Energy gate structure
     ────────────────────────────────────── */
  private buildAlignmentGate() {
    const cx = this.W * 0.62, cy = this.H * 0.38;
    const c = this.add.container(cx, cy);

    // Gate foundation
    const base = this.add.rectangle(0, 20, 100, 16, METAL_DARK, 0.65);
    base.setStrokeStyle(1, METAL_MID, 0.3);

    // Gate pillars (two tall columns)
    const pillarL = this.add.rectangle(-35, -10, 10, 60, METAL_MID, 0.7);
    pillarL.setStrokeStyle(1, AMBER, 0.1);
    const pillarR = this.add.rectangle(35, -10, 10, 60, METAL_MID, 0.7);
    pillarR.setStrokeStyle(1, AMBER, 0.1);

    // Gate arch (top beam)
    const arch = this.add.rectangle(0, -38, 80, 6, METAL_LIGHT, 0.6);
    arch.setStrokeStyle(1, AMBER, 0.12);

    // Energy field (between pillars — amber glow)
    const field = this.add.rectangle(0, -8, 56, 48, AMBER, 0);
    // Field scan lines
    for (let i = 0; i < 5; i++) {
      const line = this.add.rectangle(0, -28 + i * 12, 50, 1, AMBER, 0.04);
      c.add(line);
    }

    // Alignment rails (floor tracks through gate)
    const railL = this.add.rectangle(-12, 20, 3, 40, AMBER, 0.06);
    const railR = this.add.rectangle(12, 20, 3, 40, AMBER, 0.06);

    // Gate status indicators
    const indL = this.add.circle(-35, -38, 2.5, AMBER, 0.1);
    const indR = this.add.circle(35, -38, 2.5, AMBER, 0.1);

    const label = this.add.text(0, 34, "GATE", {
      fontFamily: "'DM Sans', monospace",
      fontSize: "6px",
      color: "#475569",
      letterSpacing: 2,
    }).setOrigin(0.5).setAlpha(0.25);

    c.add([base, pillarL, pillarR, arch, field, railL, railR, indL, indR, label]);

    this.zones.set("gate", {
      id: "gate", cx, cy, container: c, state: "idle", accent: AMBER,
      glowElements: [field, indL, indR, pillarL, pillarR],
    });
  }

  /* ──────────────────────────────────────
     REACTOR CORE — Circular chamber
     ────────────────────────────────────── */
  private buildReactorCore() {
    const cx = this.W * 0.45, cy = this.H * 0.68;
    const c = this.add.container(cx, cy);

    // Reactor pit (circular depression in floor)
    const pit = this.add.circle(0, 0, 60, FLOOR_DARK, 0.8);
    pit.setStrokeStyle(2, METAL_MID, 0.4);
    const pitInner = this.add.circle(0, 0, 50, 0x080d18, 0.9);
    pitInner.setStrokeStyle(1, VIOLET, 0.08);

    // Reactor ring (outer rotating ring)
    this.reactorRing = this.add.circle(0, 0, 45, VIOLET, 0);
    this.reactorRing.setStrokeStyle(2, VIOLET, 0.08);

    // Second ring (counter-rotate)
    this.reactorRing2 = this.add.circle(0, 0, 35, VIOLET, 0);
    this.reactorRing2.setStrokeStyle(1.5, VIOLET, 0.05);

    // Core (glowing center)
    this.reactorCore = this.add.circle(0, 0, 10, VIOLET, 0.06);
    this.reactorCore.setStrokeStyle(1.5, VIOLET, 0.1);

    // Energy pillars (4 around reactor)
    const pillarAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    for (const a of pillarAngles) {
      const px = Math.cos(a) * 55;
      const py = Math.sin(a) * 55;
      const pillar = this.add.rectangle(px, py, 6, 16, METAL_MID, 0.6);
      pillar.setAngle(Phaser.Math.RadToDeg(a) + 90);
      pillar.setStrokeStyle(1, VIOLET, 0.1);
      const pLight = this.add.circle(px, py - 3, 2, VIOLET, 0.08);
      c.add([pillar, pLight]);
    }

    // Conduit lines (floor grooves to reactor)
    const conduitG = this.add.graphics();
    conduitG.lineStyle(1, VIOLET, 0.05);
    for (const a of [Math.PI * 0.2, Math.PI * 0.7, Math.PI * 1.2, Math.PI * 1.7]) {
      conduitG.moveTo(Math.cos(a) * 20, Math.sin(a) * 20);
      conduitG.lineTo(Math.cos(a) * 58, Math.sin(a) * 58);
    }
    conduitG.strokePath();

    const label = this.add.text(0, 68, "REACTOR", {
      fontFamily: "'DM Sans', monospace",
      fontSize: "6px",
      color: "#475569",
      letterSpacing: 2,
    }).setOrigin(0.5).setAlpha(0.25);

    c.add([pit, pitInner, conduitG, this.reactorRing, this.reactorRing2, this.reactorCore, label]);

    this.zones.set("reactor", {
      id: "reactor", cx, cy, container: c, state: "idle", accent: VIOLET,
      glowElements: [this.reactorCore, this.reactorRing, this.reactorRing2],
    });
  }

  /* ──────────────────────────────────────
     REPORT BRIDGE — Console + holo display
     ────────────────────────────────────── */
  private buildReportBridge() {
    const cx = this.W * 0.82, cy = this.H * 0.56;
    const c = this.add.container(cx, cy);

    // Bridge platform (raised)
    const platform = this.add.rectangle(0, 5, 110, 80, METAL_DARK, 0.7);
    platform.setStrokeStyle(1, METAL_MID, 0.35);
    const surf = this.add.rectangle(0, 5, 100, 70, FLOOR_LIGHT, 0.4);

    // Main console desk (curved front)
    const desk = this.add.rectangle(0, 20, 70, 14, METAL_MID, 0.7);
    desk.setStrokeStyle(1, ROSE, 0.1);
    // Console screens (3 panels)
    for (let i = -1; i <= 1; i++) {
      const panel = this.add.rectangle(i * 20, 15, 16, 8, 0x0d1b2a, 0.8);
      panel.setStrokeStyle(0.5, ROSE, 0.08);
      c.add(panel);
    }

    // Holo projector frame (above desk — where result appears)
    const holoBase = this.add.rectangle(0, -8, 50, 4, METAL_LIGHT, 0.5);
    const holoL = this.add.rectangle(-24, -22, 3, 30, METAL_MID, 0.5);
    const holoR = this.add.rectangle(24, -22, 3, 30, METAL_MID, 0.5);
    const holoTop = this.add.rectangle(0, -36, 52, 3, METAL_MID, 0.4);

    // Holo field (where results project — subtle glow area)
    const holoField = this.add.rectangle(0, -20, 44, 24, ROSE, 0);

    // Bridge indicator lights
    const indL = this.add.circle(-48, -20, 2, ROSE, 0.08);
    const indR = this.add.circle(48, -20, 2, ROSE, 0.08);

    // Chair (small detail)
    const chair = this.add.rectangle(0, 30, 12, 10, METAL_MID, 0.5);

    const label = this.add.text(0, 52, "BRIDGE", {
      fontFamily: "'DM Sans', monospace",
      fontSize: "6px",
      color: "#475569",
      letterSpacing: 2,
    }).setOrigin(0.5).setAlpha(0.25);

    c.add([platform, surf, desk, holoBase, holoL, holoR, holoTop, holoField, indL, indR, chair, label]);

    this.zones.set("bridge", {
      id: "bridge", cx, cy, container: c, state: "idle", accent: ROSE,
      glowElements: [holoField, indL, indR],
    });
  }

  /* ──────────────────────────────────────
     FLOOR RAILS — Physical conveyor tracks
     ────────────────────────────────────── */
  private buildFloorRails() {
    const g = this.add.graphics();

    // Rail segments (physical tracks, not abstract lines)
    const segments = [
      { from: "dock", to: "archive" },
      { from: "archive", to: "gate" },
      { from: "gate", to: "reactor" },
      { from: "reactor", to: "bridge" },
    ];

    for (const seg of segments) {
      const fz = this.zones.get(seg.from);
      const tz = this.zones.get(seg.to);
      if (!fz || !tz) continue;

      const x1 = fz.cx, y1 = fz.cy;
      const x2 = tz.cx, y2 = tz.cy;

      // Double rail tracks (like train tracks embedded in floor)
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len * 3, ny = dx / len * 3; // perpendicular offset

      g.lineStyle(1, METAL_MID, 0.18);
      g.moveTo(x1 + nx, y1 + ny);
      g.lineTo(x2 + nx, y2 + ny);
      g.moveTo(x1 - nx, y1 - ny);
      g.lineTo(x2 - nx, y2 - ny);
      g.strokePath();

      // Cross ties (like railroad ties)
      const tieCount = Math.floor(len / 20);
      for (let i = 1; i < tieCount; i++) {
        const t = i / tieCount;
        const tx = x1 + dx * t;
        const ty = y1 + dy * t;
        g.lineStyle(1, METAL_DARK, 0.15);
        g.moveTo(tx + nx * 1.5, ty + ny * 1.5);
        g.lineTo(tx - nx * 1.5, ty - ny * 1.5);
        g.strokePath();
      }
    }
  }

  /* ══════════════════════════════════════
     AGENTS — Prominent astronaut characters
     ══════════════════════════════════════ */
  private buildAgents() {
    for (const def of this.script.agents) {
      const px = def.startX * this.W;
      const py = def.startY * this.H;
      const outer = this.add.container(px, py);

      // Shadow (ground contact)
      const shadow = this.add.ellipse(0, 22, 26, 8, 0x000000, 0.3);

      // Character body container (for bobbing)
      const body = this.add.container(0, 0);

      // Legs (two small rectangles)
      const legL = this.add.rectangle(-5, 14, 5, 10, def.color, 0.6);
      const legR = this.add.rectangle(5, 14, 5, 10, def.color, 0.6);

      // Torso (suit body — larger!)
      const torso = this.add.rectangle(0, 2, 20, 22, def.color, 0.85);
      torso.setStrokeStyle(1, 0xffffff, 0.12);

      // Suit chest detail
      const chestPanel = this.add.rectangle(0, 0, 12, 8, def.color, 0.5);
      chestPanel.setStrokeStyle(0.5, 0xffffff, 0.15);

      // Backpack (equipment)
      const backpack = this.add.rectangle(10, 0, 6, 14, def.color, 0.5);
      backpack.setStrokeStyle(0.5, 0xffffff, 0.08);

      // Head (helmet — bigger!)
      const helmet = this.add.rectangle(0, -16, 18, 16, def.color, 0.95);
      helmet.setStrokeStyle(1.5, 0xffffff, 0.2);

      // Visor (dark glass)
      const visor = this.add.rectangle(0, -15, 12, 8, 0x0a0e1a, 0.85);
      visor.setStrokeStyle(0.5, 0xffffff, 0.15);

      // Eyes (inside visor)
      const eyeL = this.add.circle(-3, -15, 1.5, 0xffffff, 0.85);
      const eyeR = this.add.circle(3, -15, 1.5, 0xffffff, 0.85);

      // Antenna
      const antenna = this.add.rectangle(6, -26, 1.5, 6, METAL_LIGHT, 0.5);
      const antennaTop = this.add.circle(6, -29, 2, def.color, 0.6);

      // Name badge (on suit, very small)
      const badge = this.add.text(0, 32, def.nameKo, {
        fontFamily: "'Noto Sans KR', sans-serif",
        fontSize: "9px",
        fontStyle: "600",
        color: "#94a3b8",
      }).setOrigin(0.5).setAlpha(0.6);

      body.add([legL, legR, torso, chestPanel, backpack, helmet, visor, eyeL, eyeR, antenna, antennaTop]);
      outer.add([shadow, body, badge]);

      this.agents.set(def.id, {
        id: def.id,
        container: outer,
        color: def.color,
        anim: "idle",
        carrying: false,
        carryBox: null,
        walkTarget: null,
        workTimer: 0,
        bobPhase: Math.random() * Math.PI * 2,
        shadow,
        body,
      });
    }
  }

  /* ══════════════════════════════════════
     CARGO PODS — Data containers
     ══════════════════════════════════════ */
  private buildCargoPods() {
    for (const def of this.script.cargos) {
      const px = def.homeX * this.W;
      const py = def.homeY * this.H;
      const c = this.add.container(px, py);

      // Pod body (small hexagonal-ish crate)
      const podBody = this.add.rectangle(0, 0, 18, 16, METAL_MID, 0.7);
      podBody.setStrokeStyle(1, METAL_LIGHT, 0.3);

      // Pod cap (top lid)
      const cap = this.add.rectangle(0, -6, 14, 4, METAL_LIGHT, 0.5);

      // Status stripe
      const stripe = this.add.rectangle(0, 2, 12, 2, EMERALD, 0);

      // Pod shadow
      const podShadow = this.add.ellipse(0, 12, 16, 4, 0x000000, 0.2);

      // Label (tiny, only visible when scanned)
      const label = this.add.text(0, 16, def.labelKo, {
        fontFamily: "'Noto Sans KR', sans-serif",
        fontSize: "7px",
        color: "#64748b",
      }).setOrigin(0.5).setAlpha(0);

      c.add([podShadow, podBody, cap, stripe, label]);
      c.setAlpha(0.35);

      this.cargos.set(def.id, {
        id: def.id,
        container: c,
        state: "dormant",
        homeX: px,
        homeY: py,
      });
    }
  }

  /* ══════════════════════════════════════
     HUD — Diegetic station readout
     ══════════════════════════════════════ */
  private buildHUD() {
    const W = this.W, H = this.H;

    // Bottom console strip (looks like a station panel, not UI overlay)
    const consoleBg = this.add.rectangle(W / 2, H - 20, W - 40, 24, METAL_DARK, 0.75);
    consoleBg.setStrokeStyle(1, METAL_MID, 0.3);

    // Console rivets
    this.add.circle(28, H - 20, 1.5, METAL_MID, 0.4);
    this.add.circle(W - 28, H - 20, 1.5, METAL_MID, 0.4);

    // Zone status lights (embedded in console)
    const dotsX = 50;
    const colors = [CYAN, EMERALD, AMBER, VIOLET, ROSE];
    for (let i = 0; i < 5; i++) {
      const dot = this.add.circle(dotsX + i * 12, H - 20, 3, colors[i], 0.1);
      dot.setStrokeStyle(0.5, colors[i], 0.08);
      this.hudDots.push(dot);
    }

    // Phase display
    this.hudPhaseLabel = this.add.text(130, H - 25, "", {
      fontFamily: "'Noto Sans KR', 'DM Sans', sans-serif",
      fontSize: "9px",
      fontStyle: "700",
      color: "#cbd5e1",
    });

    this.hudDesc = this.add.text(130, H - 15, "", {
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: "7px",
      color: "#475569",
    });

    // Progress bar
    const barX = W - 160;
    this.add.rectangle(barX + 50, H - 20, 100, 3, METAL_MID, 0.4);
    this.hudProgressBar = this.add.rectangle(barX, H - 20, 0, 3, ACCENT_GLOW, 0.6);
    this.hudProgressBar.setOrigin(0, 0.5);
  }

  /* ══════════════════════════════════════
     ZONE STATE TRANSITIONS
     ══════════════════════════════════════ */
  private setZoneState(id: string, state: ZoneState) {
    const z = this.zones.get(id);
    if (!z || z.state === state) return;
    z.state = state;

    const glowAlpha =
      state === "idle" ? 0 :
      state === "active" ? 0.15 :
      state === "processing" ? 0.35 :
      0.12;

    for (const el of z.glowElements) {
      if (el instanceof Phaser.GameObjects.Arc) {
        (el as Phaser.GameObjects.Arc).setAlpha(glowAlpha);
        if (state === "processing") {
          (el as Phaser.GameObjects.Arc).setStrokeStyle(2, z.accent, 0.5);
        }
      } else if (el instanceof Phaser.GameObjects.Rectangle) {
        (el as Phaser.GameObjects.Rectangle).setFillStyle(z.accent, glowAlpha);
      }
    }

    // Reactor special: core glow
    if (id === "reactor") {
      const coreAlpha = state === "processing" ? 0.3 : state === "active" ? 0.12 : 0.06;
      this.reactorCore.setFillStyle(VIOLET, coreAlpha);
      this.reactorRing.setStrokeStyle(2, VIOLET, state === "processing" ? 0.25 : 0.08);
      this.reactorRing2.setStrokeStyle(1.5, VIOLET, state === "processing" ? 0.18 : 0.05);
    }
  }

  /* ══════════════════════════════════════
     AGENT LOGIC
     ══════════════════════════════════════ */
  private agentWalkTo(id: string, fx: number, fy: number) {
    const a = this.agents.get(id);
    if (!a) return;
    a.walkTarget = { x: fx * this.W, y: fy * this.H };
    a.anim = a.carrying ? "carry" : "walk";
  }

  private updateAgents(deltaMs: number) {
    const dt = deltaMs / 1000;
    for (const a of this.agents.values()) {
      a.bobPhase += deltaMs * 0.004;

      if (a.walkTarget) {
        const dx = a.walkTarget.x - a.container.x;
        const dy = a.walkTarget.y - a.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 3) {
          a.container.x = a.walkTarget.x;
          a.container.y = a.walkTarget.y;
          a.walkTarget = null;
          if (!a.carrying) a.anim = "idle";
        } else {
          const move = WALK_SPEED * dt;
          const r = Math.min(move / dist, 1);
          a.container.x += dx * r;
          a.container.y += dy * r;
          // Lean
          a.body.setAngle(dx > 0 ? 4 : -4);
        }
      } else {
        a.body.setAngle(0);
      }

      // Work timer
      if (a.anim === "work" && a.workTimer > 0) {
        a.workTimer -= deltaMs;
        if (a.workTimer <= 0) {
          a.anim = a.carrying ? "carry" : "idle";
        }
      }

      // Animations
      const bob = Math.sin(a.bobPhase);
      switch (a.anim) {
        case "idle":
          a.body.y = bob * 0.5;
          break;
        case "walk":
          a.body.y = Math.abs(bob) * 2;
          break;
        case "carry":
          a.body.y = Math.abs(bob) * 1.5;
          if (a.carryBox) a.carryBox.y = -36 + Math.sin(a.bobPhase * 1.3) * 2;
          break;
        case "work":
          a.body.y = bob * 0.8;
          a.body.scaleX = 1 + Math.sin(a.bobPhase * 2) * 0.04;
          break;
      }
      if (a.anim !== "work") a.body.scaleX = 1;
    }
  }

  /* ══════════════════════════════════════
     CARGO STATE
     ══════════════════════════════════════ */
  private setCargoState(id: string, state: CargoState) {
    const cargo = this.cargos.get(id);
    if (!cargo) return;
    cargo.state = state;

    const c = cargo.container;
    const children = c.list;

    switch (state) {
      case "dormant":
        c.setVisible(true).setAlpha(0.35);
        c.x = cargo.homeX;
        c.y = cargo.homeY;
        break;
      case "scanned":
        c.setVisible(true).setAlpha(1);
        // Flash effect
        this.tweens.add({ targets: c, scaleX: 1.3, scaleY: 1.3, duration: 150, yoyo: true, ease: "Cubic.easeOut" });
        // Show label
        if (children[4]) (children[4] as Phaser.GameObjects.Text).setAlpha(0.6);
        // Color stripe
        if (children[3]) (children[3] as Phaser.GameObjects.Rectangle).setFillStyle(EMERALD, 0.4);
        break;
      case "carried":
        c.setVisible(false);
        break;
      case "gated": {
        c.setVisible(true).setAlpha(1);
        const gz = this.zones.get("gate")!;
        const idx = this.script.cargos.findIndex(cd => cd.id === id);
        c.x = gz.cx - 24 + idx * 16;
        c.y = gz.cy;
        if (children[3]) (children[3] as Phaser.GameObjects.Rectangle).setFillStyle(AMBER, 0.4);
        break;
      }
      case "reacted": {
        c.setVisible(true).setAlpha(1);
        const rz = this.zones.get("reactor")!;
        const rIdx = this.script.cargos.findIndex(cd => cd.id === id);
        const angle = (rIdx / this.script.cargos.length) * Math.PI * 2;
        c.x = rz.cx + Math.cos(angle) * 35;
        c.y = rz.cy + Math.sin(angle) * 35;
        if (children[3]) (children[3] as Phaser.GameObjects.Rectangle).setFillStyle(VIOLET, 0.4);
        break;
      }
      case "delivered": {
        c.setVisible(true).setAlpha(0.5);
        const bz = this.zones.get("bridge")!;
        const bIdx = this.script.cargos.findIndex(cd => cd.id === id);
        c.x = bz.cx - 15 + bIdx * 12;
        c.y = bz.cy + 10;
        if (children[3]) (children[3] as Phaser.GameObjects.Rectangle).setFillStyle(ROSE, 0.3);
        break;
      }
    }
  }

  private moveAllCargo(fx: number, fy: number) {
    const tx = fx * this.W, ty = fy * this.H;
    let i = 0;
    for (const cargo of this.cargos.values()) {
      if (cargo.state === "gated" || cargo.state === "carried") {
        cargo.container.setVisible(true).setAlpha(1);
        this.tweens.add({
          targets: cargo.container,
          x: tx - 20 + i * 14, y: ty,
          duration: 800, ease: "Cubic.easeInOut", delay: i * 80,
        });
        i++;
      }
    }
  }

  /* ══════════════════════════════════════
     CARDS
     ══════════════════════════════════════ */
  private spawnCard(id: string, fx: number, fy: number, label: string) {
    const px = fx * this.W, py = fy * this.H;
    const c = this.add.container(px, py);

    const bg = this.add.rectangle(0, 0, 70, 40, 0x0c3547, 0.9);
    bg.setStrokeStyle(1.5, CYAN, 0.4);
    const text = this.add.text(0, 0, label, {
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: "8px",
      fontStyle: "600",
      color: "#e0f2fe",
      align: "center",
    }).setOrigin(0.5);

    c.add([bg, text]).setAlpha(0).setScale(0.3);

    this.tweens.add({
      targets: c, alpha: 1, scaleX: 1, scaleY: 1,
      x: Math.max(fx, 0.10) * this.W, y: py,
      duration: 500, ease: "Back.easeOut",
    });

    this.cards.set(id, { container: c, revealed: false });
  }

  private revealCard(id: string) {
    const card = this.cards.get(id);
    if (!card) return;
    card.revealed = true;
    const bg = card.container.list[0] as Phaser.GameObjects.Rectangle;
    bg.setFillStyle(0x4c0519, 0.9);
    bg.setStrokeStyle(2, ROSE, 0.7);
    this.tweens.add({ targets: card.container, scaleX: 1.2, scaleY: 1.2, duration: 400, yoyo: true, ease: "Cubic.easeOut" });
  }

  /* ══════════════════════════════════════
     EFFECTS
     ══════════════════════════════════════ */
  private playEffect(zoneId: string, fx: string, _x?: number, _y?: number) {
    const zone = this.zones.get(zoneId);

    switch (fx) {
      case "docking-arm": {
        if (!zone) return;
        const arm = this.add.rectangle(zone.cx - 55, zone.cy, 0, 4, CYAN, 0.5);
        arm.setOrigin(0, 0.5);
        this.tweens.add({ targets: arm, width: 30, duration: 500, yoyo: true, hold: 200, ease: "Cubic.easeOut", onComplete: () => arm.destroy() });
        break;
      }
      case "scan-beam": {
        if (!zone || !this.scanBeamRef) return;
        // Animate scan tower beam
        this.tweens.add({ targets: this.scanBeamRef, fillAlpha: 0.2, duration: 400, yoyo: true, repeat: 2, ease: "Sine.easeInOut" });
        break;
      }
      case "align-pulse": {
        if (!zone) return;
        for (let i = 0; i < 3; i++) {
          const ring = this.add.circle(zone.cx, zone.cy, 8, AMBER, 0);
          ring.setStrokeStyle(1.5, AMBER, 0.3);
          this.tweens.add({ targets: ring, scaleX: 4, scaleY: 4, alpha: 0, duration: 700, delay: i * 200, ease: "Cubic.easeOut", onComplete: () => ring.destroy() });
        }
        break;
      }
      case "reactor-spin": {
        // Handled in animateWorld
        break;
      }
      case "reactor-burst": {
        if (!zone) return;
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          const p = this.add.circle(zone.cx, zone.cy, 2.5, 0xc084fc, 0.7);
          this.tweens.add({ targets: p, x: zone.cx + Math.cos(a) * 55, y: zone.cy + Math.sin(a) * 55, alpha: 0, duration: 500, ease: "Cubic.easeOut", onComplete: () => p.destroy() });
        }
        break;
      }
      case "assemble": {
        if (!zone) return;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const p = this.add.circle(zone.cx + Math.cos(a) * 40, zone.cy + Math.sin(a) * 40, 2, ROSE, 0.6);
          this.tweens.add({ targets: p, x: zone.cx, y: zone.cy, alpha: 0, duration: 500, delay: i * 60, ease: "Cubic.easeIn", onComplete: () => p.destroy() });
        }
        break;
      }
      case "celebration": {
        if (!zone) return;
        const colors = [CYAN, EMERALD, AMBER, VIOLET, ROSE];
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2;
          const p = this.add.circle(zone.cx, zone.cy, 2, colors[i % 5], 0.8);
          this.tweens.add({ targets: p, x: zone.cx + Math.cos(a) * Phaser.Math.Between(30, 55), y: zone.cy + Math.sin(a) * Phaser.Math.Between(30, 55), alpha: 0, duration: 700, delay: i * 30, onComplete: () => p.destroy() });
        }
        break;
      }
      case "flash": {
        const ffx = (_x ?? 0.5) * this.W, ffy = (_y ?? 0.5) * this.H;
        const fl = this.add.circle(ffx, ffy, 6, 0xffffff, 0.5);
        this.tweens.add({ targets: fl, scaleX: 3, scaleY: 3, alpha: 0, duration: 250, onComplete: () => fl.destroy() });
        break;
      }
    }
  }

  /* ══════════════════════════════════════
     WORLD ANIMATION (ambient)
     ══════════════════════════════════════ */
  private animateWorld(_deltaMs: number) {
    const t = performance.now() * 0.001;

    // Star twinkle
    for (const s of this.starField) {
      s.g.setAlpha(s.baseAlpha * (0.6 + 0.4 * Math.sin(t * 1.5 + s.g.x * 0.1)));
    }

    // Reactor rings rotation (always turning slowly, faster when processing)
    const rz = this.zones.get("reactor");
    const speed = rz?.state === "processing" ? 1.2 : 0.15;
    this.reactorRing.setAngle(t * 20 * speed);
    this.reactorRing2.setAngle(-t * 14 * speed);

    // Reactor core pulse
    if (rz?.state === "processing") {
      const pulse = 0.2 + Math.sin(t * 4) * 0.1;
      this.reactorCore.setFillStyle(VIOLET, pulse);
    }

    // Cargo orbit in reactor
    for (const cargo of this.cargos.values()) {
      if (cargo.state === "reacted") {
        const rzPos = this.zones.get("reactor")!;
        const idx = this.script.cargos.findIndex(c => c.id === cargo.id);
        const baseAngle = (idx / this.script.cargos.length) * Math.PI * 2;
        const angle = baseAngle + t * 0.8;
        cargo.container.x = rzPos.cx + Math.cos(angle) * 35;
        cargo.container.y = rzPos.cy + Math.sin(angle) * 35;
      }
    }

    // Floor light pulse
    for (let i = 0; i < this.floorLights.length; i++) {
      const fl = this.floorLights[i];
      if (fl instanceof Phaser.GameObjects.Arc) {
        fl.setAlpha(0.03 + Math.sin(t * 2 + i * 0.5) * 0.02);
      }
    }
  }

  /* ══════════════════════════════════════
     COMMAND EXECUTOR
     ══════════════════════════════════════ */
  private executeCommand(cmd: PhaseCmd) {
    const p = cmd.params;
    switch (cmd.type) {
      case "zone-state":
        this.setZoneState(cmd.target, p.state as ZoneState);
        break;
      case "agent-walk":
        this.agentWalkTo(cmd.target, p.toX as number, p.toY as number);
        break;
      case "agent-work": {
        const a = this.agents.get(cmd.target);
        if (a) { a.anim = "work"; a.workTimer = (p.duration as number) * 1000; }
        break;
      }
      case "agent-carry": {
        const a = this.agents.get(cmd.target);
        if (a) {
          a.carrying = true; a.anim = "carry";
          if (!a.carryBox) {
            const box = this.add.container(0, -36);
            const bg = this.add.rectangle(0, 0, 12, 10, 0x38bdf8, 0.7);
            bg.setStrokeStyle(1, 0xffffff, 0.3);
            box.add(bg);
            a.body.add(box);
            a.carryBox = box;
          }
        }
        break;
      }
      case "agent-drop": {
        const a = this.agents.get(cmd.target);
        if (a) {
          a.carrying = false; a.anim = "idle";
          if (a.carryBox) { a.carryBox.destroy(); a.carryBox = null; }
        }
        break;
      }
      case "cargo-state":
        this.setCargoState(cmd.target, p.state as CargoState);
        break;
      case "cargo-move":
        this.moveAllCargo(p.toX as number, p.toY as number);
        break;
      case "spawn-card":
        this.spawnCard(cmd.target, p.x as number, p.y as number, p.label as string);
        break;
      case "reveal-card":
        this.revealCard(cmd.target);
        break;
      case "effect":
        this.playEffect(cmd.target, p.fx as string, p.x as number | undefined, p.y as number | undefined);
        break;
    }
  }

  /* ══════════════════════════════════════
     PHASE DIRECTOR
     ══════════════════════════════════════ */
  private resetPhases() {
    this.phase = { phaseIndex: 0, phaseElapsed: 0, totalElapsed: 0, firedCmds: new Set() };
    for (const z of this.zones.values()) this.setZoneState(z.id, "idle");
    for (const c of this.cargos.values()) this.setCargoState(c.id, "dormant");
    for (const a of this.agents.values()) {
      const def = this.script.agents.find(d => d.id === a.id)!;
      a.container.x = def.startX * this.W;
      a.container.y = def.startY * this.H;
      a.anim = "idle"; a.carrying = false; a.walkTarget = null; a.workTimer = 0;
      if (a.carryBox) { a.carryBox.destroy(); a.carryBox = null; }
    }
    for (const card of this.cards.values()) card.container.destroy();
    this.cards.clear();
    this.updateHUD();
  }

  private tickPhases(deltaSec: number) {
    const phases = this.script.phases;
    if (this.phase.phaseIndex >= phases.length) { this.resetPhases(); return; }
    const cur = phases[this.phase.phaseIndex];
    this.phase.phaseElapsed += deltaSec;
    this.phase.totalElapsed += deltaSec;

    for (let i = 0; i < cur.commands.length; i++) {
      const cmd = cur.commands[i];
      const key = `${this.phase.phaseIndex}:${i}`;
      if (cmd.at <= this.phase.phaseElapsed && !this.phase.firedCmds.has(key)) {
        this.phase.firedCmds.add(key);
        this.executeCommand(cmd);
      }
    }

    if (this.phase.phaseElapsed >= cur.durationSec) {
      this.phase.phaseElapsed -= cur.durationSec;
      this.phase.phaseIndex++;
    }
    this.updateHUD();
  }

  private updateHUD() {
    const phases = this.script.phases;
    const idx = Math.min(this.phase.phaseIndex, phases.length - 1);
    const p = phases[idx];
    this.hudPhaseLabel.setText(`${String(idx + 1).padStart(2, "0")}  ${p.labelKo}`);
    this.hudDesc.setText(p.description);

    const total = phases.reduce((a, ph) => a + ph.durationSec, 0);
    this.hudProgressBar.width = 100 * Math.min(this.phase.totalElapsed / total, 1);

    const zoneIds = ["dock", "archive", "gate", "reactor", "bridge"];
    for (let i = 0; i < zoneIds.length; i++) {
      const z = this.zones.get(zoneIds[i]);
      if (!z) continue;
      const alpha = z.state === "complete" ? 0.7 : z.state === "processing" ? 0.5 : z.state === "active" ? 0.3 : 0.08;
      this.hudDots[i]?.setAlpha(alpha);
    }
  }

  /* ══════════════════════════════════════
     UPDATE LOOP
     ══════════════════════════════════════ */
  update() {
    if (!this.script || !this.W) return;
    const now = performance.now();
    const deltaMs = Math.min(now - this.lastTime, 100);
    this.lastTime = now;
    this.tickPhases(deltaMs / 1000);
    this.updateAgents(deltaMs);
    this.animateWorld(deltaMs);
  }
}
