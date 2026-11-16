import { fitRuns, type Piece, useTokens } from "@aztlan/tui";
import type { ReactNode } from "react";
import { statusLooks } from "../constants.js";
import type { TalliesProps } from "./types.js";

const order = ["pass", "changed", "new", "error"] as const;

/**
 * The counts line: how many pictures pass, changed, are new and failed,
 * each with its glyph, then the stories files that failed to load, when
 * any did.
 */
const Tallies = ({ tallies, failures, width }: TalliesProps): ReactNode => {
  const tokens = useTokens();
  const counts: Piece[] = order.map((status) => ({
    text: `${statusLooks[status].glyph} ${tallies[status]} ${statusLooks[status].word}`,
    fg:
      tallies[status] > 0 && status !== "pass"
        ? tokens[statusLooks[status].color]
        : tokens["color.text"],
  }));
  if (failures > 0) {
    counts.push({
      text: `${statusLooks.error.glyph} ${failures} ${failures === 1 ? "file" : "files"} failed to load`,
      fg: tokens[statusLooks.error.color],
    });
  }
  const pieces = counts.flatMap((piece, place) =>
    place === 0
      ? [piece]
      : [{ text: " · ", fg: tokens["color.text.muted"] }, piece],
  );
  return (
    <text>
      {fitRuns(pieces, width).map(({ text, fg }, place) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: the pieces are a line's runs, in a fixed order.
        <span key={place} fg={fg}>
          {text}
        </span>
      ))}
    </text>
  );
};

export default Tallies;
