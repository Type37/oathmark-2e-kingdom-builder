import React from "react";
import { createPortal } from "react-dom";

// Print sheets live at the top of the body, not inside the app. Hiding the app
// with `visibility: hidden` left it occupying its full height, so the printer
// counted the app's pages and the sheet spilled over blank ones.
export default function PrintSheet({ children }) {
  const host = React.useMemo(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("div");
    el.className = "om-print";
    el.setAttribute("aria-hidden", "true");
    return el;
  }, []);

  React.useEffect(() => {
    if (!host) return undefined;
    document.body.appendChild(host);
    return () => host.remove();
  }, [host]);

  return host ? createPortal(children, host) : null;
}
