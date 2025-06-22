import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {process.env.NODE_ENV === 'production' ? (
      <MemoryRouter>
        <App />
        <Toaster />
      </MemoryRouter>
    ) : (
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    )}
  </StrictMode>
);
