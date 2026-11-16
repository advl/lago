import { attributesSeenOnSpaces } from "./constants.js";
import type { Color, Run } from "./types.js";

/**
 * A run while it is being grouped. `bare` while it holds only spaces that
 * show nothing but their background.
 */
interface Stretch extends Run {
  readonly bare: boolean;
}

const marksSpaces = ({ attributes }: Run) =>
  attributes.some((attribute) => attributesSeenOnSpaces.includes(attribute));

const hasSameStyle = (one: Run, other: Run) =>
  one.fg === other.fg && one.attributes.join() === other.attributes.join();

/** `count` spaces from column `x` that show nothing but the background `bg`. */
const createGap = (x: number, count: number, bg: Color): Stretch => ({
  x,
  text: " ".repeat(count),
  width: count,
  fg: "default",
  bg,
  attributes: [],
  bare: true,
});

/**
 * A run as the stretches a reader can tell apart: the spaces at its two ends
 * show only their background, unless the run underlines, strikes or inverts.
 */
function splitRun(run: Run): Stretch[] {
  if (marksSpaces(run)) return [{ ...run, bare: false }];
  const leading = run.text.search(/[^ ]|$/);
  const core = run.text.slice(leading).replace(/ +$/, "");
  const trailing = run.text.length - leading - core.length;
  const stretches: Stretch[] = [];
  if (leading > 0) stretches.push(createGap(run.x, leading, run.bg));
  if (core !== "") {
    stretches.push({
      ...run,
      x: run.x + leading,
      text: core,
      width: run.width - leading - trailing,
      bare: false,
    });
  }
  if (trailing > 0) {
    stretches.push(createGap(run.x + run.width - trailing, trailing, run.bg));
  }
  return stretches;
}

/** The two as one stretch when no reader could tell where one ends, else nothing. */
function joinStretches(current: Stretch, next: Stretch): Stretch | undefined {
  if (current.bg !== next.bg) return undefined;
  const joined = {
    x: current.x,
    text: current.text + next.text,
    width: current.width + next.width,
  };
  if (current.bare)
    return marksSpaces(next) ? undefined : { ...next, ...joined };
  if (next.bare)
    return marksSpaces(current) ? undefined : { ...current, ...joined };
  return hasSameStyle(current, next) ? { ...current, ...joined } : undefined;
}

/** The run a stretch ends as: nothing when it shows nothing, without the spaces that show nothing. */
function finishStretch({ bare: _, ...run }: Stretch): Run[] {
  if (run.bg !== "default" || marksSpaces(run)) return [run];
  const leading = run.text.search(/[^ ]|$/);
  const text = run.text.slice(leading).replace(/ +$/, "");
  if (text === "") return [];
  return [
    {
      ...run,
      x: run.x + leading,
      text,
      width: run.width - (run.text.length - text.length),
    },
  ];
}

/**
 * One line's runs as a reader sees them, so that two lines that look the same
 * give the same runs however they were drawn.
 *
 * A space that is not underlined, struck through or inverted shows only its
 * background: its text colour and weight cannot be seen and are dropped. Such
 * a space joins the run before it when their backgrounds agree, and otherwise
 * the run after it. Runs are then split where the style changes and nowhere
 * else. A run on the terminal's own background loses the spaces at its ends,
 * and a run of nothing but such spaces is left out.
 */
export default function normalizeRuns(runs: readonly Run[]): Run[] {
  const stretches: Stretch[] = [];
  let column = 0;
  for (const run of runs) {
    if (run.x > column) {
      stretches.push(createGap(column, run.x - column, "default"));
    }
    stretches.push(...splitRun(run));
    column = run.x + run.width;
  }
  const grouped: Stretch[] = [];
  for (const stretch of stretches) {
    const last = grouped.at(-1);
    const joined = last && joinStretches(last, stretch);
    if (joined) grouped.splice(-1, 1, joined);
    else grouped.push(stretch);
  }
  return grouped.flatMap(finishStretch);
}
