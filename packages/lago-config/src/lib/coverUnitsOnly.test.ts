import { describe, expect, it } from "vitest";
import coverUnitsOnly from "./coverUnitsOnly.js";

/** Calls the plugin's hook for a project of a run, as vitest does. */
const configure = (project: string, coverage: boolean) => () =>
  (coverUnitsOnly.configureVitest as (context: unknown) => void)({
    vitest: { config: { coverage: { enabled: coverage } } },
    project: { name: project },
  });

describe("coverUnitsOnly", () => {
  it("refuses a coverage run that includes the stories, naming the commands to run instead", () => {
    expect(configure("stories", true)).toThrow(
      "Run vitest run --coverage --project unit, and the stories with vitest run --project stories.",
    );
  });

  it("lets the stories run without coverage, and the unit project with it", () => {
    expect(configure("stories", false)).not.toThrow();
    expect(configure("unit", true)).not.toThrow();
  });
});
