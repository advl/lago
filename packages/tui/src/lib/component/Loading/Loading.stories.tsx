import type { Meta, StoryObj } from "@aztlan/lago-react";
import Component from "./Loading.js";

const meta = {
  title: "component/Loading",
  component: Component,
  args: { label: { text: "refresh in progress…", kind: "words" }, width: 38 },
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A read under way, at the indent a list's region gives it. */
export const Reading: Story = {};

/** The longest line a list's region gives a read that is under way. */
export const Long: Story = {};
