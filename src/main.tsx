import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AuthContextProvider from "./context/AuthContext.tsx";
import "./index.css";
import App from "./App.tsx";
import UserContextProvider from "./context/UserContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthContextProvider>
      <UserContextProvider>
        <App />
      </UserContextProvider>
    </AuthContextProvider>
  </StrictMode>,
);
