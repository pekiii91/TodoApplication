import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";

import { Provider } from "react-redux";
import { store } from "./store/store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/:dateParam" element={<App />} />
          <Route path="/" element={<App />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
