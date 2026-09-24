import React from "react";
import { createRoot } from "react-dom/client";
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "./theme/fonts.css";
import "./theme/marches.css";
import "./theme/paper.css";
import App from "./App.jsx";

// Every deploy renames the code-split chunks and deletes the old ones, so a tab
// opened before a deploy asks for files that are gone. Reload once to pick up
// the new build; if that still fails, PaneError shows what broke.
addEventListener("vite:preloadError", (event) => {
  let last = 0;
  try { last = Number(sessionStorage.getItem("om-reloaded-at")) || 0; } catch {}
  if (Date.now() - last < 10000) return;
  try { sessionStorage.setItem("om-reloaded-at", String(Date.now())); } catch {}
  event.preventDefault();
  location.reload();
});

createRoot(document.getElementById("root")).render(<App />);
