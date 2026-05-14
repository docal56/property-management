"use client";

import { useState } from "react";
import {
  KanbanBoard,
  type KanbanCardData,
  type KanbanColumnDef,
} from "@/components/patterns/kanban-board";
import { Label } from "@/components/ui/label";

const initialCards: KanbanCardData[] = [
  {
    id: "card-1",
    columnId: "new",
    title: "Broken hot tap reported by tenant",
    description: "59 Wakefield Road, HX3 8AQ",
    timestamp: "Today, 10:30am",
    badge: <Label variant="destructive">Urgent</Label>,
  },
  {
    id: "card-2",
    columnId: "new",
    title: "Valuation request for residential property",
    description: "7 Watkins Place, Hipperholme, Halifax, HX3 8FR",
    timestamp: "Today, 10:30am",
  },
  {
    id: "card-3",
    columnId: "in-progress",
    title: "Intermittent heating needs follow-up",
    description: "12 Oakdene Rise, HD1 3QP",
    timestamp: "Yesterday, 4:12pm",
  },
  {
    id: "card-4",
    columnId: "scheduled",
    title: "Leaking kitchen tap scheduled with plumber",
    description: "3 Elm Court, HX2 9JF",
    timestamp: "2 days ago",
  },
];

const initialColumns: KanbanColumnDef[] = [
  { id: "new", title: "New Issues" },
  { id: "in-progress", title: "In Progress" },
  { id: "scheduled", title: "Scheduled" },
  { id: "completed", title: "Completed", collapsed: true },
];

export function KanbanBoardDemo() {
  const [columns, setColumns] = useState(initialColumns);
  const [cards, setCards] = useState(initialCards);

  const handleMove = (
    cardId: string,
    toColumnId: string,
    orderedCardIds: string[],
  ) => {
    setCards((cs) => {
      const byId = new Map(cs.map((card) => [card.id, card]));
      const orderedTargetCards = orderedCardIds.flatMap((id) => {
        const card = byId.get(id);
        return card ? [{ ...card, columnId: toColumnId }] : [];
      });
      return [
        ...cs.filter(
          (card) => card.columnId !== toColumnId && card.id !== cardId,
        ),
        ...orderedTargetCards,
      ];
    });
  };

  const handleCollapse = (columnId: string, collapsed: boolean) => {
    setColumns((cols) =>
      cols.map((c) => (c.id === columnId ? { ...c, collapsed } : c)),
    );
  };

  return (
    <KanbanBoard
      cards={cards}
      columns={columns}
      onCardMove={handleMove}
      onColumnCollapseChange={handleCollapse}
    />
  );
}
