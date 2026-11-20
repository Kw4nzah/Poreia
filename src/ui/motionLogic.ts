// Pure helpers behind the motion components, kept apart so they can be tested.

/** Duration to use: zero when the system asks to reduce motion. */
export function motionDuration(reduce: boolean, ms: number): number {
  return reduce ? 0 : ms;
}

/** Target of the chevron rotation: 0 when closed, 1 (a quarter turn) when open. */
export function chevronTarget(open: boolean): 0 | 1 {
  return open ? 1 : 0;
}
