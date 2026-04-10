/**
 * StageBackdropActor — scene-specific background environment.
 *
 * Not decoration, but spatial context.
 * Each variant communicates "what kind of space is this?"
 *
 * Variants:
 *  - intake    → reception desk / intake counter with docking slots
 *  - hub       → conveyor rails / routing grid / flow arrows
 *  - archive   → shelf racks / scan field / storage depth
 *  - calibrate → ruler lines / alignment guides / measurement ticks
 *  - reactor   → radial lines / concentric guides / energy field
 *  - assembly  → construction rails / snap grid / docking arms
 *  - stage     → presentation spotlight / reveal pedestal
 */

import { Container, Graphics, Text } from "pixi.js";
import { registerActor, skinColor } from "../ActorFactory";
import type { ActorDefinition, ThemeDefinition } from "../../core/types";

function seededRandom(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

registerActor(
  "backdrop",
  (def: ActorDefinition, theme: ThemeDefinition, stageW: number, stageH: number) => {
    const container = new Container();
    const variant = (def.data?.variant as string) ?? "hub";
    const accent = (def.data?.accent as string) ?? skinColor(theme, "beam", "fill");
    const accentNum = parseInt(accent.replace("#", ""), 16);
    const cx = stageW / 2;
    const cy = stageH / 2;

    const g = new Graphics();

    switch (variant) {

      // ─── INTAKE: reception counter / docking slots ───────────
      case "intake": {
        // Horizontal intake rail (the "counter")
        const railY = cy + 20;
        g.moveTo(40, railY);
        g.lineTo(stageW - 40, railY);
        g.stroke({ color: accentNum, width: 1, alpha: 0.08 });

        // Docking slots along the rail
        for (let i = 0; i < 5; i++) {
          const x = 100 + i * (stageW - 200) / 4;
          // Slot bracket
          g.roundRect(x - 18, railY - 8, 36, 16, 3);
          g.stroke({ color: accentNum, width: 1, alpha: 0.06 });
          // Slot dot
          g.circle(x, railY, 2);
          g.fill({ color: accentNum, alpha: 0.10 });
        }

        // Vertical feed lines from top
        for (let i = 0; i < 3; i++) {
          const x = cx - 80 + i * 80;
          g.moveTo(x, 30);
          g.lineTo(x, railY - 20);
          g.stroke({ color: accentNum, width: 0.5, alpha: 0.04 });
          // Arrow head
          g.moveTo(x - 4, railY - 28);
          g.lineTo(x, railY - 20);
          g.lineTo(x + 4, railY - 28);
          g.stroke({ color: accentNum, width: 0.5, alpha: 0.06 });
        }

        // City grid hint (top) — abstract Seoul silhouette
        const skylineY = 35;
        const blocks = [40, 28, 55, 35, 48, 30, 60, 25, 42, 50, 32, 45, 38, 52];
        const blockW = (stageW - 80) / blocks.length;
        for (let i = 0; i < blocks.length; i++) {
          const bx = 40 + i * blockW;
          const bh = blocks[i] * 0.4;
          g.rect(bx + 2, skylineY - bh, blockW - 4, bh);
          g.fill({ color: accentNum, alpha: 0.02 + seededRandom(i, 99) * 0.02 });
        }
        break;
      }

      // ─── HUB: conveyor rails / routing grid ─────────────────
      case "hub": {
        // Main horizontal conveyor rail
        const mainY = cy + 15;
        g.moveTo(0, mainY);
        g.lineTo(stageW, mainY);
        g.stroke({ color: accentNum, width: 1.5, alpha: 0.07 });

        // Rail tick marks
        for (let x = 20; x < stageW; x += 24) {
          g.moveTo(x, mainY - 3);
          g.lineTo(x, mainY + 3);
          g.stroke({ color: accentNum, width: 0.5, alpha: 0.06 });
        }

        // Secondary rails (upper, lower)
        for (const offset of [-60, 60]) {
          g.moveTo(60, mainY + offset);
          g.lineTo(stageW - 60, mainY + offset);
          g.stroke({ color: accentNum, width: 0.5, alpha: 0.04 });
        }

        // Routing junction nodes
        for (let i = 0; i < 4; i++) {
          const nx = stageW * (0.2 + i * 0.2);
          g.circle(nx, mainY, 6);
          g.stroke({ color: accentNum, width: 1, alpha: 0.06 });
          g.circle(nx, mainY, 2);
          g.fill({ color: accentNum, alpha: 0.08 });
          // Vertical connectors
          g.moveTo(nx, mainY - 60);
          g.lineTo(nx, mainY + 60);
          g.stroke({ color: accentNum, width: 0.5, alpha: 0.03 });
        }

        // Flow direction arrows
        for (let i = 0; i < 3; i++) {
          const ax = stageW * (0.3 + i * 0.2);
          g.moveTo(ax - 6, mainY - 1.5);
          g.lineTo(ax, mainY - 4);
          g.lineTo(ax + 6, mainY - 1.5);
          g.stroke({ color: accentNum, width: 0.8, alpha: 0.08 });
        }
        break;
      }

      // ─── ARCHIVE: shelf racks / scan field ──────────────────
      case "archive": {
        // Shelf rack structure (left side)
        const rackX = 30;
        const rackW = stageW - 60;
        const shelves = 6;
        const shelfH = (stageH - 80) / shelves;
        for (let s = 0; s < shelves; s++) {
          const sy = 40 + s * shelfH;
          // Shelf line
          g.moveTo(rackX, sy);
          g.lineTo(rackX + rackW, sy);
          g.stroke({ color: accentNum, width: 0.5, alpha: 0.04 });

          // Data slots on each shelf
          const slots = 10 + Math.floor(seededRandom(s, 3) * 4);
          for (let sl = 0; sl < slots; sl++) {
            const slx = rackX + 10 + sl * ((rackW - 20) / slots);
            const slH = 4 + seededRandom(s * 20 + sl, 5) * 8;
            g.rect(slx, sy - slH, 4, slH);
            g.fill({ color: accentNum, alpha: 0.02 + seededRandom(s * 20 + sl, 7) * 0.03 });
          }
        }

        // Scan field markers (corners)
        const sfPad = 50;
        const markLen = 24;
        for (const [mx, my, dx, dy] of [
          [sfPad, sfPad, 1, 1], [stageW - sfPad, sfPad, -1, 1],
          [sfPad, stageH - sfPad, 1, -1], [stageW - sfPad, stageH - sfPad, -1, -1],
        ] as [number, number, number, number][]) {
          g.moveTo(mx, my + dy * markLen);
          g.lineTo(mx, my);
          g.lineTo(mx + dx * markLen, my);
          g.stroke({ color: accentNum, width: 1, alpha: 0.08 });
        }
        break;
      }

      // ─── CALIBRATE: ruler lines / alignment guides ──────────
      case "calibrate": {
        // Horizontal ruler at center
        const rulerY = cy;
        g.moveTo(30, rulerY);
        g.lineTo(stageW - 30, rulerY);
        g.stroke({ color: accentNum, width: 0.5, alpha: 0.06 });

        // Ruler tick marks (major every 50, minor every 10)
        for (let x = 30; x < stageW - 30; x += 10) {
          const isMajor = (x - 30) % 50 === 0;
          const tickH = isMajor ? 8 : 3;
          g.moveTo(x, rulerY - tickH);
          g.lineTo(x, rulerY + tickH);
          g.stroke({ color: accentNum, width: isMajor ? 0.8 : 0.4, alpha: isMajor ? 0.08 : 0.04 });
        }

        // Vertical ruler at center
        g.moveTo(cx, 30);
        g.lineTo(cx, stageH - 30);
        g.stroke({ color: accentNum, width: 0.5, alpha: 0.06 });

        for (let y = 30; y < stageH - 30; y += 10) {
          const isMajor = (y - 30) % 50 === 0;
          const tickW = isMajor ? 8 : 3;
          g.moveTo(cx - tickW, y);
          g.lineTo(cx + tickW, y);
          g.stroke({ color: accentNum, width: isMajor ? 0.8 : 0.4, alpha: isMajor ? 0.08 : 0.04 });
        }

        // Alignment snap positions (4 columns)
        for (let i = 0; i < 4; i++) {
          const ax = stageW * (0.25 + i * 0.16);
          // Vertical guide line
          g.moveTo(ax, rulerY - 50);
          g.lineTo(ax, rulerY + 50);
          g.stroke({ color: accentNum, width: 0.5, alpha: 0.05 });
          // Snap diamond
          g.moveTo(ax, rulerY - 5);
          g.lineTo(ax + 4, rulerY);
          g.lineTo(ax, rulerY + 5);
          g.lineTo(ax - 4, rulerY);
          g.closePath();
          g.stroke({ color: accentNum, width: 0.8, alpha: 0.08 });
        }

        // "UNIT", "TIME", "KEY" zone labels
        const labels = ["UNIT", "TIME", "KEY"];
        for (let i = 0; i < 3; i++) {
          const lx = stageW * (0.28 + i * 0.2);
          const lt = new Text({
            text: labels[i],
            style: { fontFamily: theme.fontFamily, fontSize: 7, fontWeight: "600", fill: accent, letterSpacing: 1.5 },
          });
          lt.anchor.set(0.5);
          lt.x = lx;
          lt.y = rulerY - 35;
          lt.alpha = 0.12;
          container.addChild(lt);
        }
        break;
      }

      // ─── REACTOR: radial lines / energy field ───────────────
      case "reactor": {
        // Central radial glow (very soft ambient)
        g.circle(cx, cy, 180);
        g.fill({ color: accentNum, alpha: 0.015 });
        g.circle(cx, cy, 100);
        g.fill({ color: accentNum, alpha: 0.02 });

        // Concentric guide rings (enhanced visibility)
        for (const r of [40, 80, 120, 170, 230]) {
          // Glow ring (wider, softer)
          g.circle(cx, cy, r);
          g.stroke({ color: accentNum, width: 2, alpha: 0.025 });
          // Sharp ring
          g.circle(cx, cy, r);
          g.stroke({ color: accentNum, width: 0.5, alpha: 0.06 });
        }

        // Radial lines from center (16 spokes — more density)
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * Math.PI * 2;
          const inner = 30;
          const outer = 250;
          const isMajor = i % 4 === 0;
          g.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
          g.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
          g.stroke({ color: accentNum, width: isMajor ? 0.8 : 0.4, alpha: isMajor ? 0.06 : 0.03 });
        }

        // Crosshair at center (stronger)
        g.moveTo(cx - 16, cy);
        g.lineTo(cx + 16, cy);
        g.stroke({ color: accentNum, width: 1, alpha: 0.12 });
        g.moveTo(cx, cy - 16);
        g.lineTo(cx, cy + 16);
        g.stroke({ color: accentNum, width: 1, alpha: 0.12 });
        // Center dot
        g.circle(cx, cy, 3);
        g.fill({ color: accentNum, alpha: 0.10 });

        // Energy nodes at intersections (larger, more visible)
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          for (const r of [80, 170]) {
            const nx = cx + Math.cos(angle) * r;
            const ny = cy + Math.sin(angle) * r;
            // Glow halo
            g.circle(nx, ny, 5);
            g.fill({ color: accentNum, alpha: 0.03 });
            // Core dot
            g.circle(nx, ny, 2);
            g.fill({ color: accentNum, alpha: 0.10 });
          }
        }

        // Corner energy arcs (ambient field boundary)
        for (const [sx, sy] of [[0, -1], [1, 0], [0, 1], [-1, 0]] as [number, number][]) {
          const ax = cx + sx * 260;
          const ay = cy + sy * 260;
          g.circle(ax, ay, 20);
          g.stroke({ color: accentNum, width: 0.5, alpha: 0.04 });
        }
        break;
      }

      // ─── ASSEMBLY: construction rails / snap grid ───────────
      case "assembly": {
        // Assembly platform outline
        const platPad = 60;
        g.roundRect(platPad, platPad, stageW - platPad * 2, stageH - platPad * 2, 12);
        g.stroke({ color: accentNum, width: 1, alpha: 0.05 });

        // Internal snap grid (4x3)
        const gridCols = 4;
        const gridRows = 3;
        const cellW = (stageW - platPad * 2) / gridCols;
        const cellH = (stageH - platPad * 2) / gridRows;
        for (let r = 1; r < gridRows; r++) {
          const y = platPad + r * cellH;
          g.moveTo(platPad + 10, y);
          g.lineTo(stageW - platPad - 10, y);
          g.stroke({ color: accentNum, width: 0.4, alpha: 0.03 });
        }
        for (let c = 1; c < gridCols; c++) {
          const x = platPad + c * cellW;
          g.moveTo(x, platPad + 10);
          g.lineTo(x, stageH - platPad - 10);
          g.stroke({ color: accentNum, width: 0.4, alpha: 0.03 });
        }

        // Docking arms (incoming from sides)
        for (let i = 0; i < 3; i++) {
          const dy = platPad + (i + 0.5) * cellH;
          // Left arm
          g.moveTo(10, dy);
          g.lineTo(platPad - 5, dy);
          g.stroke({ color: accentNum, width: 1, alpha: 0.06 });
          g.circle(platPad - 5, dy, 3);
          g.stroke({ color: accentNum, width: 0.8, alpha: 0.06 });
          // Right arm
          g.moveTo(stageW - 10, dy);
          g.lineTo(stageW - platPad + 5, dy);
          g.stroke({ color: accentNum, width: 1, alpha: 0.06 });
          g.circle(stageW - platPad + 5, dy, 3);
          g.stroke({ color: accentNum, width: 0.8, alpha: 0.06 });
        }

        // Top incoming rail
        g.moveTo(cx, 10);
        g.lineTo(cx, platPad - 5);
        g.stroke({ color: accentNum, width: 1, alpha: 0.06 });
        g.moveTo(cx - 4, platPad - 12);
        g.lineTo(cx, platPad - 5);
        g.lineTo(cx + 4, platPad - 12);
        g.stroke({ color: accentNum, width: 0.8, alpha: 0.08 });
        break;
      }

      // ─── STAGE: presentation / reveal ───────────────────────
      case "stage": {
        // Spotlight cone from top
        g.moveTo(cx - 8, 0);
        g.lineTo(cx - 120, stageH);
        g.lineTo(cx + 120, stageH);
        g.lineTo(cx + 8, 0);
        g.closePath();
        g.fill({ color: accentNum, alpha: 0.015 });

        // Pedestal line
        const pedY = cy + 60;
        g.moveTo(cx - 160, pedY);
        g.lineTo(cx + 160, pedY);
        g.stroke({ color: accentNum, width: 1, alpha: 0.06 });

        // Pedestal platform
        g.roundRect(cx - 180, pedY, 360, 4, 2);
        g.fill({ color: accentNum, alpha: 0.03 });

        // Side accent lines (curtain hints)
        for (const side of [-1, 1]) {
          const sx = cx + side * 200;
          g.moveTo(sx, 20);
          g.lineTo(sx, stageH - 20);
          g.stroke({ color: accentNum, width: 0.5, alpha: 0.04 });
          // Decorative dots
          for (let i = 0; i < 5; i++) {
            g.circle(sx, 60 + i * (stageH - 120) / 4, 1.5);
            g.fill({ color: accentNum, alpha: 0.05 });
          }
        }
        break;
      }
    }

    container.addChild(g);
    return container;
  }
);
