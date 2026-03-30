import type { StatusTone } from "@/lib/status";

export interface ProjectHistoryItem {
  id: string;
  name: string;
  sourceType: "Docker Hub" | "GitHub";
  status: StatusTone;
  summary: string;
  updatedAt: string;
  version: string;
}

export const projectHistory: ProjectHistoryItem[] = [
  {
    id: "acme-notes",
    name: "Acme Notes",
    sourceType: "Docker Hub",
    status: "ready",
    summary: "Public notes app with a single HTTP port and a short first-run path.",
    updatedAt: "12 minutes ago",
    version: "v0.9.4",
  },
  {
    id: "support-portal",
    name: "Support Portal",
    sourceType: "GitHub",
    status: "building",
    summary: "Repository analysis completed. Packaging build is waiting on installer assets.",
    updatedAt: "38 minutes ago",
    version: "v1.2.0",
  },
  {
    id: "field-dashboard",
    name: "Field Dashboard",
    sourceType: "GitHub",
    status: "warning",
    summary: "Single-container path is viable, but runtime variables still need review.",
    updatedAt: "Today, 9:18 AM",
    version: "v0.4.1",
  },
  {
    id: "inventory-hub",
    name: "Inventory Hub",
    sourceType: "Docker Hub",
    status: "draft",
    summary: "Saved configuration draft with manifest defaults and placeholder branding.",
    updatedAt: "Yesterday",
    version: "v0.2.0",
  },
];
