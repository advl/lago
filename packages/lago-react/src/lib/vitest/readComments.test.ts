import { describe, expect, it } from "vitest";
import readComments from "./readComments.js";

const source = `import Component from "./Label.js";

/** Not a story's: an import stands in between. */
const meta = { title: "fixtures/Label", component: Component };

export default meta;

/** Empty, with its placeholder. */
export const Second = {};

/**
 * Over two lines,
 * with \`code\` in it.
 */
export const First: Story = { args: {} };

// A line comment is not documentation.
export const Plain = {};

/* Nor is a block comment with one star. */
export const Starred = {};

/** Above a statement that is not the export. */
const helper = 1;
export const AfterCode = { helper };

/** A function story. */
export function AsFunction() {
  return null;
}

/** Two at once share a comment. */
export const Left = {}, Right = {};

export const { Unnamed } = { Unnamed: {} };

export type Story = Record<string, unknown>;
export { helper };
`;

describe("readComments", () => {
  it("gives the comment directly above each story's export, in the file's order", () => {
    const comments = readComments("Label.stories.tsx", source);
    expect(Object.entries(comments)).toEqual([
      ["Second", "Empty, with its placeholder."],
      ["First", "Over two lines, with `code` in it."],
      ["Plain", ""],
      ["Starred", ""],
      ["AfterCode", ""],
      ["AsFunction", "A function story."],
      ["Left", "Two at once share a comment."],
      ["Right", "Two at once share a comment."],
    ]);
  });
});
