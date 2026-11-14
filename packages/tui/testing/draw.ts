import { render, type Screen } from "@aztlan/lago-react";
import type { ReactNode } from "react";

/** Mounts `node` on a screen `width` columns wide and `height` lines tall. */
export default function draw(
  node: ReactNode,
  width: number,
  height = 12,
): Promise<Screen> {
  return render(node, { cols: width, rows: height });
}
