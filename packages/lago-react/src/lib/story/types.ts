import type { ReactNode } from "react";
import type { Screen, UserEvent, Viewport } from "../render/index.js";

/** A function component, whatever props it takes. */
// biome-ignore lint/suspicious/noExplicitAny: a component's props are checked where the component is used, and here any will do.
export type AnyComponent = (props: any) => ReactNode;

/** The props a component takes. */
export type PropsOf<Component> = Component extends (
  props: infer Props,
) => ReactNode
  ? Props
  : Record<string, unknown>;

/**
 * Values a story carries for whatever reads it, and not for the component:
 * plain data, merged from the file's to the story's, object into object.
 */
export type Parameters = Readonly<Record<string, unknown>>;

/** What a story's `render` and its decorators are given. */
export interface StoryContext<Args = Record<string, unknown>> {
  readonly title: string;
  readonly name: string;
  readonly args: Args;
  readonly parameters: Parameters;
  /** The size of the screen the story is drawn on. */
  readonly viewport: Viewport;
  /** What the story's loaders gave, merged in their order. */
  readonly loaded: Readonly<Record<string, unknown>>;
}

/** What a story's `play` is given: the same, with the mounted story and its keyboard. */
export interface PlayContext<Args = Record<string, unknown>>
  extends StoryContext<Args> {
  readonly canvas: Screen;
  readonly userEvent: UserEvent;
}

/**
 * Wraps a story in what it needs around it, such as a provider. Written
 * without its args' type, a decorator fits a story of any component.
 */
// biome-ignore lint/suspicious/noExplicitAny: a decorator that reads no args must be usable on every story, whatever its args are.
export type Decorator<Args = any> = (
  Story: () => ReactNode,
  context: StoryContext<Args>,
) => ReactNode;

/**
 * Fetches or makes what a story needs before it is first drawn. What it gives
 * is merged into the context's `loaded`, for the story's `render`, its
 * decorators and its `play`; giving nothing is also fine, for a loader that
 * only sets something up. In a story's test it runs with time already
 * stopped, where no timer fires, so it awaits promises and never a delay.
 */
// biome-ignore lint/suspicious/noExplicitAny: a loader that reads no args must be usable on every story, whatever its args are.
export type Loader<Args = any> = (
  context: Omit<StoryContext<Args>, "loaded">,
) => LoaderResult | Promise<LoaderResult>;

/** What a loader gives: values for `loaded`, or nothing. */
// biome-ignore lint/suspicious/noConfusingVoidType: a loader that only sets something up returns nothing, which TypeScript types as void.
type LoaderResult = Readonly<Record<string, unknown>> | void;

/** What a stories file's default export and each of its stories may say. */
export interface Annotations<Args> {
  args?: Partial<Args>;
  parameters?: Parameters;
  /** The first wraps the story itself, and each next one wraps the one before it. */
  decorators?: readonly Decorator<Args>[];
  /** Run before the story is first drawn, the file's before the story's. */
  loaders?: readonly Loader<Args>[];
  render?: (args: Args, context: StoryContext<Args>) => ReactNode;
  /** Runs once the story is mounted, to bring it to the state it shows. */
  play?: (context: PlayContext<Args>) => void | Promise<void>;
  /**
   * Added to `dev` and `test`, which every story starts with. `!test` leaves
   * a story out of the test run and `!dev` out of the gallery.
   */
  tags?: readonly string[];
}

/**
 * A project's preview: what every story of the project shares, set around
 * what its file and the story itself say. Its args and parameters come first,
 * so a file's or a story's win; its decorators wrap all the others; its
 * loaders run first; its tags come first.
 */
export interface Preview {
  readonly args?: Readonly<Record<string, unknown>>;
  readonly parameters?: Parameters;
  readonly decorators?: readonly Decorator[];
  readonly loaders?: readonly Loader[];
  readonly tags?: readonly string[];
}

/** A stories file's default export: the component and what all its stories share. */
export interface Meta<Component extends AnyComponent = AnyComponent>
  extends Annotations<PropsOf<Component>> {
  /** Where the component sits among the others, as `group/Component`. */
  title: string;
  component?: Component;
}

/** The props of the component a file's default export names. */
type ArgsOf<M> = M extends { component?: infer Component }
  ? PropsOf<Component>
  : Record<string, unknown>;

/** The props the component requires that the default export's args do not give. */
type MissingArgs<M> = Omit<
  ArgsOf<M>,
  keyof (M extends { args?: infer Given } ? Given : object)
>;

/** The props of `Props` that are required. */
type RequiredKeys<Props> = {
  [Key in keyof Props]-?: object extends Pick<Props, Key> ? never : Key;
}[keyof Props];

/**
 * One story of the file whose default export is `M`: a named state of its
 * component. As in Storybook, a story must give, in its args or its own
 * render, the props the component requires that the file's args do not.
 */
export type StoryObj<M = Meta> = Omit<Annotations<ArgsOf<M>>, "args"> &
  ([RequiredKeys<MissingArgs<M>>] extends [never]
    ? { args?: Partial<ArgsOf<M>> }
    : {
        args: Partial<ArgsOf<M>> &
          Pick<MissingArgs<M>, RequiredKeys<MissingArgs<M>>>;
      });

/** A stories file as a module: its default export and its stories. */
export interface StoriesModule {
  readonly default: Meta;
  readonly [name: string]: unknown;
}

/** A story with everything its file gives it merged in, ready to draw. */
export interface PreparedStory {
  readonly title: string;
  readonly name: string;
  readonly args: Record<string, unknown>;
  readonly parameters: Parameters;
  readonly decorators: readonly Decorator[];
  readonly loaders: readonly Loader[];
  readonly render: (
    args: Record<string, unknown>,
    context: StoryContext,
  ) => ReactNode;
  readonly play?: (context: PlayContext) => void | Promise<void>;
  readonly tags: readonly string[];
}

/** A story as a test uses it: a component to mount, or to run whole. */
export interface ComposedStory<Args = Record<string, unknown>> {
  /**
   * The story as a component; a prop replaces the story's arg of that name.
   * A component draws at once, so a story with loaders is mounted only once
   * `load` has run them, and is refused before.
   */
  (props: Partial<Args>): ReactNode;
  readonly storyName: string;
  readonly args: Partial<Args>;
  readonly parameters: Parameters;
  readonly tags: readonly string[];
  /**
   * Runs the story's loaders, given the story's own args and the given size,
   * or a terminal's usual one, and keeps what they give for the component to
   * draw with, until `load` runs them again. They run on the test's own
   * clock, as the component then draws.
   */
  readonly load: (viewport?: Viewport) => Promise<void>;
  /**
   * Runs the story's loaders, mounts the story on a screen of the given size,
   * or of a terminal's usual one, runs its `play`, and gives the screen.
   */
  readonly run: (viewport?: Viewport) => Promise<Screen>;
}

/** Every story of a module, by its export's name. */
export type ComposedStories<Module extends StoriesModule> = {
  readonly [Name in Exclude<keyof Module, "default">]: ComposedStory<
    Module["default"] extends { component?: infer Component }
      ? PropsOf<Component>
      : Record<string, unknown>
  >;
};
