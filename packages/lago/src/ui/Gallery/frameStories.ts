import { measureText as measureCells } from "@aztlan/tui";
import type { CatalogComponent } from "../../catalog/index.js";
import {
  frameCells,
  measurePicture,
  pictureLines,
} from "../../layout/index.js";
import type { Hit } from "../../search/index.js";
import type { StoryFrame } from "../StoryBlock/types.js";
import wrapMessage from "../wrapMessage.js";
import { notDrawn, titleColumns } from "./constants.js";

/** The extent of a frame that shows text: an error, or the line that says the story is not drawn. */
function measureMessage(error: string | undefined, widest: number) {
  const text = error === undefined ? notDrawn : error;
  const cols = Math.min(
    widest,
    Math.max(1, ...text.split("\n").map(measureCells)),
  );
  const rows = wrapMessage(text, cols).length;
  return { cols, rows: Math.min(pictureLines, Math.max(1, rows)) };
}

/**
 * The frames of a component's stories at `viewportName`, in a region `room`
 * columns wide: each as wide as its picture, or as its error's text or the
 * line that says it is not drawn there, and wider for its name up to
 * `titleColumns`, never wider than the room.
 */
export default function frameStories(
  component: CatalogComponent,
  viewportName: string | undefined,
  selected: number,
  hits: readonly Hit[],
  room: number,
): StoryFrame[] {
  const widest = room - frameCells.cols;
  const matched = new Set(hits.map(({ story }) => story));
  return component.stories.map(({ name, description, pictures }, place) => {
    const record = pictures.find((each) => each.viewportName === viewportName);
    const extent = record?.actual
      ? measurePicture(record.actual)
      : measureMessage(record?.error, widest);
    // The title takes the selection's mark, the status glyph and a border's
    // corner either side of the name.
    const titled = Math.min(measureCells(name) + 6, titleColumns);
    return {
      name,
      description,
      record,
      extent: {
        cols: Math.min(widest, Math.max(extent.cols, titled)),
        rows: extent.rows,
      },
      selected: place === selected,
      matched: matched.has(place),
    };
  });
}
