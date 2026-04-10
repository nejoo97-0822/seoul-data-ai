/**
 * reveal — grand unveil. Combines scale bounce + alpha.
 * Used for the final dossier reveal moment.
 */

import { registerEvent } from "../EventRunner";

registerEvent("reveal", (progress, actor, event) => {
  const c = actor.container;
  const bounce = (event.params?.bounce as boolean) ?? true;

  c.alpha = Math.min(1, progress * 2); // fade in first half

  if (bounce) {
    // Overshoot bounce: rises past 1.0 then settles
    const overshoot = 1.08;
    if (progress < 0.6) {
      const p = progress / 0.6;
      c.scale.set(0.85 + (overshoot - 0.85) * p);
    } else {
      const p = (progress - 0.6) / 0.4;
      c.scale.set(overshoot + (1.0 - overshoot) * p);
    }
  } else {
    c.scale.set(0.85 + 0.15 * progress);
  }
});
