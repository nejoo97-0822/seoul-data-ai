/**
 * ZoneRenderer — creates and manages persistent zone visuals.
 *
 * Each zone is always visible. Only its visual STATE changes:
 *   idle → active → processing → complete
 *
 * Drawn as rounded rectangles with corner brackets, label, and internal detail.
 */

import { Container, Graphics, Text } from "pixi.js";
import type { WorldZoneDefinition, ZoneState } from "../core/types";

export interface ZoneRuntime {
  def: WorldZoneDefinition;
  container: Container;
  state: ZoneState;
  // Sub-elements for state transitions
  body: Graphics;
  border: Graphics;
  brackets: Graphics;
  labelText: Text;
  stateIcon: Graphics;
  glowRing: Graphics;
  // Internal detail dots
  dots: Container;
}

const BRACKET_LEN = 14;

export class ZoneRenderer {
  private zones = new Map<string, ZoneRuntime>();
  private stageW: number;
  private stageH: number;
  public container: Container;

  constructor(
    zoneDefs: WorldZoneDefinition[],
    stageW: number,
    stageH: number,
    fontFamily: string
  ) {
    this.stageW = stageW;
    this.stageH = stageH;
    this.container = new Container();

    for (const def of zoneDefs) {
      const zone = this.createZone(def, fontFamily);
      this.zones.set(def.id, zone);
      this.container.addChild(zone.container);
    }
  }

  private createZone(def: WorldZoneDefinition, fontFamily: string): ZoneRuntime {
    const c = new Container();
    const w = def.size.x;
    const h = def.size.y;
    const cx = def.center.x * this.stageW;
    const cy = def.center.y * this.stageH;
    const accentNum = parseInt(def.accent.replace("#", ""), 16);

    c.x = cx;
    c.y = cy;

    // Glow ring (hidden by default, shown on active/processing)
    const glowRing = new Graphics();
    glowRing.roundRect(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 18);
    glowRing.fill({ color: accentNum, alpha: 0 });
    c.addChild(glowRing);

    // Body fill
    const body = new Graphics();
    body.roundRect(-w / 2, -h / 2, w, h, 12);
    body.fill({ color: 0xffffff, alpha: 0.20 });
    c.addChild(body);

    // Border
    const border = new Graphics();
    border.roundRect(-w / 2, -h / 2, w, h, 12);
    border.stroke({ color: accentNum, width: 1, alpha: 0.12 });
    c.addChild(border);

    // Corner brackets
    const brackets = new Graphics();
    const pad = 4;
    const corners = [
      { x: -w / 2 + pad, y: -h / 2 + pad, dx: 1, dy: 1 },
      { x: w / 2 - pad, y: -h / 2 + pad, dx: -1, dy: 1 },
      { x: -w / 2 + pad, y: h / 2 - pad, dx: 1, dy: -1 },
      { x: w / 2 - pad, y: h / 2 - pad, dx: -1, dy: -1 },
    ];
    for (const corner of corners) {
      brackets.moveTo(corner.x, corner.y + corner.dy * BRACKET_LEN);
      brackets.lineTo(corner.x, corner.y);
      brackets.lineTo(corner.x + corner.dx * BRACKET_LEN, corner.y);
      brackets.stroke({ color: accentNum, width: 1.5, alpha: 0.15 });
    }
    c.addChild(brackets);

    // Internal dots (subtle zone texture)
    const dots = new Container();
    const dotCols = Math.floor(w / 20);
    const dotRows = Math.floor(h / 20);
    for (let r = 0; r < dotRows; r++) {
      for (let col = 0; col < dotCols; col++) {
        const d = new Graphics();
        d.circle(0, 0, 1.5);
        d.fill({ color: accentNum, alpha: 0.06 });
        d.x = -w / 2 + 14 + col * ((w - 28) / Math.max(dotCols - 1, 1));
        d.y = -h / 2 + 20 + r * ((h - 36) / Math.max(dotRows - 1, 1));
        dots.addChild(d);
      }
    }
    c.addChild(dots);

    // Label
    const labelText = new Text({
      text: `${def.label}`,
      style: {
        fontFamily,
        fontSize: 8,
        fontWeight: "700",
        fill: def.accent,
        letterSpacing: 1.5,
      },
    });
    labelText.x = -w / 2 + 8;
    labelText.y = -h / 2 + 5;
    labelText.alpha = 0.25;
    c.addChild(labelText);

    // Korean sub-label
    const koLabel = new Text({
      text: def.labelKo,
      style: {
        fontFamily,
        fontSize: 10,
        fontWeight: "600",
        fill: def.accent,
      },
    });
    koLabel.anchor.set(0.5);
    koLabel.y = h / 2 + 12;
    koLabel.alpha = 0.35;
    c.addChild(koLabel);

    // State icon (checkmark/spinner placeholder)
    const stateIcon = new Graphics();
    stateIcon.alpha = 0;
    c.addChild(stateIcon);

    return {
      def,
      container: c,
      state: "idle",
      body,
      border,
      brackets,
      labelText,
      stateIcon,
      glowRing,
      dots,
    };
  }

  /** Transition zone to new state with visual update */
  setState(zoneId: string, newState: ZoneState) {
    const zone = this.zones.get(zoneId);
    if (!zone || zone.state === newState) return;
    zone.state = newState;
    this.applyVisualState(zone);
  }

  getState(zoneId: string): ZoneState {
    return this.zones.get(zoneId)?.state ?? "idle";
  }

  getZoneWorldPosition(zoneId: string): { x: number; y: number } | null {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;
    return {
      x: zone.def.center.x * this.stageW,
      y: zone.def.center.y * this.stageH,
    };
  }

  private applyVisualState(zone: ZoneRuntime) {
    const accentNum = parseInt(zone.def.accent.replace("#", ""), 16);

    switch (zone.state) {
      case "idle":
        zone.body.clear();
        zone.body.roundRect(-zone.def.size.x / 2, -zone.def.size.y / 2, zone.def.size.x, zone.def.size.y, 12);
        zone.body.fill({ color: 0xffffff, alpha: 0.20 });
        zone.border.clear();
        zone.border.roundRect(-zone.def.size.x / 2, -zone.def.size.y / 2, zone.def.size.x, zone.def.size.y, 12);
        zone.border.stroke({ color: accentNum, width: 1, alpha: 0.12 });
        zone.brackets.alpha = 0.15;
        zone.labelText.alpha = 0.25;
        zone.glowRing.clear();
        zone.glowRing.roundRect(-zone.def.size.x / 2 - 10, -zone.def.size.y / 2 - 10, zone.def.size.x + 20, zone.def.size.y + 20, 18);
        zone.glowRing.fill({ color: accentNum, alpha: 0 });
        break;

      case "active":
        zone.body.clear();
        zone.body.roundRect(-zone.def.size.x / 2, -zone.def.size.y / 2, zone.def.size.x, zone.def.size.y, 12);
        zone.body.fill({ color: accentNum, alpha: 0.06 });
        zone.border.clear();
        zone.border.roundRect(-zone.def.size.x / 2, -zone.def.size.y / 2, zone.def.size.x, zone.def.size.y, 12);
        zone.border.stroke({ color: accentNum, width: 1.5, alpha: 0.30 });
        zone.brackets.alpha = 0.4;
        zone.labelText.alpha = 0.5;
        zone.glowRing.clear();
        zone.glowRing.roundRect(-zone.def.size.x / 2 - 10, -zone.def.size.y / 2 - 10, zone.def.size.x + 20, zone.def.size.y + 20, 18);
        zone.glowRing.fill({ color: accentNum, alpha: 0.03 });
        break;

      case "processing":
        zone.body.clear();
        zone.body.roundRect(-zone.def.size.x / 2, -zone.def.size.y / 2, zone.def.size.x, zone.def.size.y, 12);
        zone.body.fill({ color: accentNum, alpha: 0.10 });
        zone.border.clear();
        zone.border.roundRect(-zone.def.size.x / 2, -zone.def.size.y / 2, zone.def.size.x, zone.def.size.y, 12);
        zone.border.stroke({ color: accentNum, width: 2, alpha: 0.45 });
        zone.brackets.alpha = 0.6;
        zone.labelText.alpha = 0.7;
        zone.glowRing.clear();
        zone.glowRing.roundRect(-zone.def.size.x / 2 - 10, -zone.def.size.y / 2 - 10, zone.def.size.x + 20, zone.def.size.y + 20, 18);
        zone.glowRing.fill({ color: accentNum, alpha: 0.06 });
        break;

      case "complete":
        zone.body.clear();
        zone.body.roundRect(-zone.def.size.x / 2, -zone.def.size.y / 2, zone.def.size.x, zone.def.size.y, 12);
        zone.body.fill({ color: accentNum, alpha: 0.04 });
        zone.border.clear();
        zone.border.roundRect(-zone.def.size.x / 2, -zone.def.size.y / 2, zone.def.size.x, zone.def.size.y, 12);
        zone.border.stroke({ color: accentNum, width: 1.5, alpha: 0.20 });
        zone.brackets.alpha = 0.3;
        zone.labelText.alpha = 0.4;
        zone.glowRing.clear();
        zone.glowRing.roundRect(-zone.def.size.x / 2 - 10, -zone.def.size.y / 2 - 10, zone.def.size.x + 20, zone.def.size.y + 20, 18);
        zone.glowRing.fill({ color: accentNum, alpha: 0.02 });
        break;
    }
  }

  /** Reset all zones to idle (for loop restart) */
  resetAll() {
    for (const zone of this.zones.values()) {
      this.setState(zone.def.id, "idle");
    }
  }
}
