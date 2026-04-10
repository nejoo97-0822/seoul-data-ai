/**
 * GlyphActor — a circular badge with a symbol/text inside.
 * Used for stamps, orbiting operators (Σ Π λ σ), tags.
 */

import { Container, Graphics, Text } from "pixi.js";
import { registerActor, skinColor } from "../ActorFactory";
import type { ActorDefinition, ThemeDefinition } from "../../core/types";

registerActor(
  "glyph",
  (def: ActorDefinition, theme: ThemeDefinition) => {
    const container = new Container();
    const text = (def.data?.text as string) ?? "?";
    const variant = (def.data?.variant as string) ?? "badge";
    const size = (def.data?.size as number) ?? 28;

    const fillColor = skinColor(theme, "glyph", "fill", "#FFFFFF");
    const strokeColor = skinColor(theme, "glyph", "stroke");
    const fillNum = parseInt(fillColor.replace("#", ""), 16);
    const strokeNum = parseInt(strokeColor.replace("#", ""), 16);

    if (variant === "stamp") {
      // Stamp: larger circle with text + soft glow
      const stampSize = (def.data?.size as number) ?? 48;
      const glow = new Graphics();
      glow.circle(0, 0, stampSize / 2 + 8);
      glow.fill({ color: strokeNum, alpha: 0.06 });
      glow.circle(0, 0, stampSize / 2 + 4);
      glow.fill({ color: strokeNum, alpha: 0.08 });
      container.addChild(glow);

      const bg = new Graphics();
      bg.circle(0, 0, stampSize / 2);
      bg.fill({ color: 0xffffff, alpha: 0.98 });
      bg.stroke({ color: strokeNum, width: 3 });
      container.addChild(bg);

      const t = new Text({
        text,
        style: {
          fontFamily: theme.fontFamily,
          fontSize: 8,
          fontWeight: "800",
          fill: strokeColor,
          align: "center",
          letterSpacing: 0.5,
        },
      });
      t.anchor.set(0.5);
      container.addChild(t);
    } else {
      // Badge: small circle + glyph with glow
      const glow = new Graphics();
      glow.circle(0, 0, size / 2 + 6);
      glow.fill({ color: strokeNum, alpha: 0.08 });
      container.addChild(glow);

      const bg = new Graphics();
      bg.circle(0, 0, size / 2);
      bg.fill({ color: fillNum, alpha: 1 });
      bg.stroke({ color: strokeNum, width: 2 });
      container.addChild(bg);

      const t = new Text({
        text,
        style: {
          fontFamily: theme.fontFamily,
          fontSize: size * 0.5,
          fontWeight: "800",
          fill: strokeColor,
        },
      });
      t.anchor.set(0.5);
      container.addChild(t);
    }

    return container;
  }
);
