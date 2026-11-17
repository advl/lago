import type { StoryRecord } from "../../catalog/index.js";
import readLook from "../readLook.js";
import { absentMarks } from "./constants.js";
import type { Mark } from "./types.js";

/** How a cell is shown: by its picture's look, or blank where there is none, left out or not drawn. */
export default function readMark(
  record: StoryRecord | undefined,
  leftOut: boolean,
): Mark {
  if (record) return readLook(record);
  return leftOut ? absentMarks.leftOut : absentMarks.notDrawn;
}
