import prepareStory from "./prepareStory.js";
import type { PreparedStory, Preview, StoriesModule } from "./types.js";

/**
 * Every story of a stories file's module, prepared. `where` names the module
 * in the error for a default export without a title, which is the one thing
 * a stories file must give. Each story is set inside the project's preview,
 * when there is one.
 */
export default function listStories(
  module: StoriesModule,
  where: string,
  preview?: Preview,
): PreparedStory[] {
  const meta = module.default;
  if (typeof meta?.title !== "string" || meta.title === "") {
    throw new Error(
      `${where} has no title. Its default export must give one, as in title: "components/SearchBox".`,
    );
  }
  return Object.entries(module)
    .filter(([name]) => name !== "default")
    .map(([name, exported]) => prepareStory(meta, name, exported, preview));
}
