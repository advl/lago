import { useBindings } from "@opentui/keymap/react";
import describeBack from "./describeBack.js";
import describeModes from "./describeModes.js";
import type { UseGalleryKeysProps } from "./types.js";

/**
 * Binds the gallery's keys, each enabled only while it acts, and each
 * described for the key bar and the help as what it does now: the arrows
 * choose a component or a story, scroll a picture or the help, or move the
 * cursor, by what is open.
 */
export default function useGalleryKeys({
  state,
  record,
  asking,
  selected,
  viewports,
  modes,
  globals,
  limits,
  tooSmall,
  act,
  scrollHelp,
  accept,
  say,
  quit,
}: UseGalleryKeysProps) {
  const typing = state.filtering || state.searching;
  const free = !typing && !state.confirming && !state.help && !tooSmall;
  const back = describeBack(state);
  const onTree = state.focus === "tree";
  let moveLabel = onTree ? "choose a component" : "choose a story";
  if (state.inspecting) moveLabel = "scroll the picture";
  if (state.cell) moveLabel = "move the cursor";
  if (state.help) moveLabel = "scroll the help";
  const moveHint = moveLabel.startsWith("scroll") ? "scroll" : "move";
  const move = (by: number) =>
    state.help
      ? scrollHelp(by)
      : act({ type: "move", by, limit: state.cell ? limits.y : limits.scroll });
  const across = state.cell !== undefined || (!onTree && !state.inspecting);
  const acceptable = record?.status === "changed" || record?.status === "new";
  // A mode's picture equal to the base's keeps no golden, so `A` says why
  // instead of asking.
  const equal =
    record?.comparison === "equal" || record?.comparison === "unreached";
  const moveBy = (name: string, by: number) => ({
    name,
    desc: moveLabel,
    hint: moveHint,
    group: "Move",
    enabled:
      !typing && !state.confirming && !tooSmall && (selected || state.help),
    run: () => move(by),
  });
  const moveAcross = (name: string, by: number) => ({
    name,
    desc: state.cell ? "move the cursor" : "choose a story beside",
    group: "Move",
    enabled: free && across,
    run: () => act({ type: "moveAcross", by, limit: limits.x }),
  });
  const stepMatch = (name: string, by: number) => ({
    name,
    desc: "next or previous match",
    hint: "match",
    group: "Find",
    enabled: free && state.search !== "",
    run: () => act({ type: "nextHit", by }),
  });
  useBindings(
    () => ({
      commands: [
        moveBy("move.up", -1),
        moveBy("move.down", 1),
        moveAcross("move.left", -1),
        moveAcross("move.right", 1),
        {
          name: "open",
          desc: onTree ? "open the component's stories" : "inspect the story",
          hint: "open",
          group: "Move",
          enabled: free && selected && !state.inspecting,
          run: () => act({ type: "open" }),
        },
        {
          name: "back",
          desc: back,
          hint: "back",
          group: "Move",
          enabled: back !== undefined && !tooSmall,
          run: () => act({ type: "back" }),
        },
        {
          name: "find",
          desc: onTree ? "filter the components" : "search the stories",
          hint: "find",
          group: "Find",
          enabled: free,
          run: () => act({ type: onTree ? "startFilter" : "startSearch" }),
        },
        stepMatch("match.next", 1),
        stepMatch("match.previous", -1),
        {
          name: "finish",
          desc: "keep what is typed",
          hint: "keep",
          group: "Find",
          enabled: typing,
          run: () => act({ type: "finish" }),
        },
        {
          name: "erase",
          desc: "erase the last character",
          group: "Find",
          enabled: typing,
          run: () => act({ type: "erase" }),
        },
        {
          name: "viewport",
          desc: "show the next viewport",
          hint: "viewport",
          group: "Picture",
          enabled: free && viewports > 1,
          run: () => act({ type: "nextViewport" }),
        },
        ...(modes.length > 0
          ? [
              {
                name: "mode",
                desc: "show the next mode",
                hint: "mode",
                group: "Picture",
                notes: describeModes(modes, globals),
                enabled: free,
                run: () => act({ type: "nextMode" }),
              },
            ]
          : []),
        {
          name: "arrangement",
          desc: "set the stories as the room allows, in rows, or side by side",
          hint: "layout",
          group: "Picture",
          enabled: free && selected && !state.inspecting,
          run: () => act({ type: "nextArrangement" }),
        },
        {
          name: "difference",
          desc: state.difference
            ? "hide the golden"
            : "show the golden over the picture",
          hint: "diff",
          group: "Picture",
          enabled:
            free &&
            state.inspecting &&
            record?.status === "changed" &&
            record.expected !== undefined &&
            record.actual !== undefined,
          run: () => act({ type: "toggleDifference" }),
        },
        {
          name: "cell",
          desc: state.cell
            ? "stop reading cells"
            : "read the cells under a cursor",
          hint: "cells",
          group: "Picture",
          enabled: free && state.inspecting && record?.actual !== undefined,
          run: () => act({ type: "toggleCell" }),
        },
        {
          name: "accept",
          desc: "accept the picture as its golden",
          hint: "accept",
          group: "Picture",
          enabled: free && state.inspecting && (acceptable || equal),
          run: () => {
            if (!equal) {
              act({ type: "askAccept" });
              return;
            }
            say(
              record.comparison === "equal"
                ? "nothing to accept: the base picture's golden covers it"
                : `nothing to accept: it draws the base picture, which ${record.mode} should change`,
            );
          },
        },
        // While the gallery asks, y accepts the very picture asked about.
        ...(asking && !tooSmall
          ? [
              {
                name: "confirm",
                desc: "accept it",
                hint: "accept",
                group: "Picture",
                run: () => accept(asking),
              },
            ]
          : []),
        {
          name: "help",
          desc: state.help ? "close the help" : "show every key",
          hint: "",
          group: "App",
          enabled: !typing && !state.confirming && !tooSmall,
          run: () => act({ type: "toggleHelp" }),
        },
        {
          name: "quit",
          desc: "quit",
          hint: "quit",
          group: "App",
          enabled: !typing && !state.confirming,
          run: quit,
        },
      ],
      bindings: [
        { key: "up", cmd: "move.up" },
        { key: "k", cmd: "move.up" },
        { key: "down", cmd: "move.down" },
        { key: "j", cmd: "move.down" },
        { key: "left", cmd: "move.left" },
        { key: "h", cmd: "move.left" },
        { key: "right", cmd: "move.right" },
        { key: "l", cmd: "move.right" },
        { key: "return", cmd: "open" },
        { key: "escape", cmd: "back" },
        { key: "/", cmd: "find" },
        { key: "n", cmd: "match.next" },
        { key: "shift+n", cmd: "match.previous" },
        { key: "return", cmd: "finish" },
        { key: "backspace", cmd: "erase" },
        { key: "p", cmd: "viewport" },
        ...(modes.length > 0 ? [{ key: "m", cmd: "mode" }] : []),
        { key: "v", cmd: "arrangement" },
        { key: "d", cmd: "difference" },
        { key: "c", cmd: "cell" },
        { key: "shift+a", cmd: "accept" },
        ...(asking && !tooSmall ? [{ key: "y", cmd: "confirm" }] : []),
        { key: "?", cmd: "help" },
        { key: "q", cmd: "quit" },
      ],
    }),
    [
      state,
      record,
      asking,
      selected,
      viewports,
      modes,
      globals,
      // The limits by their values: a new object each draw is the same limits.
      limits.scroll,
      limits.x,
      limits.y,
      tooSmall,
      act,
      scrollHelp,
      accept,
      say,
      quit,
    ],
  );
}
