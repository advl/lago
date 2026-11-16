import type { Readable, Writable } from "node:stream";
import type { Viewport } from "../screen/index.js";

/** What a mount is given to draw on: a terminal's two streams, and its size. */
export interface MountTarget {
  /** What the program reads its keys from, as a terminal in raw mode gives them. */
  readonly input: Readable;
  /** What the program writes its screen to, a terminal of `viewport`'s size. */
  readonly output: Writable;
  readonly viewport: Viewport;
}

/** How to take down what a mount drew. */
export type Unmount = () => void | Promise<void>;

/**
 * Draws a program on the target it is given, and gives back how to take it
 * down. A program that reads its colours from the environment when it loads
 * is loaded inside the mount, after `renderStream` has set that environment.
 */
export type Mount = (target: MountTarget) => Unmount | Promise<Unmount>;
