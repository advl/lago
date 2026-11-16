import { onTestFinished } from "vitest";
import { terminalEnvironment } from "./constants.js";

/** Gives `name` the value, or removes it when there is none. */
const writeVariable = (name: string, value: string | undefined) => {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
};

/**
 * Sets the environment a terminal program is given for the length of the
 * running test, and puts back what was there when it ends. A program reads it
 * when it is loaded, so a mount that loads its program after this sees it.
 *
 * @note Impure: writes to the process's environment and registers its restoring on the running test.
 */
export default function pinEnvironment(): void {
  const before = Object.keys(terminalEnvironment).map(
    (name) => [name, process.env[name]] as const,
  );
  for (const [name, value] of Object.entries(terminalEnvironment)) {
    writeVariable(name, value);
  }
  onTestFinished(() => {
    for (const [name, value] of before) writeVariable(name, value);
  });
}
