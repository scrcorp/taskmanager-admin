"use client";

import React, { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableItem {
  id: string;
  sort_order: number;
}

interface SortableListProps<T extends SortableItem> {
  items: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onReorder?: (reorderedItems: T[]) => void;
  onEdit?: (item: T, e: React.MouseEvent) => void;
  onDelete?: (item: T, e: React.MouseEvent) => void;
  /** Custom content renderer. Falls back to item.name if not provided. */
  renderContent?: (item: T, index: number) => React.ReactNode;
  /** Custom extra actions to render before edit/delete buttons */
  renderExtra?: (item: T) => React.ReactNode;
  /** Smaller variant for nested lists */
  compact?: boolean;
}

function SortableRow<T extends SortableItem>({
  item,
  index,
  onEdit,
  onDelete,
  renderContent,
  renderExtra,
  compact,
}: {
  item: T;
  index: number;
  onEdit?: (item: T, e: React.MouseEvent) => void;
  onDelete?: (item: T, e: React.MouseEvent) => void;
  renderContent?: (item: T, index: number) => React.ReactNode;
  renderExtra?: (item: T) => React.ReactNode;
  compact?: boolean;
}): React.ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const label: string =
    "name" in item
      ? (item as T & { name: string }).name
      : "title" in item
        ? (item as T & { title: string }).title
        : item.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 bg-card border border-border rounded-lg group",
        compact ? "px-3 py-2" : "px-4 py-3",
        isDragging && "opacity-50 shadow-lg z-10 relative",
      )}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text transition-colors touch-none shrink-0"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
      <div className="flex-1 min-w-0">
        {renderContent ? (
          renderContent(item, index)
        ) : (
          <span className={cn("font-medium text-text", compact ? "text-xs" : "text-sm")}>
            {label}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {renderExtra?.(item)}
        {onEdit && (
          <button
            type="button"
            onClick={(e: React.MouseEvent) => onEdit(item, e)}
            className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
            aria-label={`Edit ${label}`}
          >
            <Edit className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e: React.MouseEvent) => onDelete(item, e)}
            className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger-muted transition-colors"
            aria-label={`Delete ${label}`}
          >
            <Trash2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
        )}
      </div>
    </div>
  );
}

export function SortableList<T extends SortableItem>({
  items,
  isLoading,
  emptyMessage = "No items yet.",
  onReorder,
  onEdit,
  onDelete,
  renderContent,
  renderExtra,
  compact,
}: SortableListProps<T>): React.ReactElement {
  const [localItems, setLocalItems] = useState<T[]>(items);

  // Sync when items change externally
  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent): void => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex: number = localItems.findIndex(
        (item: T) => item.id === active.id,
      );
      const newIndex: number = localItems.findIndex(
        (item: T) => item.id === over.id,
      );

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered: T[] = arrayMove(localItems, oldIndex, newIndex).map(
        (item: T, index: number) => ({
          ...item,
          sort_order: index + 1,
        }),
      );

      setLocalItems(reordered);
      onReorder?.(reordered);
    },
    [localItems, onReorder],
  );

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center", compact ? "h-16" : "h-32")}>
        <div
          className="animate-spin rounded-full border-accent border-t-transparent h-8 w-8 border-2"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (localItems.length === 0) {
    return (
      <div className={cn("bg-card border border-border rounded-xl text-center", compact ? "p-4" : "p-8")}>
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localItems.map((item: T) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1.5">
          {localItems.map((item: T, index: number) => (
            <SortableRow<T>
              key={item.id}
              item={item}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              renderContent={renderContent}
              renderExtra={renderExtra}
              compact={compact}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
