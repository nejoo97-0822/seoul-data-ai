/**
 * dim — briefly flashes a dataNode then fades it to dim.
 * Used for "decoy" nodes that get scanned but not selected.
 */

import { registerEvent } from "../EventRunner";

registerEvent("dim", (progress, actor) => {
  // Brief flash (0→0.3) then fade out (0.3→1.0)
  if (progress < 0.3) {
    actor.container.alpha = 0.6 + progress / 0.3 * 0.4;
    actor.container.scale.set(1 + progress / 0.3 * 0.15);
  } else {
    const fade = (progress - 0.3) / 0.7;
    actor.container.alpha = Math.max(0.1, 1.0 - fade * 0.9);
    actor.container.scale.set(1.15 - fade * 0.3);
  }
});
