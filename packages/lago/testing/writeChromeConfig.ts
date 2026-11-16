/**
 * A scratch project's vitest configuration, as `makeProject` writes it, made
 * by createConfig with `chrome` as the gallery's chrome. `chrome` is
 * source, so a name is written in its quotes, and a set of tokens may use
 * `tokens` and `RGBA`, which the configuration imports.
 */
export default function writeChromeConfig(chrome: string): string {
  return `import { createConfig } from "@aztlan/lago-config";
import { tokens } from "@aztlan/tui";
import { RGBA } from "@opentui/core";
import { mergeConfig } from "vitest/config";

export default mergeConfig(
  createConfig({
    viewports: { small: { cols: 20, rows: 3 } },
    gallery: { chrome: ${chrome} },
  }),
  { test: { fsModuleCachePath: ".vitest-cache" } },
);
`;
}
