import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { startMonitoring } from "./monitoring";
import ErrorBoundary from "./ErrorBoundary";
import Atmosphere from "./components/Atmosphere";
import "./styles.css";
import { applyTheme } from "./theme";
import { loadPlayer } from "./storage";

applyTheme(loadPlayer().theme); // before first paint, so there is no flash of the wrong palette

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Atmosphere />
    <ErrorBoundary label="Roundsy"><App /></ErrorBoundary>
  </React.StrictMode>
);
startMonitoring();
