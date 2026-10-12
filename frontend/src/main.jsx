import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import { initEmbedBridge } from "./embedBridge.js";
import "./styles/index.css";

initEmbedBridge();

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
