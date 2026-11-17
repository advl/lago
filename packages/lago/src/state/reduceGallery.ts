import type { Catalog } from "../catalog/index.js";
import { nextArrangement } from "./constants.js";
import listColumns from "./listColumns.js";
import listRows from "./listRows.js";
import readSelection from "./readSelection.js";
import type { GalleryAction, GalleryState } from "./types.js";

/** `value` held between `low` and `high`. */
const clamp = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(high, value));

/** The last line or column a move may reach: none, unless the screen gives it. */
const limitOf = (action: { readonly limit?: number }) =>
  action.limit === undefined ? Number.POSITIVE_INFINITY : action.limit;

/** The state with what an open story shows set back, as when another is selected. */
const leaveStory = (state: GalleryState): GalleryState => ({
  ...state,
  inspecting: false,
  scroll: 0,
  difference: false,
  cell: undefined,
  confirming: undefined,
});

/** Moves the selection to the search's hit at `place`, wrapping round. */
function goToHit(
  state: GalleryState,
  catalog: Catalog,
  place: number,
): GalleryState {
  const { component, hits } = readSelection(state, catalog);
  const hit = hits.length === 0 ? 0 : (place + hits.length) % hits.length;
  const found = hits.at(hit);
  if (!found) return { ...state, hit };
  const moved = found.story === state.story ? state : leaveStory(state);
  return {
    ...moved,
    focus: "stories",
    title: component?.title,
    story: found.story,
    hit,
  };
}

/** One step out, from the innermost thing open. */
function goBack(state: GalleryState): GalleryState {
  if (state.help) return { ...state, help: false };
  if (state.confirming) return { ...state, confirming: undefined };
  if (state.filtering) return { ...state, filtering: false, filter: "" };
  if (state.searching) {
    return { ...state, searching: false, search: "", hit: 0 };
  }
  if (state.cell) return { ...state, cell: undefined };
  // A cell opened from the matrix goes back to it in one step, whether it
  // shows its picture or its difference.
  if (state.matrix && state.inspecting) return leaveStory(state);
  if (state.difference) return { ...state, difference: false };
  if (state.inspecting) return leaveStory(state);
  if (state.matrix) return { ...state, matrix: false };
  if (state.focus === "stories") return { ...state, focus: "tree" };
  return state;
}

/** Up or down the matrix's rows, from the selected story, stopping at either end. */
function moveRow(state: GalleryState, catalog: Catalog, by: number) {
  const selection = readSelection(state, catalog);
  const rows = listRows(selection.components);
  const at = rows.findIndex(
    ({ component, place }) =>
      component.title === selection.component?.title &&
      place === selection.story,
  );
  const next = rows.at(clamp(at + by, 0, rows.length - 1));
  return next === undefined || next === rows.at(at)
    ? state
    : leaveStory({ ...state, title: next.component.title, story: next.place });
}

/**
 * Left or right along the matrix's columns, stopping at either end: the
 * viewport and the mode shown. It moves from the column shown, which a run
 * that drops a viewport may have moved back from the one the state names.
 */
function moveColumn(state: GalleryState, catalog: Catalog, by: number) {
  const { viewportName, modeName } = readSelection(state, catalog);
  const columns = listColumns(catalog);
  const shown = columns.findIndex(
    (column) =>
      column.viewportName === viewportName && column.mode === modeName,
  );
  const span = catalog.modes.length + 1;
  const at = clamp(shown + by, 0, columns.length - 1);
  return {
    ...state,
    viewport: Math.floor(at / span),
    mode: at % span,
  };
}

/** Up or down, by what is focused. */
function move(
  state: GalleryState,
  catalog: Catalog,
  by: number,
  limit: number,
): GalleryState {
  const selection = readSelection(state, catalog);
  if (state.cell) {
    return {
      ...state,
      cell: { ...state.cell, y: clamp(state.cell.y + by, 0, limit) },
    };
  }
  if (state.matrix && !state.inspecting) return moveRow(state, catalog, by);
  if (state.inspecting) {
    // A scroll past the limit, left by a change of what is shown, starts
    // from the limit, so the first key back moves the picture.
    const scroll = clamp(Math.min(state.scroll, limit) + by, 0, limit);
    return { ...state, scroll };
  }
  if (state.focus === "tree") {
    const at = selection.components.findIndex(
      ({ title }) => title === selection.component?.title,
    );
    const next = selection.components.at(
      clamp(at + by, 0, selection.components.length - 1),
    );
    return next?.title === selection.component?.title
      ? state
      : leaveStory({ ...state, title: next?.title, story: 0, hit: 0 });
  }
  const last = Math.max(0, (selection.component?.stories.length ?? 0) - 1);
  const story = clamp(selection.story + by, 0, last);
  return story === selection.story ? state : leaveStory({ ...state, story });
}

/**
 * The gallery's state after the reader's `action`, in `catalog`. Enter goes
 * in and Esc comes out, one step at a time. While text is typed, only typing,
 * erasing, finishing and going back act.
 */
export default function reduceGallery(
  state: GalleryState,
  action: GalleryAction,
  catalog: Catalog,
): GalleryState {
  const typing = state.filtering || state.searching;
  const field = state.filtering ? "filter" : "search";
  switch (action.type) {
    case "type":
      return typing
        ? { ...state, [field]: state[field] + action.text, hit: 0 }
        : state;
    case "erase":
      return typing
        ? { ...state, [field]: state[field].slice(0, -1), hit: 0 }
        : state;
    case "finish":
      if (state.searching) {
        return goToHit({ ...state, searching: false }, catalog, 0);
      }
      return { ...state, filtering: false };
    case "back":
      return goBack(state);
    default:
      if (typing) return state;
  }
  switch (action.type) {
    case "move":
      return move(state, catalog, action.by, limitOf(action));
    case "moveAcross":
      if (state.cell) {
        return {
          ...state,
          cell: {
            ...state.cell,
            x: clamp(state.cell.x + action.by, 0, limitOf(action)),
          },
        };
      }
      if (state.matrix && !state.inspecting) {
        return moveColumn(state, catalog, action.by);
      }
      return state.focus === "stories" && !state.inspecting
        ? move(state, catalog, action.by, limitOf(action))
        : state;
    case "open": {
      const { component, record } = readSelection(state, catalog);
      if (!component) return state;
      // A changed cell opens on its difference, which is what it asks to read.
      if (state.matrix) {
        return {
          ...state,
          focus: "stories",
          title: component.title,
          inspecting: true,
          difference: record?.status === "changed",
        };
      }
      return state.focus === "tree"
        ? { ...state, focus: "stories", title: component.title }
        : { ...state, inspecting: true };
    }
    case "nextViewport":
      return {
        ...state,
        viewport: (state.viewport + 1) % Math.max(1, catalog.viewports.length),
        cell: undefined,
        scroll: 0,
        hit: 0,
      };
    case "nextMode":
      return {
        ...state,
        mode: (state.mode + 1) % (catalog.modes.length + 1),
        cell: undefined,
        scroll: 0,
        hit: 0,
      };
    case "nextArrangement":
      return { ...state, arrangement: nextArrangement[state.arrangement] };
    case "toggleMatrix":
      return {
        ...leaveStory(state),
        matrix: !state.matrix,
        title: readSelection(state, catalog).component?.title,
      };
    case "startFilter":
      return leaveStory({ ...state, filtering: true, focus: "tree" });
    case "startSearch":
      return { ...state, searching: true, search: "", hit: 0 };
    case "nextHit":
      return goToHit(state, catalog, state.hit + action.by);
    case "toggleDifference":
      return state.inspecting
        ? { ...state, difference: !state.difference }
        : state;
    case "toggleCell":
      return state.inspecting
        ? { ...state, cell: state.cell ? undefined : { x: 0, y: 0 } }
        : state;
    case "askAccept": {
      const { record } = readSelection(state, catalog);
      const acceptable =
        record?.status === "changed" || record?.status === "new";
      return state.inspecting && record && acceptable
        ? {
            ...state,
            confirming: {
              title: record.title,
              story: record.name,
              viewportName: record.viewportName,
              mode: record.mode,
              text: record.text,
            },
          }
        : state;
    }
    case "cancel":
      return { ...state, confirming: undefined };
    case "toggleHelp":
      return { ...state, help: !state.help };
  }
}
