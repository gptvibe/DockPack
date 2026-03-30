import { Outlet } from "react-router-dom";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopHeader } from "@/components/layout/top-header";

export function AppShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-mesh-light dark:bg-mesh-dark" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.09)_1px,transparent_1px)] [background-size:48px_48px] opacity-40 dark:opacity-15" />

      <div className="relative lg:grid lg:min-h-screen lg:grid-cols-[300px_1fr]">
        <AppSidebar />

        <div className="flex min-h-screen flex-col">
          <TopHeader />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
            <div className="mx-auto w-full max-w-[1440px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
