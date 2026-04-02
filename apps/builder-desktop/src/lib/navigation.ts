import { Hammer, Home, Package, Search, Settings2, type LucideIcon } from "lucide-react";

export type RoutePath = "/" | "/analyze" | "/package" | "/build" | "/settings";

export interface NavigationItem {
  description: string;
  headerSubtitle: string;
  headerTitle: string;
  icon: LucideIcon;
  label: string;
  to: RoutePath;
}

export const navigationItems: NavigationItem[] = [
  {
    to: "/",
    label: "Home",
    description: "Paste a source and begin",
    icon: Home,
    headerTitle: "Start a New Package",
    headerSubtitle: "Paste a Docker Hub image or GitHub repository, get friendly validation right away, and move into analysis with a clean source.",
  },
  {
    to: "/analyze",
    label: "Analyze",
    description: "Validate source inputs",
    icon: Search,
    headerTitle: "Analyze Source",
    headerSubtitle: "Start from a Docker Hub image or GitHub repository, then confirm that DockPack can package it as a one-container experience.",
  },
  {
    to: "/package",
    label: "Package",
    description: "Configure the installer",
    icon: Package,
    headerTitle: "Package Setup",
    headerSubtitle: "Shape the launcher, installer metadata, runtime defaults, and first-run guidance without exposing Docker complexity.",
  },
  {
    to: "/build",
    label: "Build",
    description: "Generate artifacts",
    icon: Hammer,
    headerTitle: "Build Pipeline",
    headerSubtitle: "Review the packaging stages, build logs, and artifact checkpoints before handing the output to nontechnical users.",
  },
  {
    to: "/settings",
    label: "Settings",
    description: "Workspace defaults",
    icon: Settings2,
    headerTitle: "Builder Settings",
    headerSubtitle: "Set workspace-level preferences for theme, output defaults, and packaging guardrails used by new DockPack projects.",
  },
];

export function getNavigationMeta(pathname: string) {
  return navigationItems.find((item) => item.to === pathname) ?? navigationItems[0];
}
