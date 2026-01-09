
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface TabMenuProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  tabClassName?: string;
}

const TabMenu: React.FC<TabMenuProps> = ({
  tabs,
  defaultTab,
  onChange,
  className,
  tabClassName,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);
  const lastClickRef = useRef<number>(0);

  // Sincroniza si cambia defaultTab desde el padre
  useEffect(() => {
    if (defaultTab && defaultTab !== activeTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabChange = (tabId: string) => {
    // Evita re-clicks muy rápidos que puedan causar doble render
    const now = Date.now();
    if (now - (lastClickRef.current || 0) < 250) return;
    lastClickRef.current = now;

    if (tabId === activeTab) return; // no hagas nada si ya está activo
    setActiveTab(tabId);
    onChange && onChange(tabId);
  };

  return (
    <div
      className={cn(
        "flex items-center rounded-xl p-1 bg-secondary/30 shadow-inner-dark shadow-inner-light",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all duration-300",
            activeTab === tab.id
              ? "neu-button-active"
              : "text-muted-foreground hover:text-foreground",
            tabClassName
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabMenu;
