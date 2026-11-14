import { createConfig } from "@aztlan/lago-config";

// The components are tested as any project that uses them would test its
// own: by Lago, configured by Lago's one function.
export default createConfig({
  viewports: { narrow: { cols: 40, rows: 36 }, wide: { cols: 60, rows: 36 } },
  coverage: true,
});
