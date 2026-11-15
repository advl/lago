import type { Catalog, StoryRecord } from "../../catalog/index.js";
import type { GalleryAction, GalleryState } from "../../state/index.js";

/** Props for the Gallery component. */
export interface GalleryProps {
  /** The latest run's catalog; absent while the first run is under way. */
  catalog: Catalog | undefined;
  /** The project's name, as the header shows it on the tree. */
  name: string;
  /** Writes a picture as its story's golden. */
  onAccept: (record: StoryRecord) => Promise<void>;
  /** Closes the gallery. */
  onQuit: () => void;
  /** The width of the terminal, in display cells. */
  width: number;
  /** The height of the terminal, in lines. */
  height: number;
}

/** Props for the useGalleryKeys hook. */
export interface UseGalleryKeysProps {
  readonly state: GalleryState;
  /** The selected story's picture at the viewport shown. */
  readonly record: StoryRecord | undefined;
  /** The picture the gallery asks to confirm accepting, while it asks. */
  readonly asking: StoryRecord | undefined;
  /** Whether a component is selected. */
  readonly selected: boolean;
  /** How many viewports the stories are drawn at. */
  readonly viewports: number;
  /** The furthest an inspected story scrolls, and the furthest cell its cursor reaches. */
  readonly limits: {
    readonly scroll: number;
    readonly x: number;
    readonly y: number;
  };
  /** Whether the terminal is too small to draw the gallery, when no key but quitting acts. */
  readonly tooSmall: boolean;
  readonly act: (action: GalleryAction) => void;
  /** Scrolls the help by `by` lines. */
  readonly scrollHelp: (by: number) => void;
  /** Accepts the picture asked about, once confirmed. */
  readonly accept: (record: StoryRecord) => void;
  readonly quit: () => void;
}
