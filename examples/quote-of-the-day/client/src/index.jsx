// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

window.addEventListener("beforeunload", (event) => {
  // clear the localStorage when the user leaves the page
  localStorage.clear()
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);