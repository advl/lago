import { Component, type ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
  /** Called with what the component under test threw. */
  readonly onError: (error: unknown) => void;
}

interface State {
  readonly failed: boolean;
}

/**
 * Catches what the component under test throws while it draws or runs an
 * effect, so its test fails with that error. Without it the renderer's own
 * boundary would draw the error's stack on the screen, and a picture of a
 * failure would pass as any other.
 */
export default class ErrorCatcher extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}
