import React from "react";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Button } from "@astryxdesign/core";

// A pane that throws takes only itself down, not the whole app. Without this,
// React unmounts everything and the WarLore footer is the only thing left.
export default class PaneError extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <EmptyState
        title="This page didn't load"
        description={error.message}
        headingLevel={1}
        actions={<Button label="Reload" variant="primary" onClick={() => location.reload()} />}
      />
    );
  }
}
