import type { GroupName, ListBlock } from "@aztlan/tui";
import { type Arrangement, placeStories } from "../../layout/index.js";
import StoryBlock from "../StoryBlock/StoryBlock.js";
import type { StoryFrame } from "../StoryBlock/types.js";

/**
 * The stories list's blocks, as `arrangement` places the frames in a
 * region `room` columns wide, and the place of the block that holds the
 * selected story.
 */
export default function buildStoryBlocks(
  frames: readonly StoryFrame[],
  arrangement: Arrangement,
  room: number,
) {
  const placed = placeStories(frames, arrangement, room);
  const blocks: ListBlock<GroupName>[] = placed.map(
    ({ key, stories, lines, description, under }) => ({
      kind: "row",
      key,
      lines,
      node: () => (
        <StoryBlock frames={stories} description={description} under={under} />
      ),
    }),
  );
  const at = Math.max(
    0,
    placed.findIndex(({ stories }) => stories.some(({ selected }) => selected)),
  );
  return { blocks, from: at, to: at };
}
