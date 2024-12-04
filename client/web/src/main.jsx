import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import React from "react";

import { SocketProvider } from "./socket/Socket.jsx";

createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <App />
  </SocketProvider>
);

