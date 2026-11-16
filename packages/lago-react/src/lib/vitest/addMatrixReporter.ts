import type { Vitest } from "vitest/node";
import createMatrixReporter from "./createMatrixReporter.js";

/**
 * The projects each configuration's matrix reporter counts, by the
 * configuration: vitest resolves a new one when it restarts, with reporters
 * of its own.
 */
const counted = new WeakMap<object, Set<string>>();

/**
 * Has vitest print the matrix totals after a run, counting the stories of
 * `project`: one reporter for the whole run, however many projects draw
 * modes. Vitest builds its reporters from its configuration once every
 * plugin has configured it, so the one added here is among them.
 *
 * @note Impure: adds to vitest's configuration, and keeps which projects it counts.
 */
export default function addMatrixReporter(
  vitest: Pick<Vitest, "config" | "logger">,
  project: string,
): void {
  const known = counted.get(vitest.config);
  if (known !== undefined) {
    known.add(project);
    return;
  }
  const projects = new Set([project]);
  counted.set(vitest.config, projects);
  vitest.config.reporters.push(
    createMatrixReporter(projects, (line) => vitest.logger.log(line)),
  );
}
