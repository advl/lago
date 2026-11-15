import { describe, expect, it } from "vitest";
import { fitRules } from "./constants.js";
import fitField from "./fitField.js";
import measureText from "./measureText.js";
import type { FitRules } from "./types.js";

/** A text of each kind, longer than 40 cells, as a list would give it. */
const samples: Readonly<Record<string, string>> = {
  identifier: "example-repository-with-a-very-long-name#12345",
  title: "Fix the parser so it keeps comments at the ends of lines",
  quote: "Could you look at the parser again once the tests are green?",
  words: "requested review from every owner of the repository",
  reason: "example.com gave no answer within 30 seconds, so nothing was read",
  recovery: "check the network connection and https://status.example.com",
  figure: "12345w over by far and more",
};

/** What each kind becomes on one line and in a block, at 40 and 60 cells. */
const table: Readonly<
  Record<string, Record<40 | 60, { line: string; block: string[] }>>
> = {
  identifier: {
    40: {
      line: "example-repository-…very-long-name#12345",
      block: ["example-repository-with-a-very-long-name", "#12345"],
    },
    60: {
      line: "example-repository-with-a-very-long-name#12345",
      block: ["example-repository-with-a-very-long-name#12345"],
    },
  },
  title: {
    40: {
      line: "Fix the parser so it keeps comments at …",
      block: ["Fix the parser so it keeps comments at", "the ends of lines"],
    },
    60: {
      line: "Fix the parser so it keeps comments at the ends of lines",
      block: ["Fix the parser so it keeps comments at the ends of lines"],
    },
  },
  quote: {
    40: {
      line: "Could you look at the parser again once…",
      block: [
        "Could you look at the parser again once",
        "the tests are green?",
      ],
    },
    60: {
      line: "Could you look at the parser again once the tests are green?",
      block: ["Could you look at the parser again once the tests are green?"],
    },
  },
  words: {
    40: {
      line: "requested review from every owner of th…",
      block: ["requested review from every owner of the", "repository"],
    },
    60: {
      line: "requested review from every owner of the repository",
      block: ["requested review from every owner of the repository"],
    },
  },
  reason: {
    40: {
      line: "example.com gave no answer within 30 se…",
      block: [
        "example.com gave no answer within 30",
        "seconds, so nothing was read",
      ],
    },
    60: {
      line: "example.com gave no answer within 30 seconds, so nothing wa…",
      block: [
        "example.com gave no answer within 30 seconds, so nothing was",
        "read",
      ],
    },
  },
  recovery: {
    40: {
      line: "check the network connection and https:…",
      block: ["check the network connection and", "https://status.example.com"],
    },
    60: {
      line: "check the network connection and https://status.example.com",
      block: ["check the network connection and https://status.example.com"],
    },
  },
  figure: {
    40: {
      line: "12345w over by far and more",
      block: ["12345w over by far and more"],
    },
    60: {
      line: "12345w over by far and more",
      block: ["12345w over by far and more"],
    },
  },
};

describe("fitField", () => {
  it("has a rule in the base table for every kind sampled here", () => {
    expect(Object.keys(fitRules).sort()).toEqual(Object.keys(samples).sort());
  });

  for (const kind of Object.keys(samples)) {
    for (const cells of [40, 60] as const) {
      it(`fits a ${kind} to a line and a block of ${cells} cells by its rule`, () => {
        const field = { text: samples[kind] as string, kind };
        expect({
          line: fitField(field, "line", cells),
          block: fitField(field, "block", cells),
        }).toEqual(table[kind]?.[cells]);
      });
    }
  }

  it("never lets a line pass its cells, unless the rule keeps the field whole", () => {
    for (const [kind, text] of Object.entries(samples)) {
      const line = fitField({ text, kind }, "line", 40);
      if (fitRules[kind]?.line !== "whole") {
        expect(measureText(line)).toBeLessThanOrEqual(40);
      }
    }
  });

  it("removes control sequences from every slot", () => {
    const field = { text: "Fix\u001b[2J it", kind: "title" };
    expect(fitField(field, "line", 40)).toBe("Fix it");
    expect(fitField(field, "block", 40)).toEqual(["Fix it"]);
    expect(fitField({ ...field, kind: "figure" }, "line", 40)).toBe("Fix it");
    expect(fitField({ ...field, kind: "figure" }, "block", 40)).toEqual([
      "Fix it",
    ]);
  });

  describe("with a table of the caller's own", () => {
    const rules: FitRules = {
      ...fitRules,
      team: {
        line: { drop: /^[^/]*\//, cut: "cutEnd" },
        block: "wrap",
      },
      path: {
        line: { drop: /^\/srv\/[^/]+/, cut: "cutMiddle" },
        block: "whole",
      },
    };

    it("fits a kind the base table does not have, by the caller's rule", () => {
      const team = {
        text: "example-org/a-team-with-a-long-name",
        kind: "team",
      };
      expect(fitField(team, "line", 40, rules)).toBe("a-team-with-a-long-name");
      expect(fitField(team, "line", 12, rules)).toBe("a-team-with…");
      expect(fitField(team, "block", 20, rules)).toEqual([
        "example-org/a-team-w",
        "ith-a-long-name",
      ]);
    });

    it("drops what a line can do without, then cuts by the rule it names", () => {
      const path = { text: "/srv/example/src/app/index.ts", kind: "path" };
      expect(fitField(path, "line", 40, rules)).toBe("/src/app/index.ts");
      expect(fitField(path, "line", 12, rules)).toBe("/src/…dex.ts");
      expect(fitField(path, "block", 12, rules)).toEqual([
        "/srv/example/src/app/index.ts",
      ]);
    });

    it("refuses a kind the table has no rule for, naming it", () => {
      expect(() => fitField({ text: "x", kind: "team" }, "line", 40)).toThrow(
        'No rule fits text of the kind "team". The kinds the table has are identifier, title, quote, words, reason, recovery, figure; pass a table with this one.',
      );
      expect(() =>
        fitField({ text: "x", kind: "toString" }, "block", 40),
      ).toThrow('No rule fits text of the kind "toString".');
    });
  });
});
