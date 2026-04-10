/**
 * BeamActor — a vertical or horizontal sweep beam.
 * Used for scan beams, alignment beams, conveyor belts.
 */

import { Container, Graphics } from "pixi.js";
import { registerActor, skinColor } from "../ActorFactory";
import type { ActorDefinition, ThemeDefinition } from "../../core/types";

registerActor(
  "beam",
  (def: ActorDefinition, theme: ThemeDefinition, stageW: number, stageH: number) => {
    const container = new Container();
    const width = (def.data?.width as number) ?? 3;
    const height = (def.data?.height as number) ?? stageH;
    const orientation = (def.data?.orientation as string) ?? "vertical";
    const color = skinColor(theme, "beam", "fill");
    const colorNum = parseInt(color.replace("#", ""), 16);

    const g = new Graphics();

    if (orientation === "horizontal") {
      // Horizontal beam (conveyor style) with glow
      const beltW = (def.data?.beltWidth as number) ?? stageW * 0.6;

      // Glow beneath belt
      g.roundRect(-beltW / 2 - 4, -14, beltW + 8, 28, 6);
      g.fill({ color: colorNum, alpha: 0.06 });

      g.roundRect(-beltW / 2, -7, beltW, 14, 3);
      g.fill({ color: colorNum, alpha: 0.7 });
      // Segments
      for (let i = 0; i < Math.floor(beltW / 12); i++) {
        g.roundRect(-beltW / 2 + i * 12, -5, 6, 10, 1);
        g.fill({ color: colorNum, alpha: 0.9 });
      }
    } else {
      // Vertical sweep beam with side glow
      g.rect(-width * 4, -height / 2, width * 8, height);
      g.fill({ color: colorNum, alpha: 0.04 });
      g.rect(-width * 2, -height / 2, width * 4, height);
      g.fill({ color: colorNum, alpha: 0.08 });
      g.rect(-width / 2, -height / 2, width, height);
      g.fill({ color: colorNum, alpha: 0.8 });
    }

    container.addChild(g);
    return container;
  }
);
