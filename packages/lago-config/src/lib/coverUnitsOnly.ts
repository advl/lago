import type { Plugin } from "vitest/config";

/**
 * Refuses a coverage run that includes the stories project. Coverage counts
 * every line any test ran, and a line a story merely draws would count as
 * tested: the unit project is measured alone, and the stories are run apart.
 */
const coverUnitsOnly: Plugin = {
  name: "lago:cover-units-only",
  configureVitest({ vitest, project }) {
    if (vitest.config.coverage.enabled && project.name === "stories") {
      throw new Error(
        "Coverage is measured on the unit project alone, so that a line a story merely draws does not count as tested. Run vitest run --coverage --project unit, and the stories with vitest run --project stories.",
      );
    }
  },
};

export default coverUnitsOnly;
