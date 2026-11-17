import { measureText as measureCells } from "@aztlan/tui";
import {
  type CatalogComponent,
  type CatalogStory,
  findPicture,
  isLeftOut,
} from "../../catalog/index.js";
import {
  frameCells,
  measurePicture,
  pictureLines,
} from "../../layout/index.js";
import type { Hit } from "../../search/index.js";
import type { StoryFrame } from "../StoryBlock/types.js";
import wrapMessage from "../wrapMessage.js";
import { notDrawn, titleColumns } from "./constants.js";

/** Why a story has no picture at a viewport in a mode: its file leaves the mode out, or it is not drawn there. */
const describeAbsence = (
  story: CatalogStory,
  viewportName: string | undefined,
  mode: string | undefined,
) => (isLeftOut(story, viewportName, mode) ? `left out of ${mode}` : notDrawn);

/** The extent of a frame that shows text: an error, or the line that says why the story is not drawn. */
function measureMessage(
  error: string | undefined,
  absent: string,
  widest: number,
) {
  const text = error === undefined ? absent : error;
  const cols = Math.min(
    widest,
    Math.max(1, ...text.split("\n").map(measureCells)),
  );
  const rows = wrapMessage(text, cols).length;
  return { cols, rows: Math.min(pictureLines, Math.max(1, rows)) };
}

/**
 * The frames of a component's stories at `viewportName` in `mode`, the
 * base when it is none, in a region `room` columns wide: each as wide as its
 * picture, or as its error's text or the line that says why it is not drawn
 * there, and wider for its name up to `titleColumns`, never wider than the
 * room.
 */
export default function frameStories(
  component: CatalogComponent,
  viewportName: string | undefined,
  mode: string | undefined,
  selected: number,
  hits: readonly Hit[],
  room: number,
): StoryFrame[] {
  const widest = room - frameCells.cols;
  const matched = new Set(hits.map(({ story }) => story));
  return component.stories.map((story, place) => {
    const { name, description } = story;
    const record = findPicture(story, viewportName, mode);
    const absent = describeAbsence(story, viewportName, mode);
    const extent = record?.actual
      ? measurePicture(record.actual)
      : measureMessage(record?.error, absent, widest);
    // The title takes the selection's mark, the status glyph and a border's
    // corner either side of the name.
    const titled = Math.min(measureCells(name) + 6, titleColumns);
    return {
      name,
      description,
      record,
      absent,
      extent: {
        cols: Math.min(widest, Math.max(extent.cols, titled)),
        rows: extent.rows,
      },
      selected: place === selected,
      matched: matched.has(place),
    };
  });
}
