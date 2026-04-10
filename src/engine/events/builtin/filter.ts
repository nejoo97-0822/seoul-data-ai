/**
 * filter — normalize/transform actors.
 * Snaps drift (rotation, scale, position offset) to aligned state.
 */

import { registerEvent } from "../EventRunner";

registerEvent("filter", (progress, actor, event) => {
  const c = actor.container;

  // Normalize rotation toward 0
  if (!actor.state.__filterStartRot) {
    actor.state.__filterStartRot = c.rotation;
    actor.state.__filterStartScaleX = c.scale.x;
    actor.state.__filterStartScaleY = c.scale.y;
  }

  const startRot = actor.state.__filterStartRot as number;
  c.rotation = startRot * (1 - progress);

  // Normalize scale toward 1
  const targetScale = (event.params?.targetScale as number) ?? 1;
  const startSX = actor.state.__filterStartScaleX as number;
  const startSY = actor.state.__filterStartScaleY as number;
  c.scale.x = startSX + (targetScale - startSX) * progress;
  c.scale.y = startSY + (targetScale - startSY) * progress;
});
