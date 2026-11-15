import type { ReactNode } from "react";

/**
 * One block of a scrolled list, drawn whole or not at all, but for the
 * first: a group's heading, carrying what names the group above its rows
 * once it is pinned, or a row with what opens under it. Each carries the
 * key React names it by among its siblings, and the lines it takes. A node
 * may be a factory, called only when its block is visible.
 */
export type ListBlock<Heading = string> =
  | {
      readonly kind: "heading";
      readonly key: string;
      readonly lines: number;
      readonly node: ReactNode | (() => ReactNode);
      readonly heading: Heading;
    }
  | {
      readonly kind: "row";
      readonly key: string;
      readonly lines: number;
      readonly node: ReactNode | (() => ReactNode);
    };

/** What a block of a scrolled list is: a group's heading, or a row. */
export type ListBlockKind = ListBlock["kind"];

/** What placing a list reads of each block: what it is, and its lines. */
export type PlacedBlock<Heading = string> =
  | {
      readonly kind: "heading";
      readonly lines: number;
      readonly heading: Heading;
    }
  | { readonly kind: "row"; readonly lines: number };

/** Where the selection is, the room the list has, and where it was. */
export interface PlaceListOptions {
  /**
   * The first block that must be whole in view: the selected row, or the
   * heading above it when the row is the first of its group.
   */
  readonly from: number;
  /** The last block that must be whole in view: the selected row. */
  readonly to: number;
  /** The lines the list region has. */
  readonly room: number;
  /** The first block shown before. */
  readonly first: number;
}

/** Where a scrolled list starts, and what it shows from there. */
export interface ListPlacement<Heading = string> {
  /** The place of the first block shown. */
  readonly first: number;
  /** How many blocks are shown from the first, whole but for the first. */
  readonly shown: number;
  /**
   * How many rows are cut off below the blocks shown, in whichever group,
   * which the list's last line signs; none while the room is the first
   * block's alone.
   */
  readonly below: number;
  /**
   * The heading pinned above the first block, when that block is a row of
   * a group: the group's heading, the place in the group of the first row
   * shown, counted from one, and the group's rows.
   */
  readonly pinned?: {
    readonly heading: Heading;
    readonly place: number;
    readonly size: number;
  };
}

/** Props for the useListScroll hook. */
export interface UseListScrollProps<Heading = string> {
  /**
   * The list's blocks, in order: a heading, or a row with what opens under
   * it. Each gives what it is and the lines it takes.
   */
  readonly blocks: readonly ListBlock<Heading>[];
  /**
   * The first block that must be whole in view: the selected row, or the
   * heading above it when the row is the first of its group.
   */
  readonly from: number;
  /** The last block that must be whole in view: the selected row. */
  readonly to: number;
  /** The lines the list region has. */
  readonly room: number;
  /**
   * The first block shown when the list is drawn anew, such as where it
   * was scrolled before a help or a screen too small took its place; the
   * top of the list when absent.
   */
  readonly first?: number;
}

/** Result of the useListScroll hook: what the list draws, and from where. */
export interface UseListScrollResult<Heading = string>
  extends Omit<ListPlacement<Heading>, "shown"> {
  /**
   * The blocks to draw, in order: whole blocks only, as many as fit the
   * room between the pinned heading and the sign of the rows cut off, and
   * always the first, whatever its height.
   */
  readonly shown: readonly ListBlock<Heading>[];
}
