# @aztlan/lago

A gallery of a project's stories, in a terminal.

`lago [project]` opens the gallery: the project's own vitest draws each story at each viewport, in the base and in each of the project's modes, and a stories file is drawn again when it is saved. In a project with modes, `m` steps through them, the status line names the size and the mode shown, and a mode's picture equal to the base's is shown as the base picture, with no golden of its own. The gallery draws itself in the chrome the project's configuration names: `terminal`, the terminal's own colours, unless it names `light`, `dark` or a set of tokens of its own. This package also carries the skill that adopts Lago in a project, in `skills/adopt-lago`.

See [the guide](../../docs/guide.md).

## License

MIT
