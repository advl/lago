import type { Reporter, TestModule } from "vitest/node";
import {
  buildCatalog,
  type Catalog,
  type FileFailure,
  type StoryRecord,
} from "../catalog/index.js";
import readFailure from "./readFailure.js";
import readRecord from "./readRecord.js";
import type { ReportedTest } from "./types.js";

/** What the engine keeps of one stories file between runs. */
interface FileRun {
  readonly records: readonly StoryRecord[];
  readonly failure: FileFailure | undefined;
}

/** A test module's tests as the engine reads them. */
function readTests(module: TestModule): ReportedTest[] {
  return [...module.children.allTests()].map((test) => ({
    name: test.name,
    suite: test.parent.type === "suite" ? test.parent.name : "",
    file: module.moduleId,
    state: test.result().state,
    errors: test.result().errors ?? [],
    story: test.meta().lago,
  }));
}

/**
 * A vitest reporter that keeps the latest run of every stories file and,
 * after each run, gives the whole catalog. A run in watch mode covers only
 * the files it ran, so the others keep what their last run showed. A file
 * removed leaves the catalog at once.
 *
 * @note Impure: keeps the files' runs between calls, and asks the file system whether each golden exists.
 */
export default function createReporter(
  root: string,
  exists: (path: string) => boolean,
  onCatalog: (catalog: Catalog) => void,
): Reporter {
  const files = new Map<string, FileRun>();
  const give = () => {
    const runs = [...files.values()];
    onCatalog(
      buildCatalog(
        runs.flatMap(({ records }) => records),
        runs.flatMap(({ failure }) => (failure ? [failure] : [])),
      ),
    );
  };
  return {
    onTestRunEnd(modules) {
      for (const module of modules) {
        const tests = readTests(module);
        files.set(module.moduleId, {
          records: tests.flatMap(
            (test) => readRecord(test, root, exists) ?? [],
          ),
          failure: readFailure(module.moduleId, module.errors(), tests),
        });
      }
      give();
    },
    // A file removed is never run again, so its stories leave the catalog
    // here, with no run to follow.
    onTestRemoved(file) {
      if (file !== undefined && files.delete(file)) give();
    },
  };
}
