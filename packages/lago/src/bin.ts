#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core";
import { openGallery, readVersion, runLago } from "./app/index.js";

process.exitCode = await runLago(
  process.argv.slice(2),
  {
    cwd: process.cwd(),
    version: readVersion(import.meta.dirname),
    interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
    write: (text) => process.stdout.write(text),
    warn: (text) => process.stderr.write(text),
  },
  (root) => openGallery(root, createCliRenderer),
);
