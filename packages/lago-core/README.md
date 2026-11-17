# @aztlan/lago-core

The screen, its screenshot and its golden, for any renderer Lago checks.

A `Screenshot` is every run of text a screen shows with its colours and attributes, and a golden is that screenshot written as text: the picture, then one line per run. A `Screen` is what a test holds: its lines and runs, the keyboard in front of it, and a way to let it catch up. `createScreen` builds one from what a renderer gives it (how to read its screen, let it settle, send it a key or a paste, and close it), so a test reads and drives every renderer's screen the same way. None of it names a renderer.

`screenshotFromBytes(bytes, viewport)` reads what a terminal of that size shows after reading a program's bytes, through a headless terminal emulator, into the same `Screenshot`. `renderStream(mount, viewport)` gives a program that draws by writing a terminal's bytes the same `Screen`: the mount draws the program on a terminal's two streams and gives back how to take it down, keys are written to its input as a terminal sends them, and the screen settles once the program's timers have run and it writes nothing more. The environment is set to an interactive terminal of full colour before the mount runs, the variables a pipeline sets removed, so a program that reads it when it loads is loaded inside the mount.

`definePlugin({ name, preview, globalTypes, modes, gallery })` defines a plugin, which a project registers once, in its configuration, to configure both of its sides: the story side is a preview module set around every story outside the project's own, with the globals and modes the plugin declares; the gallery part is a module the gallery imports, with the options the project gave. Each module is named by an absolute path or a `file:` URL, as `new URL("./gallery.js", import.meta.url)`, since the plugin is read from a project's configuration.

`@aztlan/lago-react` mounts on OpenTUI with what this package exports; a project with OpenTUI components imports from there.

## License

MIT
