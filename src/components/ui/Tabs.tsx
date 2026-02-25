"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * 탭 컴포넌트 -- 수평 탭 버튼 그룹으로 활성 탭을 표시합니다.
 *
 * Horizontal tab button group with active tab indicator.
 *
 * @param tabs - 탭 정의 배열 (Array of tab definitions with key and label)
 * @param activeTab - 현재 활성 탭 키 (Currently active tab key)
 * @param onTabChange - 탭 변경 핸들러 (Handler called when tab changes)
 */

interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
}: TabsProps): React.ReactElement {
  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab: TabItem) => {
        const isActive: boolean = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors duration-150 border-b-2 -mb-px cursor-pointer",
              isActive
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-secondary hover:border-border",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
