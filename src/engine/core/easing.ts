/**
 * Easing functions for the timeline/event system.
 */

import type { EasingName } from "./types";

export type EasingFn = (t: number) => number;

const easings: Record<EasingName, EasingFn> = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutBack: (t) => {
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },
  easeInBack: (t) => {
    const c = 1.70158;
    return c * t * t * t - (c - 1) * t * t; // fixed: was wrong sign
  },
};

export function getEasing(name?: EasingName): EasingFn {
  return easings[name ?? "linear"] ?? easings.linear;
}
