import { vi } from "vitest";
import type { Meta, StoryObj } from "../src/index.js";
import Component from "./Clock.js";

const meta = {
  title: "fixtures/Clock",
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** As it mounts, with time stopped at zero. */
export const AtZero: Story = {};

/** After the story moves the stopped clock on by a second. */
export const AfterASecond: Story = {
  play: async ({ canvas }) => {
    vi.advanceTimersByTime(1_000);
    await canvas.settle();
  },
};
