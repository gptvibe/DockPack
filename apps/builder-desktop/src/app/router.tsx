import { createHashRouter } from "react-router-dom";

import { AppShell } from "@/app/app-shell";
import { AnalyzePage } from "@/pages/analyze-page";
import { BuildPage } from "@/pages/build-page";
import { HomePage } from "@/pages/home-page";
import { PackagePage } from "@/pages/package-page";
import { SettingsPage } from "@/pages/settings-page";

export const router = createHashRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "analyze",
        element: <AnalyzePage />,
      },
      {
        path: "package",
        element: <PackagePage />,
      },
      {
        path: "build",
        element: <BuildPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
