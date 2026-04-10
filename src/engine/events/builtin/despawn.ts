/**
 * despawn — fade out and scale down an actor.
 */

import { registerEvent } from "../EventRunner";

registerEvent("despawn", (progress, actor) => {
  const c = actor.container;
  c.alpha = 1 - progress;
  c.scale.set(1 - progress * 0.5);
});
