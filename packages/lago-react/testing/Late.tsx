import { Suspense, use } from "react";

function Value({ value }: { value: Promise<string> }) {
  return <text>{use(value)}</text>;
}

/** Suspends on its first render until `value` resolves, then shows it. */
export default function Late({ value }: { value: Promise<string> }) {
  return (
    <Suspense fallback={<text>loading</text>}>
      <Value value={value} />
    </Suspense>
  );
}
