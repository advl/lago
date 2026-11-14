import {
  EmptyState,
  HelpOverlay,
  KeyBar,
  Loading,
  Pane,
  PaneHeader,
  ScrolledList,
  useCommands,
} from "@aztlan/tui";
import { useKeyboard, usePaste } from "@opentui/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { buildCatalog, type StoryRecord } from "../../catalog/index.js";
import { chooseArrangement } from "../../layout/index.js";
import {
  type GalleryAction,
  openingState,
  readSelection,
  reduceGallery,
} from "../../state/index.js";
import {
  chromeLines,
  minColumns,
  minLines,
  treeColumns,
} from "../constants.js";
import Inspect from "../Inspect/Inspect.js";
import measureInspected from "../Inspect/measureInspected.js";
import StatusLine from "../StatusLine/StatusLine.js";
import Tallies from "../Tallies/Tallies.js";
import buildStoryBlocks from "./buildStoryBlocks.js";
import buildTreeBlocks from "./buildTreeBlocks.js";
import { arrangementWords, helpNote } from "./constants.js";
import frameStories from "./frameStories.js";
import type { GalleryProps } from "./types.js";
import useGalleryKeys from "./useGalleryKeys.js";

const emptyCatalog = buildCatalog([]);

/** Whether a key is text typed into the filter or the search: one printable character. */
const isTyped = ({
  ctrl,
  meta,
  sequence,
}: {
  ctrl: boolean;
  meta: boolean;
  sequence: string;
}) =>
  !ctrl &&
  !meta &&
  [...sequence].length === 1 &&
  sequence >= " " &&
  sequence !== "\u007f";

/**
 * The gallery: the tree of components beside the selected component's
 * stories, each a frame around its picture, or one story inspected over the
 * whole region; the counts of every picture's status; a status line; and
 * the keys that work now. Every catalog a run gives is shown as it comes,
 * the reader kept on the component they had selected.
 */
const Gallery = ({
  catalog,
  name,
  onAccept,
  onQuit,
  width,
  height,
}: GalleryProps): ReactNode => {
  const known = catalog ?? emptyCatalog;
  const [state, setState] = useState(openingState);
  const [message, setMessage] = useState<string>();
  const [helpFirst, setHelpFirst] = useState(0);
  const treeFirst = useRef(0);
  const storiesFirst = useRef(0);
  const act = useCallback(
    (action: GalleryAction) => {
      setMessage(undefined);
      setState((now) => reduceGallery(now, action, known));
    },
    [known],
  );
  const selection = readSelection(state, known);
  const { component, viewportName, record, confirming } = selection;
  const story = component?.stories.at(selection.story);
  const lines = height - chromeLines;
  const inspected =
    state.inspecting && story && viewportName !== undefined
      ? measureInspected({
          record,
          viewportName,
          difference: state.difference,
          width,
          height: lines,
        })
      : undefined;
  // Only an inspected story's scroll and cursor have an end, which only
  // the screen knows.
  const limits = inspected
    ? { scroll: inspected.scroll, ...inspected.cell }
    : { scroll: 0, x: 0, y: 0 };
  // A run that removes or redraws the picture asked about drops the question.
  useEffect(() => {
    if (state.confirming && !confirming) act({ type: "cancel" });
  }, [state.confirming, confirming, act]);
  const accept = useCallback(
    (asked: StoryRecord) => {
      act({ type: "cancel" });
      const where = `${asked.name} at ${asked.viewportName}`;
      onAccept(asked).then(
        () => setMessage(`accepted ${where}`),
        (error: unknown) =>
          setMessage(
            `${where} was not accepted: ${String(error).replace(/^Error: /, "")}`,
          ),
      );
    },
    [act, onAccept],
  );
  const scrollHelp = useCallback(
    (by: number) => setHelpFirst((first) => Math.max(0, first + by)),
    [],
  );
  useGalleryKeys({
    state,
    record,
    asking: confirming,
    selected: component !== undefined,
    viewports: known.viewports.length,
    limits,
    tooSmall: width < minColumns || height < minLines,
    act,
    scrollHelp,
    accept,
    quit: onQuit,
  });
  useKeyboard((key) => {
    if (isTyped(key)) act({ type: "type", text: key.sequence });
  });
  // A paste arrives whole, apart from the keys; it is typed as one line.
  usePaste(({ bytes }) =>
    act({
      type: "type",
      text: new TextDecoder().decode(bytes).replace(/[\r\n]+/g, " "),
    }),
  );
  const active = useCommands({ visibility: "active" });
  const registered = useCommands({ visibility: "registered" });
  const room = width - treeColumns;

  let region: ReactNode;
  if (state.inspecting && story && viewportName !== undefined) {
    region = (
      <Inspect
        name={story.name}
        viewportName={viewportName}
        record={record}
        scroll={state.scroll}
        difference={state.difference}
        {...(state.cell && { cell: state.cell })}
        width={width}
        height={lines}
      />
    );
  } else {
    let tree: ReactNode;
    if (!catalog) {
      tree = (
        <Loading
          label={{ text: "running the stories…", kind: "words" }}
          width={treeColumns - 1}
        />
      );
    } else if (selection.components.length === 0) {
      const text =
        state.filter === ""
          ? "no stories yet: write a .stories.tsx file"
          : `no component matches “${state.filter}”`;
      tree = (
        <EmptyState message={{ text, kind: "words" }} width={treeColumns - 1} />
      );
    } else {
      const placed = buildTreeBlocks(
        selection.components,
        component?.title,
        treeColumns - 1,
      );
      tree = (
        <ScrolledList
          {...placed}
          height={lines}
          first={treeFirst.current}
          onShown={(_, first) => {
            treeFirst.current = first;
          }}
          width={treeColumns - 1}
        />
      );
    }
    let stories: ReactNode = null;
    if (component) {
      const frames = frameStories(
        component,
        viewportName,
        selection.story,
        selection.hits,
        room,
      );
      const arrangement =
        state.arrangement === "auto"
          ? chooseArrangement(
              frames.map(({ extent }) => extent),
              room,
            )
          : state.arrangement;
      stories = (
        <ScrolledList
          {...buildStoryBlocks(frames, arrangement, room)}
          height={lines}
          first={storiesFirst.current}
          onShown={(_, first) => {
            storiesFirst.current = first;
          }}
          width={room}
        />
      );
    }
    region = (
      <box flexDirection="row" height={lines}>
        <box width={treeColumns - 1} marginRight={1}>
          {tree}
        </box>
        <box width={room}>{stories}</box>
      </box>
    );
  }

  const where =
    state.focus === "tree" || !component
      ? { text: name, kind: "identifier" }
      : { text: component.title, kind: "identifier" };
  return (
    <Pane
      name="lago"
      minColumns={minColumns}
      minLines={minLines}
      width={width}
      height={height}
      header={
        <PaneHeader
          title={where}
          {...(viewportName !== undefined && {
            address: { text: `at ${viewportName}`, kind: "words" },
            sort: { text: arrangementWords[state.arrangement], kind: "words" },
          })}
          width={width}
        />
      }
      counts={
        catalog ? (
          <Tallies
            tallies={catalog.tallies}
            failures={catalog.failures.length}
            width={width}
          />
        ) : (
          <text> </text>
        )
      }
      status={
        <StatusLine
          state={state}
          selection={selection}
          catalog={catalog}
          message={message}
          width={width}
        />
      }
      keys={<KeyBar commands={active} width={width} />}
      {...(state.help && {
        help: (
          <HelpOverlay
            commands={registered}
            note={{ text: helpNote, kind: "words" }}
            width={width}
            height={height - 1}
            first={helpFirst}
            onShown={(_, first) => setHelpFirst(first)}
          />
        ),
      })}
    >
      {region}
    </Pane>
  );
};

export default Gallery;
