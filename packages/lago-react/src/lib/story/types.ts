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

/** What a stories file's default export and each of its stories may say. */
export interface Annotations<Args> {
  args?: Partial<Args>;
  parameters?: Parameters;
  /** The first wraps the story itself, and each next one wraps the one before it. */
  decorators?: readonly Decorator<Args>[];
  render?: (args: Args, context: StoryContext<Args>) => ReactNode;
  /** Runs once the story is mounted, to bring it to the state it shows. */
  play?: (context: PlayContext<Args>) => void | Promise<void>;
  /**
   * Added to `dev` and `test`, which every story starts with. `!test` leaves
   * a story out of the test run and `!dev` out of the gallery.
   */
  tags?: readonly string[];
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
  readonly render: (
    args: Record<string, unknown>,
    context: StoryContext,
  ) => ReactNode;
  readonly play?: (context: PlayContext) => void | Promise<void>;
  readonly tags: readonly string[];
}

/** A story as a test uses it: a component to mount, or to run whole. */
export interface ComposedStory<Args = Record<string, unknown>> {
  /** The story as a component; a prop replaces the story's arg of that name. */
  (props: Partial<Args>): ReactNode;
  readonly storyName: string;
  readonly args: Partial<Args>;
  readonly parameters: Parameters;
  readonly tags: readonly string[];
  /**
   * Mounts the story on a screen of the given size, or of a terminal's usual
   * one, runs its `play`, and gives the screen.
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
