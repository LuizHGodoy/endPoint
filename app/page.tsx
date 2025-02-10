"use client";

import CollectionsSidebar from "@/components/collections-sidebar";
import { RequestPanel } from "@/components/request-panel";
import { useSyncDB } from "@/hooks/use-sync-db";
import { Provider } from "jotai";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Provider>
      <AppContent isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
    </Provider>
  );
}

function AppContent({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}) {
  useSyncDB();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        className={`
          relative bg-gray-900 transition-all duration-200 ease-in-out
          ${isCollapsed ? "w-[60px]" : "w-[300px]"}
          flex-shrink-0
        `}
      >
        <div className="h-full">
          <CollectionsSidebar isCollapsed={isCollapsed} />
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-3 -right-3 p-1 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors z-50"
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${
              isCollapsed ? "" : "rotate-180"
            }`}
          />
        </button>
      </aside>

      <main className="flex-1 overflow-hidden pl-8">
        <RequestPanel />
      </main>
    </div>
  );
}
