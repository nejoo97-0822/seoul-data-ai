/**
 * pulse — expanding ring / shockwave effect.
 * Scales up while fading out.
 */

import { registerEvent } from "../EventRunner";

registerEvent("pulse", (progress, actor, event) => {
  const c = actor.container;
  const maxScale = (event.params?.maxScale as number) ?? 2.5;
  const startScale = (event.params?.startScale as number) ?? 0.4;

  c.alpha = 1 - progress;
  const s = startScale + (maxScale - startScale) * progress;
  c.scale.set(s);
});
