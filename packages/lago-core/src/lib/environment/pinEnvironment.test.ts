import { afterAll, beforeAll, describe, expect, it } from "vitest";
import pinEnvironment from "./pinEnvironment.js";

const names = [
  "FORCE_COLOR",
  "COLORTERM",
  "CI",
  "CONTINUOUS_INTEGRATION",
  "TF_BUILD",
] as const;

describe("pinEnvironment", () => {
  const before = Object.fromEntries(
    names.map((name) => [name, process.env[name]]),
  );
  beforeAll(() => {
    process.env.FORCE_COLOR = "1";
    process.env.CI = "true";
    process.env.CONTINUOUS_INTEGRATION = "true";
    delete process.env.COLORTERM;
    delete process.env.TF_BUILD;
  });
  afterAll(() => {
    for (const name of names) {
      const value = before[name];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it("gives the running test full colour, and removes the marks of a pipeline", () => {
    pinEnvironment();
    expect(process.env.FORCE_COLOR).toBe("3");
    expect(process.env.COLORTERM).toBe("truecolor");
    expect("CI" in process.env).toBe(false);
    expect("CONTINUOUS_INTEGRATION" in process.env).toBe(false);
  });

  it("puts back a value that was set, and removes one that was not, once the test ends", () => {
    expect(process.env.FORCE_COLOR).toBe("1");
    expect(process.env.CI).toBe("true");
    expect(process.env.CONTINUOUS_INTEGRATION).toBe("true");
    expect("COLORTERM" in process.env).toBe(false);
    expect("TF_BUILD" in process.env).toBe(false);
  });
});
