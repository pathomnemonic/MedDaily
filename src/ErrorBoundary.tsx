import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode; label?: string; onBack?: () => void; resetKey?: string }
interface State { failed: boolean }

/** Keeps one crashing screen or game from blanking the whole app. Progress is saved in localStorage, so a reload is safe. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Clinicle crashed:", error, info.componentStack); }
  componentDidUpdate(prev: Props) { if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false }); }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div className="card error-card" role="alert" style={{ padding: 24, textAlign: "center" }}>
      <h2>Something went wrong{this.props.label ? " in " + this.props.label : ""}</h2>
      <p>Your progress is saved. You can go back or reload and carry on.</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {this.props.onBack && <button className="button button-soft" onClick={() => { this.setState({ failed: false }); this.props.onBack?.(); }}>← Back</button>}
        <button className="button button-primary" onClick={() => window.location.reload()}>Reload</button>
      </div>
    </div>;
  }
}
