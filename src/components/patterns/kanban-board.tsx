"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode, Ref } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BoardCard, type BoardCardAssignee } from "@/components/ui/board-card";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

const DROP_PLACEHOLDER_FALLBACK_HEIGHT = 158;

export type KanbanColumnState =
  | "withItems"
  | "empty"
  | "dragCard"
  | "collapsed";

type KanbanColumnProps = {
  title: ReactNode;
  count?: number;
  state?: KanbanColumnState;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  children?: ReactNode;
  className?: string;
  innerRef?: Ref<HTMLDivElement>;
  showDropPlaceholder?: boolean;
  dropPlaceholderHeight?: number;
};

export function KanbanColumn({
  title,
  count,
  state = "withItems",
  collapsed,
  onCollapseChange,
  children,
  className,
  innerRef,
  showDropPlaceholder = false,
  dropPlaceholderHeight,
}: KanbanColumnProps) {
  const isCollapsed = state === "collapsed" || collapsed;
  return (
    <div
      className={cn(
        "flex min-h-0 w-kanban-column shrink-0 flex-col gap-md self-stretch rounded-t-lg bg-neutral-200 px-0 pt-lg",
        className,
      )}
      ref={innerRef}
    >
      <div className="flex items-center gap-md px-lg font-medium text-14 text-foreground leading-120">
        <span className="flex-1 truncate">{title}</span>
        {isCollapsed ? (
          <Toggle
            aria-label="Expand column"
            checked={!collapsed}
            onCheckedChange={(v) => onCollapseChange?.(!v)}
          />
        ) : count !== undefined ? (
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-hover text-14 text-foreground">
            {count}
          </span>
        ) : null}
      </div>
      {!isCollapsed ? (
        <div className="scrollbar-none flex min-h-0 flex-1 flex-col gap-md overflow-y-auto px-md pt-xs pb-xl">
          {children}
          {showDropPlaceholder ? (
            <div
              aria-hidden
              className="w-full rounded-md bg-hover"
              style={{
                height:
                  dropPlaceholderHeight ?? DROP_PLACEHOLDER_FALLBACK_HEIGHT,
              }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export type KanbanCardData = {
  id: string;
  columnId: string;
  title: ReactNode;
  description?: ReactNode;
  timestamp?: ReactNode;
  badge?: ReactNode;
  assignee?: BoardCardAssignee | null;
};

export type KanbanColumnDef = {
  id: string;
  title: ReactNode;
  collapsed?: boolean;
};

type CardPlacement = Pick<KanbanCardData, "id" | "columnId">;

type KanbanBoardProps = {
  columns: KanbanColumnDef[];
  cards: KanbanCardData[];
  onCardMove?: (
    cardId: string,
    toColumnId: string,
    orderedCardIds: string[],
  ) => unknown;
  onCardClick?: (cardId: string) => void;
  onColumnCollapseChange?: (columnId: string, collapsed: boolean) => void;
  className?: string;
};

function placementsFromCards(cards: KanbanCardData[]): CardPlacement[] {
  return cards.map((card) => ({ id: card.id, columnId: card.columnId }));
}

function sameCardPlacements(a: CardPlacement[], b: CardPlacement[]) {
  if (a.length !== b.length) return false;
  return a.every((card, index) => {
    const other = b[index];
    return other && other.id === card.id && other.columnId === card.columnId;
  });
}

function sameCardIds(a: CardPlacement[], b: CardPlacement[]) {
  if (a.length !== b.length) return false;
  const ids = new Set(a.map((card) => card.id));
  return b.every((card) => ids.has(card.id));
}

function columnItems(
  cards: CardPlacement[],
  columnId: string,
): CardPlacement[] {
  return cards.filter((card) => card.columnId === columnId);
}

function flattenColumns(
  columns: KanbanColumnDef[],
  byColumn: Map<string, CardPlacement[]>,
) {
  return columns.flatMap((column) => byColumn.get(column.id) ?? []);
}

function moveCard(
  cards: CardPlacement[],
  columns: KanbanColumnDef[],
  activeId: string,
  overId: string,
  event?: DragOverEvent | DragEndEvent,
) {
  const activeCard = cards.find((card) => card.id === activeId);
  if (!activeCard) return cards;

  const columnIds = new Set(columns.map((column) => column.id));
  const overCard = cards.find((card) => card.id === overId);
  const targetColumnId = columnIds.has(overId) ? overId : overCard?.columnId;
  if (!targetColumnId) return cards;

  if (overCard && activeCard.columnId === overCard.columnId) {
    const items = columnItems(cards, activeCard.columnId);
    const oldIndex = items.findIndex((card) => card.id === activeId);
    const newIndex = items.findIndex((card) => card.id === overId);
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return cards;
    const byColumn = new Map<string, CardPlacement[]>();
    for (const column of columns) {
      byColumn.set(
        column.id,
        column.id === activeCard.columnId
          ? arrayMove(items, oldIndex, newIndex)
          : columnItems(cards, column.id),
      );
    }
    return flattenColumns(columns, byColumn);
  }

  const byColumn = new Map<string, CardPlacement[]>();
  for (const column of columns) {
    byColumn.set(
      column.id,
      columnItems(cards, column.id).filter((card) => card.id !== activeId),
    );
  }

  const targetItems = byColumn.get(targetColumnId) ?? [];
  const overIndex = overCard
    ? targetItems.findIndex((card) => card.id === overCard.id)
    : -1;
  const translated = event?.active.rect.current.translated;
  const overRect = event?.over?.rect;
  const isBelowOverItem = Boolean(
    overCard &&
      translated &&
      overRect &&
      translated.top > overRect.top + overRect.height,
  );
  const insertIndex =
    overIndex >= 0 ? overIndex + (isBelowOverItem ? 1 : 0) : targetItems.length;
  targetItems.splice(insertIndex, 0, {
    ...activeCard,
    columnId: targetColumnId,
  });
  byColumn.set(targetColumnId, targetItems);
  return flattenColumns(columns, byColumn);
}

function DroppableKanbanColumn({
  id,
  collapsed,
  children,
  dropPlaceholderHeight,
  ...rest
}: {
  id: string;
  title: ReactNode;
  count?: number;
  collapsed?: boolean;
  onCollapseChange?: (c: boolean) => void;
  children?: ReactNode;
  dropPlaceholderHeight?: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const state: KanbanColumnState = collapsed
    ? "collapsed"
    : isOver
      ? "dragCard"
      : "withItems";
  return (
    <KanbanColumn
      collapsed={collapsed}
      dropPlaceholderHeight={dropPlaceholderHeight}
      innerRef={setNodeRef}
      showDropPlaceholder={isOver && !collapsed}
      state={state}
      {...rest}
    >
      {children}
    </KanbanColumn>
  );
}

function DraggableCard({
  card,
  onCardClick,
  onMeasure,
}: {
  card: KanbanCardData;
  onCardClick?: (id: string) => void;
  onMeasure?: (id: string, height: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
  });
  const measureRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (node && onMeasure) onMeasure(card.id, node.offsetHeight);
  };
  return (
    <div
      className={cn("touch-none", isDragging && "opacity-40")}
      ref={measureRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...listeners}
      {...attributes}
    >
      <BoardCard
        assignee={card.assignee}
        badge={card.badge}
        className="w-full"
        description={card.description}
        onClick={onCardClick ? () => onCardClick(card.id) : undefined}
        showSelectionIndicator
        timestamp={card.timestamp}
        title={card.title}
      />
    </div>
  );
}

export function KanbanBoard({
  columns,
  cards,
  onCardMove,
  onCardClick,
  onColumnCollapseChange,
  className,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [cardPlacements, setCardPlacements] = useState(() =>
    placementsFromCards(cards),
  );
  const cardPlacementsRef = useRef(cardPlacements);
  const pendingMutationId = useRef(0);
  const dragStartPlacements = useRef(cardPlacements);
  const suppressClickId = useRef<string | null>(null);
  const suppressClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardHeights = useRef(new Map<string, number>());
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (activeId) return;
    const nextPlacements = placementsFromCards(cards);
    setCardPlacements((current) => {
      if (sameCardPlacements(current, nextPlacements)) {
        pendingMutationId.current = 0;
        return current;
      }

      if (
        pendingMutationId.current > 0 &&
        sameCardIds(current, nextPlacements)
      ) {
        return current;
      }

      cardPlacementsRef.current = nextPlacements;
      return nextPlacements;
    });
  }, [activeId, cards]);

  useEffect(() => {
    return () => {
      if (suppressClickTimer.current) clearTimeout(suppressClickTimer.current);
    };
  }, []);

  const orderedCards = useMemo(() => {
    const cardById = new Map(cards.map((card) => [card.id, card]));
    return cardPlacements.flatMap((placement) => {
      const card = cardById.get(placement.id);
      return card ? [{ ...card, columnId: placement.columnId }] : [];
    });
  }, [cardPlacements, cards]);

  const handleMeasure = (id: string, height: number) => {
    cardHeights.current.set(id, height);
  };

  const commitCardPlacements = (placements: CardPlacement[]) => {
    cardPlacementsRef.current = placements;
    setCardPlacements(placements);
  };

  const suppressNextClick = (id: string) => {
    suppressClickId.current = id;
    if (suppressClickTimer.current) clearTimeout(suppressClickTimer.current);
    suppressClickTimer.current = setTimeout(() => {
      suppressClickId.current = null;
    }, 250);
  };

  const handleCardClick = (id: string) => {
    if (suppressClickId.current === id) {
      suppressClickId.current = null;
      return;
    }
    onCardClick?.(id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    dragStartPlacements.current = cardPlacementsRef.current;
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!event.over) return;
    const cardId = String(event.active.id);
    const overId = String(event.over.id);
    setCardPlacements((current) => {
      const next = moveCard(current, columns, cardId, overId, event);
      cardPlacementsRef.current = next;
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    if (!event.over) {
      commitCardPlacements(dragStartPlacements.current);
      suppressNextClick(String(event.active.id));
      return;
    }
    const cardId = String(event.active.id);
    const finalPlacements = cardPlacementsRef.current;
    const card = finalPlacements.find((c) => c.id === cardId);
    if (!card) return;
    suppressNextClick(cardId);
    if (sameCardPlacements(finalPlacements, dragStartPlacements.current)) {
      return;
    }

    const mutationId = pendingMutationId.current + 1;
    pendingMutationId.current = mutationId;
    const orderedCardIds = finalPlacements
      .filter((candidate) => candidate.columnId === card.columnId)
      .map((candidate) => candidate.id);

    Promise.resolve(onCardMove?.(cardId, card.columnId, orderedCardIds)).catch(
      () => {
        if (pendingMutationId.current !== mutationId) return;
        pendingMutationId.current = 0;
        commitCardPlacements(dragStartPlacements.current);
      },
    );
  };

  const activeCard = activeId
    ? orderedCards.find((c) => c.id === activeId)
    : null;
  const activeCardHeight = activeId
    ? cardHeights.current.get(activeId)
    : undefined;

  return (
    <DndContext
      collisionDetection={closestCorners}
      id="open-issues-kanban"
      onDragCancel={() => {
        setActiveId(null);
        commitCardPlacements(dragStartPlacements.current);
        if (activeId) suppressNextClick(activeId);
      }}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div
        className={cn(
          "scrollbar-none flex min-h-0 min-w-0 basis-0 items-stretch justify-start gap-lg overflow-x-auto overflow-y-hidden",
          className,
        )}
      >
        {columns.map((col) => {
          const cardsForColumn = orderedCards.filter(
            (c) => c.columnId === col.id,
          );
          return (
            <DroppableKanbanColumn
              collapsed={col.collapsed}
              count={col.collapsed ? undefined : cardsForColumn.length}
              dropPlaceholderHeight={activeCardHeight}
              id={col.id}
              key={col.id}
              onCollapseChange={
                onColumnCollapseChange
                  ? (c) => onColumnCollapseChange(col.id, c)
                  : undefined
              }
              title={col.title}
            >
              <SortableContext
                items={cardsForColumn.map((card) => card.id)}
                strategy={verticalListSortingStrategy}
              >
                {cardsForColumn.map((card) => (
                  <DraggableCard
                    card={card}
                    key={card.id}
                    onCardClick={onCardClick ? handleCardClick : undefined}
                    onMeasure={handleMeasure}
                  />
                ))}
              </SortableContext>
            </DroppableKanbanColumn>
          );
        })}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeCard ? (
          <BoardCard
            assignee={activeCard.assignee}
            badge={activeCard.badge}
            className="-rotate-2 shadow-hover"
            description={activeCard.description}
            showSelectionIndicator
            timestamp={activeCard.timestamp}
            title={activeCard.title}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
