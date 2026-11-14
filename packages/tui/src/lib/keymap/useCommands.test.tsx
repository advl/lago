import { render } from "@aztlan/lago-react";
import { useBindings } from "@opentui/keymap/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import Keys from "./Keys.js";
import useCommands from "./useCommands.js";

/** Binds `?` to show time, and `t`, enabled only once `?` is pressed. */
function Bound({ visibility }: { visibility: "active" | "registered" }) {
  const [on, setOn] = useState(false);
  useBindings(
    () => ({
      commands: [
        { name: "show", desc: "show", group: "App", run: () => setOn(true) },
        {
          name: "time",
          desc: "time",
          group: "Mode",
          enabled: on,
          run: () => {},
        },
      ],
      bindings: [
        { key: "?", cmd: "show" },
        { key: "t", cmd: "time" },
      ],
    }),
    [on],
  );
  const commands = useCommands({ visibility });
  return <text>{commands.map(({ label }) => label).join(",") || "-"}</text>;
}

describe("useCommands", () => {
  it("lists the commands the keys run now, and follows a command turned on", async () => {
    const screen = await render(
      <Keys>
        <Bound visibility="active" />
      </Keys>,
      { cols: 40, rows: 2 },
    );
    expect(screen.lines.at(0)).toBe("show");
    await screen.userEvent.keyboard("?");
    expect(screen.lines.at(0)).toBe("show,time");
  });

  it("lists every command bound, turned off or not", async () => {
    const screen = await render(
      <Keys>
        <Bound visibility="registered" />
      </Keys>,
      { cols: 40, rows: 2 },
    );
    expect(screen.lines.at(0)).toBe("show,time");
  });
});
