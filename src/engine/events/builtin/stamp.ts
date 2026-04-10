/**
 * stamp — slam a stamp down with overshoot.
 * Scales from large, slams to normal with rotation.
 */

import { registerEvent } from "../EventRunner";

registerEvent("stamp", (progress, actor) => {
  const c = actor.container;

  if (progress < 0.45) {
    // Windup: invisible, scaled up
    c.alpha = 0;
    c.scale.set(2.2);
    c.rotation = (-45 * Math.PI) / 180;
  } else if (progress < 0.65) {
    // Impact
    const p = (progress - 0.45) / 0.2;
    c.alpha = p;
    c.scale.set(2.2 - (2.2 - 1.15) * p);
    c.rotation = ((-45 + (45 - 10) * p) * Math.PI) / 180;
  } else if (progress < 0.8) {
    // Settle
    const p = (progress - 0.65) / 0.15;
    c.alpha = 1;
    c.scale.set(1.15 - 0.15 * p);
    c.rotation = ((-10 - 4 * p) * Math.PI) / 180;
  } else {
    // Hold
    c.alpha = 1;
    c.scale.set(1);
    c.rotation = (-14 * Math.PI) / 180;
  }
});
