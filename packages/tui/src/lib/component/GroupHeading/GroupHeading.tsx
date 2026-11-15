import type { ReactNode } from "react";
import { fitField, fitRules, measurePieces } from "../../fit/index.js";
import { tokens } from "../../tokens/index.js";
import type { GroupHeadingProps } from "./types.js";

/**
 * One line naming a group in a list: its name, a space, then a `─` rule to
 * the region's edge. The rule is horizontal on purpose: a row's marks run
 * down the screen, so the two strokes read as two structures, a section and
 * an item. Pinned above its rows while they scroll, it gives the group's
 * count after the name, `Mode · 3 of 5`, plain. The name gives way so the
 * count and a rule always follow it, and it is never bold, which is kept for
 * what a row puts first. A help reuses the heading for its groups of keys.
 * The selection never lands on a heading, so it has no selected state and
 * takes no background.
 */
const GroupHeading = ({
  name,
  count,
  width,
  rules = fitRules,
}: GroupHeadingProps): ReactNode => {
  const counted =
    count === undefined ? "" : ` · ${fitField(count, "line", width, rules)}`;
  // A space and one cell of rule always follow the name and its count.
  const room = width - 2 - measurePieces([{ text: counted }]);
  const pieces =
    typeof name === "function"
      ? name(room)
      : [
          {
            text: fitField(name, "line", room, rules),
            fg: tokens["color.text"],
          },
        ];
  const rule =
    width - measurePieces(pieces) - measurePieces([{ text: counted }]) - 1;
  return (
    <text>
      {pieces.map(({ text, fg, attributes }, place) => (
        // The name's runs never reorder, so their place is their key.
        // biome-ignore lint/suspicious/noArrayIndexKey: see above.
        <span key={place} fg={fg} attributes={attributes}>
          {text}
        </span>
      ))}
      <span fg={tokens["color.text"]}>
        {`${counted} ${tokens["glyph.rule"].repeat(Math.max(1, rule))}`}
      </span>
    </text>
  );
};

export default GroupHeading;
