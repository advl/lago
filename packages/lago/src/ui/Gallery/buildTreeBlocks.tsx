import { GroupHeading, type GroupName, type ListBlock } from "@aztlan/tui";
import type { CatalogComponent } from "../../catalog/index.js";
import TreeRow from "../TreeRow/TreeRow.js";

/**
 * The tree's blocks: each group's heading, then its components' rows, with
 * the places that must be in view for the selected component: its row, and
 * its group's heading when it is the group's first.
 */
export default function buildTreeBlocks(
  components: readonly CatalogComponent[],
  selected: string | undefined,
  width: number,
) {
  const blocks: ListBlock<GroupName>[] = [];
  let from = 0;
  let to = 0;
  for (const component of components) {
    if (
      blocks.findLast(({ kind }) => kind === "heading")?.key !==
      `group ${component.group}`
    ) {
      const heading = { text: component.group, kind: "words" };
      blocks.push({
        kind: "heading",
        key: `group ${component.group}`,
        lines: 1,
        heading,
        node: <GroupHeading name={heading} width={width} />,
      });
    }
    const isSelected = component.title === selected;
    if (isSelected) {
      to = blocks.length;
      from = blocks.at(-1)?.kind === "heading" ? to - 1 : to;
    }
    blocks.push({
      kind: "row",
      key: component.title,
      lines: 1,
      node: (
        <TreeRow component={component} selected={isSelected} width={width} />
      ),
    });
  }
  return { blocks, from, to };
}
