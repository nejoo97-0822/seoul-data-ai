/**
 * ResultCardActor — the final report/dossier card.
 * Larger than TaskCard, with header, spine bar, and content areas.
 */

import { Container, Graphics, Text } from "pixi.js";
import { registerActor, skinColor } from "../ActorFactory";
import type { ActorDefinition, ThemeDefinition } from "../../core/types";

registerActor(
  "resultCard",
  (def: ActorDefinition, theme: ThemeDefinition) => {
    const container = new Container();
    const w = (def.data?.width as number) ?? 340;
    const h = (def.data?.height as number) ?? 200;
    const label = (def.data?.label as string) ?? "Report";
    const body = (def.data?.body as string) ?? "";

    const fillColor = skinColor(theme, "resultCard", "fill", "#FFFFFF");
    const strokeColor = skinColor(theme, "resultCard", "stroke");
    const fillNum = parseInt(fillColor.replace("#", ""), 16);
    const strokeNum = parseInt(strokeColor.replace("#", ""), 16);

    // Card background
    const bg = new Graphics();
    bg.roundRect(-w / 2, -h / 2, w, h, 14);
    bg.fill({ color: fillNum, alpha: 1 });
    bg.stroke({ color: strokeNum, width: 2, alpha: 0.9 });
    container.addChild(bg);

    // Header
    const dot = new Graphics();
    dot.circle(0, 0, 4);
    dot.fill({ color: strokeNum, alpha: 1 });
    dot.x = -w / 2 + 18;
    dot.y = -h / 2 + 18;
    container.addChild(dot);

    const labelText = new Text({
      text: label.toUpperCase(),
      style: {
        fontFamily: theme.fontFamily,
        fontSize: 9,
        fontWeight: "700",
        fill: strokeColor,
        letterSpacing: 2,
      },
    });
    labelText.x = -w / 2 + 28;
    labelText.y = -h / 2 + 12;
    container.addChild(labelText);

    // Spine bar
    const spine = new Graphics();
    spine.roundRect(-w / 2 + 16, -h / 2 + 34, w - 32, 3, 2);
    spine.fill({ color: strokeNum, alpha: 0.6 });
    container.addChild(spine);
    (container as unknown as Record<string, unknown>).__spine = spine;

    // Body text
    if (body) {
      const bodyText = new Text({
        text: `\u201C${body}\u201D`,
        style: {
          fontFamily: theme.fontFamily,
          fontSize: 13,
          fontWeight: "600",
          fill: theme.palette.text,
          wordWrap: true,
          wordWrapWidth: w - 40,
        },
      });
      bodyText.x = -w / 2 + 18;
      bodyText.y = -h / 2 + 46;
      container.addChild(bodyText);
    }

    // Bottom chips area placeholder
    const chipBg = new Graphics();
    chipBg.roundRect(-w / 2 + 16, h / 2 - 34, 90, 22, 11);
    chipBg.fill({ color: strokeNum, alpha: 0.1 });
    chipBg.stroke({ color: strokeNum, width: 1, alpha: 0.3 });
    container.addChild(chipBg);

    const chipText = new Text({
      text: "순위 · 차트 · 지도",
      style: {
        fontFamily: theme.fontFamily,
        fontSize: 8,
        fontWeight: "700",
        fill: strokeColor,
        letterSpacing: 1,
      },
    });
    chipText.x = -w / 2 + 26;
    chipText.y = h / 2 - 30;
    container.addChild(chipText);

    return container;
  }
);
