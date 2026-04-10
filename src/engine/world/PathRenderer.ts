/**
 * PathRenderer — draws conveyor/connection lines between zones.
 * Always visible as subtle dotted lines with directional arrows.
 */

import { Container, Graphics } from "pixi.js";
import type { PathDefinition } from "../core/types";

export class PathRenderer {
  public container: Container;

  constructor(
    paths: PathDefinition[],
    stageW: number,
    stageH: number,
    baseColor: number = 0x94a3b8 // slate-400
  ) {
    this.container = new Container();

    for (const path of paths) {
      const g = new Graphics();
      const waypoints = path.waypoints.map(wp => ({
        x: wp.x * stageW,
        y: wp.y * stageH,
      }));

      // Draw dotted path line
      for (let i = 0; i < waypoints.length - 1; i++) {
        const from = waypoints[i];
        const to = waypoints[i + 1];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(len / 8); // dot every 8px

        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          const x = from.x + dx * t;
          const y = from.y + dy * t;
          g.circle(x, y, 1);
          g.fill({ color: baseColor, alpha: 0.15 });
        }

        // Arrow head at end of segment
        if (i === waypoints.length - 2) {
          const nx = dx / len;
          const ny = dy / len;
          const ax = to.x - nx * 10;
          const ay = to.y - ny * 10;
          const perpX = -ny;
          const perpY = nx;
          g.moveTo(ax + perpX * 4, ay + perpY * 4);
          g.lineTo(to.x, to.y);
          g.lineTo(ax - perpX * 4, ay - perpY * 4);
          g.stroke({ color: baseColor, width: 1, alpha: 0.12 });
        }
      }

      this.container.addChild(g);
    }
  }
}
