# lago

Stories for terminal interfaces drawn by OpenTUI: tested on every run, browsed in a terminal.

Each state a component can be in is a story. Every story is drawn on every test run and compared with a golden kept beside it, and `lago` shows the pictures in a terminal, where a changed one is read and accepted.

| Package | |
|---|---|
| [`@aztlan/lago-react`](packages/lago-react) | the story types, `render`, `composeStories`, `waitFor`, and the vitest plugin |
| [`@aztlan/lago-config`](packages/lago-config) | `createConfig`, the vitest configuration a project needs |
| [`@aztlan/tui`](packages/tui) | the terminal components an application and the gallery share |
| [`@aztlan/lago`](packages/lago) | the `lago` binary, the gallery |

[The guide](docs/guide.md) sets a project up, writes its first stories, and explains goldens, tests and the gallery. The skill in [`packages/lago/skills/adopt-lago`](packages/lago/skills/adopt-lago/SKILL.md) walks an agent through adopting Lago in a project.

## Developing

```sh
bun install
bun run ci
```

`AGENTS.md` holds the conventions and what the renderer does that is not obvious.

## License

MIT
