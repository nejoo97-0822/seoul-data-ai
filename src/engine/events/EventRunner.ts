/**
 * EventRunner — schedules and runs events against actors.
 *
 * Each frame, the runner checks which events are active based on
 * elapsed time, and calls the corresponding event handler with
 * a normalized progress (0..1).
 */

import type {
  EventDefinition,
  ActorInstance,
  ThemeDefinition,
} from "../core/types";
import { getEasing } from "../core/easing";

export type EventHandler = (
  progress: number, // 0..1 eased
  actor: ActorInstance,
  event: EventDefinition,
  theme: ThemeDefinition,
  stageW: number,
  stageH: number
) => void;

const handlers = new Map<string, EventHandler>();

export function registerEvent(action: string, handler: EventHandler) {
  handlers.set(action, handler);
}

export interface ActiveEvent {
  event: EventDefinition;
  actors: ActorInstance[];
  started: boolean;
  completed: boolean;
}

export class EventTimeline {
  private events: ActiveEvent[];
  private theme: ThemeDefinition;
  private stageW: number;
  private stageH: number;

  constructor(
    events: EventDefinition[],
    actorMap: Map<string, ActorInstance>,
    theme: ThemeDefinition,
    stageW: number,
    stageH: number
  ) {
    this.theme = theme;
    this.stageW = stageW;
    this.stageH = stageH;
    this.events = events.map((e) => ({
      event: e,
      actors: e.targetActorIds
        .map((id) => actorMap.get(id))
        .filter(Boolean) as ActorInstance[],
      started: false,
      completed: false,
    }));
  }

  /** Called each frame with elapsed seconds since scene start */
  tick(elapsedSec: number) {
    for (const ae of this.events) {
      if (ae.completed) continue;

      const { at, duration } = ae.event;
      const end = at + duration;

      if (elapsedSec < at) continue; // not started yet

      if (!ae.started) {
        ae.started = true;
      }

      // Compute raw progress 0..1
      const raw = duration > 0 ? Math.min(1, (elapsedSec - at) / duration) : 1;
      const eased = getEasing(ae.event.easing)(raw);

      // Get handler
      const handler = handlers.get(ae.event.action);
      if (!handler) continue;

      // Apply to each target actor
      for (const actor of ae.actors) {
        handler(eased, actor, ae.event, this.theme, this.stageW, this.stageH);
      }

      if (raw >= 1) {
        ae.completed = true;
      }
    }
  }
}
