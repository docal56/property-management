"use client";

import { BoardCard } from "@/components/ui/board-card";
import { Label } from "@/components/ui/label";

export function BoardCardDemo() {
  return (
    <div className="flex flex-wrap gap-lg">
      <BoardCard
        badge={<Label variant="destructive">Urgent</Label>}
        className="w-80"
        description="Tenant reported a broken hot tap. The issue started on weds 16th April, but hot water is available elsewhere in the property."
        onMenuClick={() => {}}
        timestamp="Today, 10:30am"
        title="59 Wakefield Road, HX3 8AQ"
      />
      <BoardCard
        className="w-80"
        description="Tenant reported a broken hot tap. The issue started on weds 16th April."
        onMenuClick={() => {}}
        timestamp="Today, 10:30am"
        title="59 Wakefield Road, HX3 8AQ"
      />
    </div>
  );
}
