/**
 * spawn — materialize an actor from nothing.
 * Scales from small/transparent to full size.
 */

import { registerEvent } from "../EventRunner";

registerEvent("spawn", (progress, actor, event) => {
  const fromScale = (event.params?.fromScale as number) ?? 0.2;
  const toScale = (event.params?.toScale as number) ?? 1;
  const c = actor.container;
  c.alpha = progress;
  const s = fromScale + (toScale - fromScale) * progress;
  c.scale.set(s);
});
