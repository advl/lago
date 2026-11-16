import type { Screenshot } from "../screenshot/index.js";

/**
 * A headless terminal a program's bytes are written to, read back as a
 * screenshot.
 */
export interface Emulator {
  /** Writes `bytes` and resolves once the emulator has read all of them. */
  readonly write: (bytes: string) => Promise<void>;
  /** Whether bytes written are still waiting to be read. */
  readonly isReading: () => boolean;
  /** What the emulator's screen shows now. */
  readonly read: () => Screenshot;
  readonly dispose: () => void;
}
