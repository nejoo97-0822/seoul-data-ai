/**
 * ArchiveZoneActor — visual "data catalog room".
 *
 * Draws a large rounded container with internal shelf rows,
 * dormant data dots, and scan-field markers.
 * Gives spatial depth — this IS the zone, not just a background.
 */

import { Container, Graphics, Text } from "pixi.js";
import { registerActor, skinColor } from "../ActorFactory";
import type { ActorDefinition, ThemeDefinition } from "../../core/types";

function seededRandom(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

registerActor(
  "archiveZone",
  (def: ActorDefinition, theme: ThemeDefinition, stageW: number, stageH: number) => {
    const container = new Container();
    const w = (def.data?.width as number) ?? 520;
    const h = (def.data?.height as number) ?? 320;
    const color = skinColor(theme, "beam", "fill");
    const colorNum = parseInt(color.replace("#", ""), 16);
    const rows = (def.data?.rows as number) ?? 5;
    const cols = (def.data?.cols as number) ?? 8;

    // --- Outer glow / atmosphere ---
    const outerGlow = new Graphics();
    outerGlow.roundRect(-w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 28);
    outerGlow.fill({ color: colorNum, alpha: 0.03 });
    outerGlow.roundRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16, 22);
    outerGlow.fill({ color: colorNum, alpha: 0.04 });
    container.addChild(outerGlow);

    // --- Main zone body ---
    const body = new Graphics();
    body.roundRect(-w / 2, -h / 2, w, h, 16);
    body.fill({ color: 0xffffff, alpha: 0.45 });
    body.stroke({ color: colorNum, width: 1.5, alpha: 0.18 });
    container.addChild(body);

    // --- Inner frame (scan field border) ---
    const innerFrame = new Graphics();
    const pad = 14;
    innerFrame.roundRect(-w / 2 + pad, -h / 2 + pad, w - pad * 2, h - pad * 2, 8);
    innerFrame.stroke({ color: colorNum, width: 1, alpha: 0.08 });
    container.addChild(innerFrame);

    // --- Corner brackets (spatial depth markers) ---
    const bracketLen = 18;
    const bracketW = 2;
    const corners = [
      { x: -w / 2 + pad, y: -h / 2 + pad }, // TL
      { x: w / 2 - pad, y: -h / 2 + pad },   // TR
      { x: -w / 2 + pad, y: h / 2 - pad },   // BL
      { x: w / 2 - pad, y: h / 2 - pad },     // BR
    ];
    const brackets = new Graphics();
    for (let ci = 0; ci < corners.length; ci++) {
      const cx = corners[ci].x;
      const cy = corners[ci].y;
      const dx = ci % 2 === 0 ? 1 : -1;
      const dy = ci < 2 ? 1 : -1;
      brackets.moveTo(cx, cy + dy * bracketLen);
      brackets.lineTo(cx, cy);
      brackets.lineTo(cx + dx * bracketLen, cy);
      brackets.stroke({ color: colorNum, width: bracketW, alpha: 0.25 });
    }
    container.addChild(brackets);

    // --- Shelf row lines ---
    const shelfLines = new Graphics();
    const innerW = w - pad * 2 - 16;
    const innerH = h - pad * 2 - 16;
    const rowH = innerH / rows;
    for (let r = 1; r < rows; r++) {
      const y = -h / 2 + pad + 8 + r * rowH;
      shelfLines.moveTo(-w / 2 + pad + 8, y);
      shelfLines.lineTo(w / 2 - pad - 8, y);
      shelfLines.stroke({ color: colorNum, width: 0.5, alpha: 0.06 });
    }
    container.addChild(shelfLines);

    // --- Dormant data dots (catalog entries) ---
    const dotsContainer = new Container();
    const cellW = innerW / cols;
    const cellH = innerH / rows;
    const startX = -w / 2 + pad + 8 + cellW / 2;
    const startY = -h / 2 + pad + 8 + cellH / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const dotX = startX + c * cellW;
        const dotY = startY + r * cellH;
        const size = 2 + seededRandom(idx, 7) * 1.5;
        const alpha = 0.12 + seededRandom(idx, 11) * 0.15;

        const dot = new Graphics();
        // Soft halo
        dot.circle(0, 0, size * 2.5);
        dot.fill({ color: colorNum, alpha: alpha * 0.3 });
        // Core
        dot.circle(0, 0, size);
        dot.fill({ color: colorNum, alpha: alpha });

        dot.x = dotX;
        dot.y = dotY;
        dotsContainer.addChild(dot);
      }
    }
    container.addChild(dotsContainer);

    // --- Zone label (top-left) ---
    const label = new Text({
      text: (def.data?.label as string) ?? "DATA ARCHIVE",
      style: {
        fontFamily: theme.fontFamily,
        fontSize: 9,
        fontWeight: "700",
        fill: color,
        letterSpacing: 1.5,
      },
    });
    label.x = -w / 2 + pad + 4;
    label.y = -h / 2 + 4;
    label.alpha = 0.35;
    container.addChild(label);

    // --- Slot count indicator (bottom-right) ---
    const countLabel = new Text({
      text: `${rows * cols} entries`,
      style: {
        fontFamily: theme.fontFamily,
        fontSize: 8,
        fontWeight: "500",
        fill: color,
      },
    });
    countLabel.anchor.set(1, 1);
    countLabel.x = w / 2 - pad - 4;
    countLabel.y = h / 2 - 4;
    countLabel.alpha = 0.25;
    container.addChild(countLabel);

    return container;
  }
);
