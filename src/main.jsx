import React from "react";
import { createRoot } from "react-dom/client";
import App, { AdminRoute } from "./App.jsx";
import "./styles.css";

const isAdminPath = window.location.pathname.replace(/\/$/, "") === "/admin";

createRoot(document.getElementById("root")).render(
  isAdminPath ? <AdminRoute /> : <App />
);
