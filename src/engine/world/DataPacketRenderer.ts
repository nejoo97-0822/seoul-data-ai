/**
 * DataPacketRenderer — manages data packet visuals.
 *
 * Packets live in the catalog zone as dormant dots.
 * They get found, carried by agents, processed, and delivered.
 */

import { Container, Graphics, Text } from "pixi.js";
import type { DataPacketDefinition, DataPacketVisualState, Vec2 } from "../core/types";

interface PacketRuntime {
  def: DataPacketDefinition;
  container: Container;
  dormantDot: Graphics;
  foundGlow: Container;
  state: DataPacketVisualState;
  homeX: number;
  homeY: number;
  animTimer: number;
}

export class DataPacketRenderer {
  private packets = new Map<string, PacketRuntime>();
  private stageW: number;
  private stageH: number;
  public container: Container;

  constructor(
    defs: DataPacketDefinition[],
    stageW: number,
    stageH: number,
    fontFamily: string,
    accentColor: string = "#10B981" // catalog green by default
  ) {
    this.stageW = stageW;
    this.stageH = stageH;
    this.container = new Container();

    for (const def of defs) {
      const pkt = this.createPacket(def, fontFamily, accentColor);
      this.packets.set(def.id, pkt);
      this.container.addChild(pkt.container);
    }
  }

  private createPacket(def: DataPacketDefinition, fontFamily: string, accent: string): PacketRuntime {
    const c = new Container();
    const homeX = def.homePosition.x * this.stageW;
    const homeY = def.homePosition.y * this.stageH;
    const accentNum = parseInt(accent.replace("#", ""), 16);
    c.x = homeX;
    c.y = homeY;

    // Dormant dot (small, dim)
    const dormantDot = new Graphics();
    dormantDot.circle(0, 0, 4);
    dormantDot.fill({ color: accentNum, alpha: 0.15 });
    dormantDot.circle(0, 0, 2);
    dormantDot.fill({ color: accentNum, alpha: 0.25 });
    c.addChild(dormantDot);

    // Found glow (hidden initially)
    const foundGlow = new Container();
    foundGlow.visible = false;

    const outerGlow = new Graphics();
    outerGlow.circle(0, 0, 12);
    outerGlow.fill({ color: accentNum, alpha: 0.08 });
    foundGlow.addChild(outerGlow);

    const midGlow = new Graphics();
    midGlow.circle(0, 0, 7);
    midGlow.fill({ color: accentNum, alpha: 0.15 });
    foundGlow.addChild(midGlow);

    const core = new Graphics();
    core.circle(0, 0, 4);
    core.fill({ color: accentNum, alpha: 0.7 });
    foundGlow.addChild(core);

    const whiteCenter = new Graphics();
    whiteCenter.circle(0, 0, 1.5);
    whiteCenter.fill({ color: 0xffffff, alpha: 0.8 });
    foundGlow.addChild(whiteCenter);

    // Label
    const label = new Text({
      text: def.labelKo,
      style: { fontFamily, fontSize: 7, fontWeight: "600", fill: accent },
    });
    label.anchor.set(0.5, 0);
    label.y = 8;
    label.alpha = 0.7;
    foundGlow.addChild(label);

    c.addChild(foundGlow);

    return {
      def,
      container: c,
      dormantDot,
      foundGlow,
      state: "dormant",
      homeX,
      homeY,
      animTimer: 0,
    };
  }

  setState(packetId: string, newState: DataPacketVisualState) {
    const pkt = this.packets.get(packetId);
    if (!pkt) return;
    pkt.state = newState;

    switch (newState) {
      case "dormant":
        pkt.dormantDot.visible = true;
        pkt.foundGlow.visible = false;
        pkt.container.alpha = 1;
        pkt.container.visible = true;
        break;
      case "found":
        pkt.dormantDot.visible = false;
        pkt.foundGlow.visible = true;
        pkt.container.alpha = 1;
        pkt.container.visible = true;
        break;
      case "carried":
        // Hide — agent carry indicator shows instead
        pkt.container.visible = false;
        break;
      case "processing":
        pkt.dormantDot.visible = false;
        pkt.foundGlow.visible = true;
        pkt.container.visible = true;
        pkt.container.alpha = 0.8;
        break;
      case "combined":
        pkt.container.visible = false;
        break;
      case "delivered":
        pkt.dormantDot.visible = false;
        pkt.foundGlow.visible = true;
        pkt.container.visible = true;
        pkt.container.alpha = 0.5;
        break;
    }
  }

  /** Move packet to a position (stage pixels) */
  setPosition(packetId: string, x: number, y: number) {
    const pkt = this.packets.get(packetId);
    if (!pkt) return;
    pkt.container.x = x;
    pkt.container.y = y;
  }

  /** Arrange processing packets around a zone center */
  arrangeAtZone(packetIds: string[], zoneCenterX: number, zoneCenterY: number, radius: number = 25) {
    for (let i = 0; i < packetIds.length; i++) {
      const angle = (i / packetIds.length) * Math.PI * 2 - Math.PI / 2;
      const x = zoneCenterX + Math.cos(angle) * radius;
      const y = zoneCenterY + Math.sin(angle) * radius;
      this.setPosition(packetIds[i], x, y);
    }
  }

  /** Per-frame animation update */
  tick(deltaSec: number) {
    for (const pkt of this.packets.values()) {
      pkt.animTimer += deltaSec;
      if (pkt.state === "processing") {
        // Gentle orbit
        const angle = pkt.animTimer * 1.5;
        pkt.container.rotation = angle * 0.1;
        pkt.foundGlow.scale.set(1 + Math.sin(pkt.animTimer * 3) * 0.1);
      } else if (pkt.state === "found") {
        // Gentle float
        pkt.container.y = pkt.homeY + Math.sin(pkt.animTimer * 2) * 2;
      }
    }
  }

  /** Reset all to dormant at home positions */
  resetAll() {
    for (const pkt of this.packets.values()) {
      pkt.container.x = pkt.homeX;
      pkt.container.y = pkt.homeY;
      pkt.container.visible = true;
      pkt.container.alpha = 1;
      pkt.container.rotation = 0;
      pkt.animTimer = 0;
      this.setState(pkt.def.id, "dormant");
    }
  }
}
