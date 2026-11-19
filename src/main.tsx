import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Atmosphere from "./components/Atmosphere";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Atmosphere />
    <App />
  </React.StrictMode>
);