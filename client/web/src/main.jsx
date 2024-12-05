import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import React from "react";

import { SocketProvider } from "./socket/Socket.jsx";
import { AuthProvider } from "./context/authContext.jsx";

createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </SocketProvider>
);
