/**
 * What `vi.useFakeTimers()` fakes in a project's tests unless a test says
 * otherwise: the timers a component can wait on, the clock and the
 * high-resolution clock. `setImmediate` is left real, because React waits on
 * it to know that an update has been committed, and a screen would never
 * settle with it faked.
 */
export const fakedTimers = [
  "setTimeout",
  "clearTimeout",
  "setInterval",
  "clearInterval",
  "Date",
  "performance",
] as const;
