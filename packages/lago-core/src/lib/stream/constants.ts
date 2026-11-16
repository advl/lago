/**
 * How many steps a stream may take to settle. A program still writing, or
 * still waiting on a timer, after this many does so on every step, as an
 * interval or an animation does, and would never settle.
 */
export const stepLimit = 500;

/**
 * The event loop's own turn, taken as this module loads, before a test fakes
 * anything.
 */
export const takeTurn = globalThis.setImmediate;

/**
 * How many real turns of the event loop each step lets run before it judges
 * the screen quiet. The longest chain measured takes three: a terminal
 * program holds a lone Escape for one turn to see whether a sequence
 * follows, React commits the update it caused on the next, and the program
 * writes its frame on the one after. One more is kept to spare.
 */
export const realTurns = 4;
