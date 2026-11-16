# @aztlan/lago-core

The screen, its screenshot and its golden, for any renderer Lago checks.

A `Screenshot` is every run of text a screen shows with its colours and attributes, and a golden is that screenshot written as text: the picture, then one line per run. A `Screen` is what a test holds: its lines and runs, the keyboard in front of it, and a way to let it catch up. `createScreen` builds one from what a renderer gives it (how to read its screen, let it settle, send it a key or a paste, and close it), so a test reads and drives every renderer's screen the same way. None of it names a renderer.

`screenshotFromBytes(bytes, viewport)` reads what a terminal of that size shows after reading a program's bytes, through a headless terminal emulator, into the same `Screenshot`.

`@aztlan/lago-react` mounts on OpenTUI with what this package exports; a project with OpenTUI components imports from there.

## License

MIT
