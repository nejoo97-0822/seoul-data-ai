/**
 * move — translate an actor from current position to target.
 * Supports scale and rotation changes.
 */

import { registerEvent } from "../EventRunner";

registerEvent("move", (progress, actor, event, _theme, stageW, stageH) => {
  const c = actor.container;

  // Store start position on first call
  if (!actor.state.__moveStartX) {
    actor.state.__moveStartX = c.x;
    actor.state.__moveStartY = c.y;
    actor.state.__moveStartScale = c.scale.x;
    actor.state.__moveStartRotation = c.rotation;
    actor.state.__moveStartAlpha = c.alpha;
  }

  const to = event.params?.to as { x?: number; y?: number } | undefined;
  const toScale = event.params?.scale as number | undefined;
  const toRotation = event.params?.rotate as number | undefined;
  const toAlpha = event.params?.alpha as number | undefined;

  const startX = actor.state.__moveStartX as number;
  const startY = actor.state.__moveStartY as number;

  if (to) {
    // Positions in params are normalized 0..1
    const targetX = to.x !== undefined ? to.x * stageW : startX;
    const targetY = to.y !== undefined ? to.y * stageH : startY;
    c.x = startX + (targetX - startX) * progress;
    c.y = startY + (targetY - startY) * progress;
  }

  if (toScale !== undefined) {
    const startS = actor.state.__moveStartScale as number;
    c.scale.set(startS + (toScale - startS) * progress);
  }

  if (toRotation !== undefined) {
    const startR = actor.state.__moveStartRotation as number;
    const rad = (toRotation * Math.PI) / 180;
    c.rotation = startR + (rad - startR) * progress;
  }

  if (toAlpha !== undefined) {
    const startA = actor.state.__moveStartAlpha as number;
    c.alpha = startA + (toAlpha - startA) * progress;
  }
});
