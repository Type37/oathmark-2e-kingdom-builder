import React from "react";
import { createRoot } from "react-dom/client";
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "./theme/fonts.css";
import "./theme/marches.css";
import "./theme/paper.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
