import type { Viewport } from "../render/index.js";
import { viewportName } from "./constants.js";

const isSize = (value: unknown) =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

/**
 * The sizes one story is drawn at: the configured ones, as the story's
 * `parameters.viewports` changes them. An entry under a configured name
 * changes that viewport, so `{ narrow: { rows: 12 } }` draws it on 12 lines;
 * an entry under a new name adds a viewport, and gives both its size and
 * its lines. `where` names the story in the error for an entry that cannot
 * be drawn.
 */
export default function resolveViewports(
  configured: Readonly<Record<string, Viewport>>,
  asked: unknown,
  where: string,
): Record<string, Viewport> {
  if (asked === undefined) return { ...configured };
  const refuse = (reason: string): never => {
    throw new Error(`${where}: parameters.viewports ${reason}.`);
  };
  if (typeof asked !== "object" || asked === null || Array.isArray(asked)) {
    refuse("must be an object of viewports by name");
  }
  const sizes: Record<string, Viewport> = { ...configured };
  for (const [name, entry] of Object.entries(asked as object)) {
    if (!viewportName.test(name)) {
      refuse(
        `names ${JSON.stringify(name)}, which cannot be part of a file's name; use letters, digits, - and _`,
      );
    }
    const given = (
      typeof entry === "object" && entry !== null ? entry : {}
    ) as {
      cols?: unknown;
      rows?: unknown;
    };
    const known = Object.hasOwn(configured, name)
      ? configured[name]
      : undefined;
    const cols = given.cols ?? known?.cols;
    const rows = given.rows ?? known?.rows;
    if (!isSize(cols) || !isSize(rows)) {
      refuse(
        `gives ${name} no size it can be drawn at: ${known ? "a change" : "a new viewport"} needs ${known ? "whole numbers above 0" : "cols and rows, whole numbers above 0"}`,
      );
    }
    sizes[name] = { cols: cols as number, rows: rows as number };
  }
  return sizes;
}
