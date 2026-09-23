import React from "react";
import { createRoot } from "react-dom/client";
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "@uppy/core/css/style.css";
import "@uppy/dashboard/css/style.css";
import "@uppy/image-editor/css/style.css";
import "./theme/fonts.css";
import "./theme/marches.css";
import "./theme/paper.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
