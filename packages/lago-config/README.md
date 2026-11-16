# @aztlan/lago-config

The vitest configuration a project with OpenTUI components and Lago stories needs.

`createConfig({ viewports, coverage, preview, modes, matrix })` gives a project its vitest configuration: JSX against `@opentui/react`, the renderer's Bun build, faked timers, a `unit` and a `stories` project, and the plugin, which sets every story inside the project's preview when one is named, draws it in each mode as well as the base, and refuses a matrix past `matrix.max`.

See [the guide](../../docs/guide.md).

## License

MIT
