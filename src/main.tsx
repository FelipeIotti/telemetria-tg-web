import ReactDOM, { type Container } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import { router } from "./routes";

const root = document.getElementById("root");

ReactDOM.createRoot(root as Container).render(
  <RouterProvider router={router} />
);
