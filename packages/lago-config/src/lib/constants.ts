/**
 * The packages a project and Lago's packages must share one copy of: React
 * and the renderer. A second copy of React has no component to call hooks
 * from, and an object made by one copy of the renderer is not one the other
 * recognises. A Lago package linked from a checkout would otherwise import
 * the checkout's own.
 */
export const sharedPackages = [
  "react",
  "react-reconciler",
  "@opentui/core",
  "@opentui/react",
  "@opentui/keymap",
] as const;

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
