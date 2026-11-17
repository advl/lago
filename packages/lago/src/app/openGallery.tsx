import { basename } from "node:path";
import { Keys, TokensProvider } from "@aztlan/tui";
import type { CliRenderer, CliRendererConfig } from "@opentui/core";
import { createRoot, useTerminalDimensions } from "@opentui/react";
import { useSyncExternalStore } from "react";
import type { Catalog, StoryRecord } from "../catalog/index.js";
import { type Engine, startEngine } from "../engine/index.js";
import type { Contributions } from "../plugins/index.js";
import { Gallery } from "../ui/index.js";
import createCatalogStore from "./createCatalogStore.js";

interface LiveProps {
  readonly name: string;
  /** Registers a listener for each new catalog, and gives what removes it. */
  readonly subscribe: (listen: () => void) => () => void;
  /** The latest catalog; absent until the first run ends. */
  readonly read: () => Catalog | undefined;
  readonly accept: (record: StoryRecord) => Promise<void>;
  readonly quit: () => void;
  readonly plugins: Contributions;
}

/** The gallery on the engine's latest catalog, at the terminal's size. */
function Live({ name, subscribe, read, accept, quit, plugins }: LiveProps) {
  const catalog = useSyncExternalStore(subscribe, read);
  const { width, height } = useTerminalDimensions();
  return (
    <Gallery
      catalog={catalog}
      name={name}
      onAccept={accept}
      onQuit={quit}
      width={width}
      height={height}
      plugins={plugins}
    />
  );
}

/**
 * Opens the gallery on the project at `root`: starts the project's own
 * vitest, draws the gallery in the chrome its configuration names, with
 * what its plugins add, as soon as those are read, before any story runs, and shows each run's catalog as it
 * comes. `q`, or ctrl+c, closes the renderer, which stops vitest. When
 * vitest cannot start, or the chrome cannot be read, the renderer is closed
 * and the error given.
 *
 * @note Impure: takes over the terminal and runs the project's vitest until the gallery is closed.
 * @param createRenderer Makes the renderer the gallery draws on.
 * @returns 0, once the gallery is closed.
 */
export default async function openGallery(
  root: string,
  createRenderer: (config: CliRendererConfig) => Promise<CliRenderer>,
): Promise<number> {
  const { promise, resolve, reject } = Promise.withResolvers<number>();
  const store = createCatalogStore();
  let failure: unknown;
  // Started once the renderer exists, so the gallery draws before vitest
  // has run anything; the renderer can only be closed after that.
  let engine: Promise<Engine>;
  const renderer = await createRenderer({
    exitOnCtrlC: true,
    // Nothing in the gallery is clicked, and a terminal that keeps its mouse
    // lets the reader select a failed file's path to copy it.
    useMouse: false,
    onDestroy: () => {
      engine
        .then(
          (started) => started.close(),
          () => undefined,
        )
        // Only once the renderer has given the terminal back does an error
        // reach the screen the reader returns to.
        .then(() => renderer.closed)
        .then(() => (failure === undefined ? resolve(0) : reject(failure)));
    },
  });
  const tree = createRoot(renderer);
  engine = startEngine({
    root,
    // Drawn only once the chrome is known, so a chrome that paints the
    // background never follows a first frame in the terminal's own.
    onSettings: ({ chrome, plugins }) =>
      tree.render(
        <TokensProvider tokens={chrome}>
          <Keys>
            <Live
              name={basename(root)}
              subscribe={store.subscribe}
              read={store.read}
              accept={async (record) => (await engine).accept(record)}
              quit={() => {
                tree.unmount();
                renderer.destroy();
              }}
              plugins={plugins}
            />
          </Keys>
        </TokensProvider>,
      ),
    onCatalog: store.give,
  });
  engine.catch((error: unknown) => {
    failure = error;
    renderer.destroy();
  });
  return promise;
}
