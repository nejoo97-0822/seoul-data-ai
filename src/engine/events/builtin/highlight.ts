/**
 * highlight — activates a dataNode from dormant to "found" state.
 *
 * Fades out the dormant dot, fades in the glowing found orb + label.
 * Also applies a gentle upward float and scale bounce.
 */

import { registerEvent } from "../EventRunner";
import type { Container } from "pixi.js";

registerEvent("highlight", (progress, actor) => {
  const c = actor.container as unknown as Record<string, unknown>;
  const dormant = c.__dormantDot as Container | undefined;
  const found = c.__foundGroup as Container | undefined;

  if (!dormant || !found) {
    // Fallback: just fade in
    actor.container.alpha = progress;
    return;
  }

  // Phase 1 (0 → 0.3): dormant dot pulses bright then fades
  // Phase 2 (0.2 → 0.7): found group scales up from small
  // Phase 3 (0.5 → 1.0): settle into final position

  if (progress < 0.3) {
    const p = progress / 0.3;
    dormant.alpha = 1 - p;
    dormant.scale.set(1 + p * 1.5); // pulse outward
    found.alpha = Math.max(0, (p - 0.5) * 2);
  } else {
    dormant.alpha = 0;
  }

  if (progress >= 0.2) {
    const p = Math.min(1, (progress - 0.2) / 0.5);
    // Overshoot scale bounce
    const bounce = p < 0.7
      ? p / 0.7 * 1.15
      : 1.15 - (p - 0.7) / 0.3 * 0.15;
    found.alpha = Math.min(1, p * 1.5);
    found.scale.set(bounce);
  }

  // Gentle upward drift
  if (!actor.state.__highlightStartY) {
    actor.state.__highlightStartY = actor.container.y;
  }
  const startY = actor.state.__highlightStartY as number;
  const floatAmount = (actor.definition.data?.floatY as number) ?? -30;
  actor.container.y = startY + floatAmount * progress;
});
