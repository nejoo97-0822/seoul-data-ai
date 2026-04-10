/**
 * converge — particles move from their home positions toward center (0,0).
 * The actor must be a particleSwarm.
 */

import { registerEvent } from "../EventRunner";

registerEvent("converge", (progress, actor) => {
  const c = actor.container;
  c.alpha = 1;

  for (let i = 0; i < c.children.length; i++) {
    const child = c.children[i] as unknown as Record<string, number>;
    const homeX = child.__homeX ?? 0;
    const homeY = child.__homeY ?? 0;

    // Move from home toward center
    (c.children[i] as import("pixi.js").Container).x =
      homeX * (1 - progress);
    (c.children[i] as import("pixi.js").Container).y =
      homeY * (1 - progress);

    // Fade and shrink near center
    (c.children[i] as import("pixi.js").Container).alpha =
      progress < 0.85 ? 1 : 1 - (progress - 0.85) / 0.15;
    const s = 1 - progress * 0.6;
    (c.children[i] as import("pixi.js").Container).scale.set(s);
  }
});
