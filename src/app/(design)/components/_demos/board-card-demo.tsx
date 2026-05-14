"use client";

import { BoardCard } from "@/components/ui/board-card";
import { Label } from "@/components/ui/label";

export function BoardCardDemo() {
  return (
    <div className="flex flex-wrap gap-lg">
      <BoardCard
        badge={<Label variant="destructive">Urgent</Label>}
        className="w-80"
        description="59 Wakefield Road, HX3 8AQ"
        onMenuClick={() => {}}
        timestamp="Today, 10:30am"
        title="Broken hot tap reported by tenant"
      />
      <BoardCard
        className="w-80"
        description="7 Watkins Place, Hipperholme, Halifax, HX3 8FR"
        onMenuClick={() => {}}
        timestamp="Today, 10:30am"
        title="Valuation request for residential property"
      />
    </div>
  );
}
