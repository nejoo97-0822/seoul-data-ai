/**
 * TaskCardActor — a quest/order card rendered as PixiJS graphics.
 * Shows a rounded rectangle with header dot, label, and body text.
 */

import { Container, Graphics, Text } from "pixi.js";
import { registerActor, skinColor } from "../ActorFactory";
import type { ActorDefinition, ThemeDefinition } from "../../core/types";

registerActor(
  "taskCard",
  (def: ActorDefinition, theme: ThemeDefinition) => {
    const container = new Container();
    const w = (def.data?.width as number) ?? 280;
    const h = (def.data?.height as number) ?? 100;
    const label = (def.data?.label as string) ?? "Task";
    const body = (def.data?.body as string) ?? "";
    const number = (def.data?.number as string) ?? "";

    const fillColor = skinColor(theme, "taskCard", "fill", "#FFFFFF");
    const strokeColor = skinColor(theme, "taskCard", "stroke");
    const fillNum = parseInt(fillColor.replace("#", ""), 16);
    const strokeNum = parseInt(strokeColor.replace("#", ""), 16);

    // Card body
    const bg = new Graphics();
    bg.roundRect(-w / 2, -h / 2, w, h, 12);
    bg.fill({ color: fillNum, alpha: 1 });
    bg.stroke({ color: strokeNum, width: 2, alpha: 0.6 });
    container.addChild(bg);

    // Top colored strip
    const strip = new Graphics();
    strip.roundRect(-w / 2, -h / 2, w, 4, 2);
    strip.fill({ color: strokeNum, alpha: 0.9 });
    container.addChild(strip);

    // Header dot
    const dot = new Graphics();
    dot.circle(0, 0, 3);
    dot.fill({ color: strokeNum, alpha: 1 });
    dot.x = -w / 2 + 16;
    dot.y = -h / 2 + 18;
    container.addChild(dot);

    // Label text
    const labelText = new Text({
      text: label.toUpperCase(),
      style: {
        fontFamily: theme.fontFamily,
        fontSize: 8,
        fontWeight: "700",
        fill: strokeColor,
        letterSpacing: 1.5,
      },
    });
    labelText.x = -w / 2 + 24;
    labelText.y = -h / 2 + 12;
    container.addChild(labelText);

    // Number text
    if (number) {
      const numText = new Text({
        text: number,
        style: {
          fontFamily: theme.fontFamily,
          fontSize: 8,
          fill: theme.palette.textMuted,
        },
      });
      numText.x = w / 2 - 50;
      numText.y = -h / 2 + 12;
      container.addChild(numText);
    }

    // Body text
    if (body) {
      const bodyText = new Text({
        text: body,
        style: {
          fontFamily: theme.fontFamily,
          fontSize: 12,
          fontWeight: "600",
          fill: theme.palette.text,
          wordWrap: true,
          wordWrapWidth: w - 32,
        },
      });
      bodyText.x = -w / 2 + 16;
      bodyText.y = -h / 2 + 32;
      (container as unknown as Record<string, unknown>).__bodyText = bodyText;
      container.addChild(bodyText);
    }

    // Schema bars at bottom
    const bars = new Graphics();
    for (let i = 0; i < 4; i++) {
      const bx = -w / 2 + 16 + i * (w / 4 - 4);
      bars.roundRect(bx, h / 2 - 14, w / 4 - 10, 3, 2);
      bars.fill({ color: strokeNum, alpha: 0.2 });
    }
    container.addChild(bars);

    return container;
  }
);
