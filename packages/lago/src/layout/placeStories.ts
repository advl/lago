import { fitField } from "@aztlan/tui";
import {
  descriptionColumns,
  frameCells,
  gutter,
  pictureLines,
} from "./constants.js";
import type { Arrangement, Extent, StoryBlock } from "./types.js";

/** What placing a story reads: its name, its description, and its picture's extent. */
export interface PlacedStory {
  readonly name: string;
  readonly description: string | undefined;
  readonly extent: Extent;
}

/** The lines a picture's frame takes in the list, its picture cut at `pictureLines`. */
const measureFrame = ({ rows }: Extent) =>
  Math.min(rows, pictureLines) + frameCells.rows;

/**
 * A component's stories as the blocks of the list, in a region `room`
 * columns wide. Beside, two stories share a block, as tall as the taller
 * frame. In rows, each story has a block, with its description wrapped
 * beside its picture where at least `descriptionColumns` remain, and under
 * it otherwise.
 */
export default function placeStories<Story extends PlacedStory>(
  stories: readonly Story[],
  arrangement: Arrangement,
  room: number,
): StoryBlock<Story>[] {
  if (arrangement === "beside") {
    const blocks: StoryBlock<Story>[] = [];
    for (let place = 0; place < stories.length; place += 2) {
      const pair = stories.slice(place, place + 2);
      blocks.push({
        key: pair.map(({ name }) => name).join(" "),
        stories: pair,
        lines: Math.max(...pair.map(({ extent }) => measureFrame(extent))),
        description: [],
        under: false,
      });
    }
    return blocks;
  }
  return stories.map((story) => {
    const { name, description, extent } = story;
    const frame = measureFrame(extent);
    const beside = room - extent.cols - frameCells.cols - gutter;
    const under = beside < descriptionColumns;
    const text = description
      ? fitField(
          { text: description, kind: "quote" },
          "block",
          under ? room : beside,
        )
      : [];
    return {
      key: name,
      stories: [story],
      lines: under ? frame + text.length : Math.max(frame, text.length),
      description: text,
      under,
    };
  });
}
