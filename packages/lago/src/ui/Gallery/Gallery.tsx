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
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buildCatalog,
  isLeftOut,
  type StoryRecord,
} from "../../catalog/index.js";
import { chooseArrangement } from "../../layout/index.js";
import {
  type GalleryControl,
  noContributions,
  type Palette,
  type PluginSelection,
} from "../../plugins/index.js";
import {
  type GalleryAction,
  listColumns,
  openingState,
  readSelection,
  reduceGallery,
} from "../../state/index.js";
import { barLines, minColumns, minLines, treeColumns } from "../constants.js";
import describePlace from "../describePlace.js";
import Inspect from "../Inspect/Inspect.js";
import measureInspected from "../Inspect/measureInspected.js";
import Matrix from "../Matrix/Matrix.js";
import type { MatrixWindow } from "../Matrix/types.js";
import { PaletteContext } from "../Palette/index.js";
import { PluginStatus, placeStatusItems } from "../PluginStatus/index.js";
import StatusLine from "../StatusLine/StatusLine.js";
import Tallies from "../Tallies/Tallies.js";
import buildStoryBlocks from "./buildStoryBlocks.js";
import buildTreeBlocks from "./buildTreeBlocks.js";
import { arrangementWords, helpNote } from "./constants.js";
import frameStories from "./frameStories.js";
import type { GalleryProps } from "./types.js";
import useGalleryKeys from "./useGalleryKeys.js";
import usePluginKeys from "./usePluginKeys.js";

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
 * whole region; the counts of every picture's status; a status line,
 * ending with the palette and the plugins' items; and the keys that work
 * now, the plugins' among them. Every catalog a run gives is shown as it
 * comes, the reader kept on the component they had selected. The palette
 * is the one the plugins open on until `t` changes it, for the session
 * alone, and is given to everything drawn inside.
 */
const Gallery = ({
  catalog,
  name,
  onAccept,
  onQuit,
  width,
  height,
  plugins = noContributions,
}: GalleryProps): ReactNode => {
  const known = catalog ?? emptyCatalog;
  const [state, setState] = useState(openingState);
  const [palette, setPalette] = useState(plugins.palette);
  const [message, setMessage] = useState<string>();
  const [helpFirst, setHelpFirst] = useState(0);
  const treeFirst = useRef(0);
  const storiesFirst = useRef(0);
  // Kept here, where it outlives the matrix while a cell is open, so Esc
  // comes back to the matrix scrolled as it was.
  const matrixFirst = useRef<MatrixWindow>({ row: 0, column: 0 });
  const act = useCallback(
    (action: GalleryAction) => {
      setMessage(undefined);
      setState((now) => reduceGallery(now, action, known));
    },
    [known],
  );
  const selection = readSelection(state, known);
  const { component, viewportName, modeName, record, confirming } = selection;
  const story = component?.stories.at(selection.story);
  const leftOut = isLeftOut(story, viewportName, modeName);
  const lines = height - barLines;
  const inspected =
    state.inspecting && story && viewportName !== undefined
      ? measureInspected({
          record,
          viewportName,
          ...(modeName !== undefined && { mode: modeName }),
          leftOut,
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
      const where = `${asked.name} at ${describePlace(asked.viewportName, asked.mode)}`;
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
    modes: known.modes,
    globals: known.globals,
    limits,
    tooSmall: width < minColumns || height < minLines,
    act,
    scrollHelp,
    accept,
    say: setMessage,
    quit: onQuit,
  });
  const pluginSelection: PluginSelection = useMemo(
    () => ({
      title: component?.title,
      story: state.focus === "stories" ? story?.name : undefined,
      viewportName,
      mode: modeName,
      palette,
    }),
    [
      component?.title,
      state.focus,
      story?.name,
      viewportName,
      modeName,
      palette,
    ],
  );
  const control: GalleryControl = useMemo(() => {
    const palettes = plugins.palettes.map(({ name }) => name);
    return {
      selection: pluginSelection,
      palettes,
      setPalette: (name) =>
        palettes.includes(name)
          ? setPalette(name)
          : setMessage(`there is no palette ${name}`),
      say: setMessage,
    };
  }, [plugins.palettes, pluginSelection]);
  const clearMessage = useCallback(() => setMessage(undefined), []);
  usePluginKeys({
    plugins,
    free:
      !state.filtering &&
      !state.searching &&
      !state.confirming &&
      !state.help &&
      width >= minColumns &&
      height >= minLines,
    control,
    onKey: clearMessage,
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
        {...(modeName !== undefined && { mode: modeName })}
        leftOut={leftOut}
        record={record}
        scroll={state.scroll}
        difference={state.difference}
        {...(state.cell && { cell: state.cell })}
        width={width}
        height={lines}
      />
    );
  } else if (state.matrix && catalog) {
    const columns = listColumns(catalog);
    region = (
      <Matrix
        components={selection.components}
        columns={columns}
        selected={{
          title: component?.title,
          story: selection.story,
          column: columns.findIndex(
            (column) =>
              column.viewportName === viewportName && column.mode === modeName,
          ),
        }}
        filter={state.filter}
        first={matrixFirst.current}
        onShown={(first) => {
          matrixFirst.current = first;
        }}
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
        modeName,
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

  // The size and the mode name where the pictures are drawn, once there is
  // a mode to tell the base from.
  const statusItems =
    known.modes.length > 0 && viewportName !== undefined
      ? [viewportName, modeName ?? "base"]
      : [];
  // The palette is named at the end of the status line once there is one
  // to change to, before the plugins' own items.
  const placed = placeStatusItems(
    [
      ...(plugins.palettes.length > 1
        ? [{ text: ({ palette: name }: PluginSelection) => `palette ${name}` }]
        : []),
      ...plugins.status,
    ],
    pluginSelection,
    width,
  );
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
            sort: {
              text: arrangementWords[state.arrangement],
              kind: "words",
            },
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
        placed.items.length === 0 ? (
          <StatusLine
            state={state}
            selection={selection}
            catalog={catalog}
            message={message}
            items={statusItems}
            width={width}
          />
        ) : (
          <box flexDirection="row" width={width} height={1}>
            <box width={width - placed.columns} height={1}>
              <StatusLine
                state={state}
                selection={selection}
                catalog={catalog}
                message={message}
                items={statusItems}
                width={width - placed.columns}
              />
            </box>
            <PluginStatus placed={placed} selection={pluginSelection} />
          </box>
        )
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
      {/* The palette shown is always one of them: the one the plugins open
       * on, or one a key chose among them. */}
      <PaletteContext.Provider
        value={plugins.palettes.find(({ name }) => name === palette) as Palette}
      >
        {region}
      </PaletteContext.Provider>
    </Pane>
  );
};

export default Gallery;
