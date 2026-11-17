# @aztlan/lago-react

Stories for React components drawn by OpenTUI, tested on every run.

`render`, `composeStories`, `setProjectAnnotations` and `waitFor` for tests, the story types `Meta`, `StoryObj`, `Decorator`, `Loader`, `Preview` and `GlobalTypes`, a story's `globals` and the `globals` its context gives, and from `@aztlan/lago-react/vitest` the plugin `testStories`, which draws every story at each viewport, inside the project's preview when one is named and inside each plugin's before it, and in each mode it is given, the plugins' among them, and compares it with its golden; a mode's picture keeps a golden only where it differs from the base's, and the run ends with the matrix totals; `matrix.max` refuses a project whose matrix has more cells than it allows; the plugin's `api` names its modes, the plugins' first, in the order given, which is how the gallery learns them. A global or a mode that two plugins declare, or a plugin and the project, is refused, naming both. `setProjectAnnotations` takes a list of previews too, the plugins' before the project's, for a test that composes stories as their file draws them.

See [the guide](../../docs/guide.md).

## License

MIT
