/**
 * A scratch project's vitest configuration, as `makeProject` writes it,
 * that names `chrome` (written as source, a string in its quotes) in the
 * plugin the gallery reads its chrome from.
 */
export default function writeChromeConfig(chrome: string): string {
  return `import { createConfig } from "@aztlan/lago-config";
import { mergeConfig } from "vitest/config";

export default mergeConfig(
  createConfig({ viewports: { small: { cols: 20, rows: 3 } } }),
  {
    plugins: [{ name: "lago:gallery", api: { chrome: ${chrome} } }],
    test: { fsModuleCachePath: ".vitest-cache" },
  },
);
`;
}
