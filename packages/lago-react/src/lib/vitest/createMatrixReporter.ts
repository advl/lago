import type { Reporter } from "vitest/node";
import countMatrix from "./countMatrix.js";
import type { Cell, StoryResult } from "./types.js";
import writeMatrix from "./writeMatrix.js";

/**
 * A vitest reporter that prints the matrix totals once the stories have run,
 * counting the files of the projects named in `projects` alone, through
 * `log`. It prints nothing for a run that drew no mode.
 *
 * @note Impure: prints through `log`.
 */
export default function createMatrixReporter(
  projects: ReadonlySet<string>,
  log: (line: string) => void,
): Reporter {
  return {
    onTestRunEnd(modules) {
      const stories: StoryResult[] = [];
      const excluded: Cell[] = [];
      for (const module of modules) {
        if (!projects.has(module.project.name)) continue;
        for (const test of module.children.allTests()) {
          const { lago, lagoExcluded = [] } = test.meta();
          if (lago !== undefined) stories.push(lago);
          excluded.push(...lagoExcluded);
        }
      }
      for (const line of writeMatrix(countMatrix(stories, excluded))) log(line);
    },
  };
}
