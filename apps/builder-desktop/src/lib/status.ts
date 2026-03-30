export type StatusTone = "active" | "building" | "draft" | "error" | "ready" | "success" | "warning";

const labels: Record<StatusTone, string> = {
  active: "Active",
  building: "Building",
  draft: "Draft",
  error: "Error",
  ready: "Ready",
  success: "Success",
  warning: "Warning",
};

export function getStatusLabel(status: StatusTone) {
  return labels[status];
}
