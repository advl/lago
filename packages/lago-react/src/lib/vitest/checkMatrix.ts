import { readFileSync } from "node:fs";
import type { TestProject } from "vitest/node";
import { storiesFile } from "./constants.js";
import readComments from "./readComments.js";

interface Bounds {
  readonly viewports: number;
  readonly modes: number;
  readonly max: number;
}

/**
 * Refuses a project whose matrix holds more cells than `max`, before any is
 * drawn: each story exported by its stories files, at each configured
 * viewport, in the base and in each mode. The count is read from the files
 * as they are written, so it holds the stories and the modes a story leaves
 * out, and not the viewports a story adds. Each mode is a whole run of the
 * stories, so the bound is on what a run costs.
 *
 * @note Impure: lists the project's stories files and reads them.
 */
export default async function checkMatrix(
  project: Pick<TestProject, "name" | "globTestFiles">,
  { viewports, modes, max }: Bounds,
): Promise<void> {
  const { testFiles } = await project.globTestFiles();
  const stories = testFiles
    .filter((file) => storiesFile.test(file))
    .reduce(
      (count, file) =>
        count +
        Object.keys(readComments(file, readFileSync(file, "utf8"))).length,
      0,
    );
  const cells = stories * viewports * (modes + 1);
  if (cells > max) {
    throw new Error(
      `The project ${project.name} has ${cells} cells in its matrix, ${stories} stories at ${viewports} ${viewports === 1 ? "viewport" : "viewports"} in the base and ${modes} ${modes === 1 ? "mode" : "modes"}, past matrix.max, ${max}. Every story its stories files export is counted at every configured viewport, whatever it leaves out. Draw fewer modes or viewports, or raise matrix.max.`,
    );
  }
}
