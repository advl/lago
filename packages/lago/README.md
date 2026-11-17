# @aztlan/lago

A gallery of a project's stories, in a terminal.

`lago [project]` opens the gallery: the project's own vitest draws each story at each viewport, in the base and in each of the project's modes, and a stories file is drawn again when it is saved. In a project with modes, `m` steps through them, the status line names the size and the mode shown, a mode's picture equal to the base's is shown as the base picture, with no golden of its own, and `x` opens the matrix: one row per story, one column per size and mode, each cell's state by a glyph, any cell opened with Enter. The gallery draws itself in the chrome the project's configuration names: `terminal`, the terminal's own colours, unless it names `light`, `dark`, a chrome a plugin gives or a set of tokens of its own. It imports the gallery part of each plugin the configuration carries, by its path, and refuses one that would load a second copy of React, OpenTUI or vitest. A gallery part adds palettes, which `t` steps through for the session, chromes, keys and items at the end of the status line. The package exports the types a plugin's gallery part is written with, `GalleryPart` and what it gives. This package also carries the skill that adopts Lago in a project, in `skills/adopt-lago`.

See [the guide](../../docs/guide.md).

## License

MIT
