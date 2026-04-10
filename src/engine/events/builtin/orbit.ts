/**
 * orbit — continuously rotate an actor around its parent position.
 * Used for spinning rings and orbiting glyphs.
 */

import { registerEvent } from "../EventRunner";

registerEvent("orbit", (progress, actor, event) => {
  const c = actor.container;
  c.alpha = 1;

  const speed = (event.params?.speed as number) ?? 1;
  const direction = (event.params?.direction as number) ?? 1; // 1=CW, -1=CCW
  const orbitRadius = (event.params?.orbitRadius as number) ?? 0;

  // Full continuous rotation
  const angle = progress * Math.PI * 2 * speed * direction;
  c.rotation = angle;

  // If orbitRadius, position on circular path
  if (orbitRadius > 0) {
    const baseX = actor.state.__orbitBaseX as number ?? c.x;
    const baseY = actor.state.__orbitBaseY as number ?? c.y;
    if (!actor.state.__orbitBaseX) {
      actor.state.__orbitBaseX = c.x;
      actor.state.__orbitBaseY = c.y;
    }
    c.x = baseX + Math.cos(angle) * orbitRadius;
    c.y = baseY + Math.sin(angle) * orbitRadius;
    c.rotation = 0; // don't rotate the glyph itself
  }
});
