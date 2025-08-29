import { createBrowserRouter } from "react-router";
import { AppLayout } from "./app/pages/_layouts/app";
import { BaseData } from "./app/pages/base-data";
import { Charts } from "./app/pages/charts";
import { MapPage } from "./app/pages/map";
import { Tires } from "./app/pages/tires";

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
