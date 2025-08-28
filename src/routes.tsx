import { createBrowserRouter } from "react-router";
import { AppLayout } from "./pages/_layouts/app";
import { BaseData } from "./pages/base-data";
import { Charts } from "./pages/charts";
import { MapPage } from "./pages/map";
import { Tires } from "./pages/tires";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "/", element: <BaseData /> },
      { path: "/tires", element: <Tires /> },
      { path: "/charts", element: <Charts /> },
      { path: "/map", element: <MapPage /> },
    ],
  },
]);
