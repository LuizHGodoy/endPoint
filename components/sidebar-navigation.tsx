import { Settings } from "lucide-react";
import CollectionsSidebar from "./collections-sidebar";
import { Button } from "./ui/button";

interface SidebarNavigationProps {
  isCollapsed: boolean;
  onOpenSettings: () => void;
  onItemClick?: () => void;
}

export function SidebarNavigation({ 
  isCollapsed, 
  onOpenSettings,
  onItemClick,
}: SidebarNavigationProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-gray-800">
        {!isCollapsed && (
          <h2 className="font-semibold text-gray-300">Coleções</h2>
        )}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <CollectionsSidebar 
          isCollapsed={isCollapsed} 
          onItemClick={onItemClick}
        />
      </div>
    </div>
  );
}
