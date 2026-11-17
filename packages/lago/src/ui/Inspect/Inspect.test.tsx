import { render } from "@aztlan/lago-react";
import { describe, expect, it } from "vitest";
import { tallPicture } from "../../../testing/pictures.js";
import { drawPicture, makeRecord } from "../../../testing/records.js";
import Inspect from "./Inspect.js";

const tall = makeRecord("layout/Pane", "Tall", {
  actual: tallPicture,
  expected: tallPicture,
});

describe("Inspect", () => {
  it("titles the story with its status at the viewport, and holds a scroll within the picture", async () => {
    const screen = await render(
      <Inspect
        name="Tall"
        viewportName="terminal"
        record={tall}
        scroll={99}
        difference={false}
        width={40}
        height={10}
      />,
      { cols: 40, rows: 10 },
    );
    expect(screen.lines.at(0)).toMatch(/^┌─✓ Tall at terminal · pass─/);
    expect(screen.lines.slice(1, 3)).toEqual([
      `│line 23${" ".repeat(13)}${" ".repeat(18)}│`,
      `│line 24${" ".repeat(13)}${" ".repeat(18)}│`,
    ]);
  });

  it("scrolls to keep the cursor's cell in view", async () => {
    const screen = await render(
      <Inspect
        name="Tall"
        viewportName="terminal"
        record={tall}
        scroll={0}
        difference={false}
        cell={{ x: 0, y: 20 }}
        width={40}
        height={10}
      />,
      { cols: 40, rows: 10 },
    );
    expect(screen.lines.at(8)).toContain("line 21");
    const cursor = screen
      .screenshot()
      .lines.at(8)
      ?.find(({ text }) => text === "l");
    expect(cursor?.attributes).toEqual(["inverse"]);
  });

  it("says when the story is not drawn at the viewport", async () => {
    const screen = await render(
      <Inspect
        name="Wide"
        viewportName="wide"
        record={undefined}
        scroll={0}
        difference={false}
        width={40}
        height={5}
      />,
      { cols: 40, rows: 5 },
    );
    expect(screen.lines.at(0)).toMatch(/^┌─Wide at wide─/);
    expect(screen.lines.at(1)).toContain("This story is not drawn at wide.");
  });
  it("shows the error a story threw, each of its lines kept", async () => {
    const thrown = makeRecord("component/Notice", "Thrown", {
      status: "error",
      actual: undefined,
      expected: undefined,
      error: "TypeError: no\n  at src/Notice.tsx:4:12",
    });
    const screen = await render(
      <Inspect
        name="Thrown"
        viewportName="terminal"
        record={thrown}
        scroll={0}
        difference={false}
        width={40}
        height={5}
      />,
      { cols: 40, rows: 5 },
    );
    expect(screen.lines.slice(0, 3)).toEqual([
      `┌─✗ Thrown at terminal · error${"─".repeat(9)}┐`,
      `│TypeError: no${" ".repeat(25)}│`,
      `│at src/Notice.tsx:4:12${" ".repeat(16)}│`,
    ]);
  });

  it("shows the golden over a changed picture, and the picture of one that passes", async () => {
    const long = makeRecord("component/KeyBar", "Long", {
      status: "changed",
      lines: ["a longer bar"],
      expected: drawPicture(["a long bar"]),
    });
    const changed = await render(
      <Inspect
        name="Long"
        viewportName="terminal"
        record={long}
        scroll={0}
        difference
        width={40}
        height={8}
      />,
      { cols: 40, rows: 8 },
    );
    expect(changed.lines.at(1)).toContain("1 line differs: 1 in text.");
    const passing = await render(
      <Inspect
        name="Tall"
        viewportName="terminal"
        record={tall}
        scroll={0}
        difference
        width={40}
        height={5}
      />,
      { cols: 40, rows: 5 },
    );
    expect(passing.lines.at(1)).toContain("line 1");
  });
  it("holds the scroll within the golden's difference and within a message, so neither goes blank", async () => {
    const long = makeRecord("component/KeyBar", "Long", {
      status: "changed",
      lines: ["a longer bar"],
      expected: drawPicture(["a long bar"]),
    });
    const golden = await render(
      <Inspect
        name="Long"
        viewportName="terminal"
        record={long}
        scroll={50}
        difference
        width={40}
        height={8}
      />,
      { cols: 40, rows: 8 },
    );
    expect(golden.lines.at(1)).toContain("1 line differs: 1 in text.");
    const thrown = makeRecord("component/Notice", "Thrown", {
      status: "error",
      actual: undefined,
      error: "TypeError: no\n  at src/Notice.tsx:4:12",
    });
    const message = await render(
      <Inspect
        name="Thrown"
        viewportName="terminal"
        record={thrown}
        scroll={50}
        difference={false}
        width={40}
        height={8}
      />,
      { cols: 40, rows: 8 },
    );
    expect(message.lines.at(1)).toContain("TypeError: no");
  });

  it("says in its title that a picture wider than the region is cut, and how much shows", async () => {
    const wide = makeRecord("component/Wide", "Full", {
      lines: [`[${"=".repeat(78)}]`],
    });
    const record = {
      ...wide,
      actual: { ...drawPicture([`[${"=".repeat(78)}]`], 80) },
    };
    const screen = await render(
      <Inspect
        name="Full"
        viewportName="terminal"
        record={record}
        scroll={0}
        difference={false}
        width={80}
        height={5}
      />,
      { cols: 80, rows: 5 },
    );
    expect(screen.lines.at(0)).toContain(
      "✓ Full at terminal · pass · 78 of 80 columns",
    );
    expect(screen.lines.at(1)).toBe(`│[${"=".repeat(77)}│`);
  });

  it("titles a mode's picture with its mode, and one equal to the base as equal", async () => {
    const equal = makeRecord("layout/Pane", "Tall", {
      mode: "dark",
      comparison: "equal",
    });
    const screen = await render(
      <Inspect
        name="Tall"
        viewportName="terminal"
        mode="dark"
        record={equal}
        scroll={0}
        difference={false}
        width={60}
        height={4}
      />,
      { cols: 60, rows: 4 },
    );
    expect(screen.lines.at(0)).toMatch(
      /^┌─= Tall at terminal in dark · equal to the base─/,
    );
  });

  it("says a story is not drawn in a mode, or that its file leaves the mode out", async () => {
    const draw = (leftOut: boolean) =>
      render(
        <Inspect
          name="Tall"
          viewportName="terminal"
          mode="dark"
          leftOut={leftOut}
          record={undefined}
          scroll={0}
          difference={false}
          width={60}
          height={4}
        />,
        { cols: 60, rows: 4 },
      ).then((screen) => screen.lines.at(1));
    expect(await draw(false)).toContain(
      "This story is not drawn at terminal in dark.",
    );
    expect(await draw(true)).toContain(
      "This story's parameters.modes leaves dark out.",
    );
  });
});
