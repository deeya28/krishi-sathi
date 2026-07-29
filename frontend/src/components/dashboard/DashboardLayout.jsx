import { useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children, rightPanel }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper">
      <Topbar onMenuClick={() => setMobileNavOpen(true)} />
      <div className="flex max-w-[1400px] mx-auto">
        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 sm:py-8">{children}</main>
        {rightPanel && (
          <aside className="hidden lg:block w-72 shrink-0 px-6 py-8 border-l border-soil/10">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}
