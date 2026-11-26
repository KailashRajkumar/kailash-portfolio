import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Table = "projects" | "skills" | "experiences" | "education";

export function useRefresh() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["portfolio"] });
    void qc.invalidateQueries({ queryKey: ["profile"] });
  };
}

/**
 * Local ordering with drag-and-drop + move up/down. Changes stay local until
 * `save()` writes sort_order for every row.
 */
export function useOrdering<T extends { id: string }>(table: Table, rows: T[]) {
  const refresh = useRefresh();
  const serverIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const [ids, setIds] = useState<string[]>(serverIds);
  const [dragId, setDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => setIds(serverIds), [serverIds]);

  const ordered = useMemo(() => {
    const byId = new Map(rows.map((r) => [r.id, r]));
    const list = ids.map((id) => byId.get(id)).filter((r): r is T => !!r);
    return list.concat(rows.filter((r) => !ids.includes(r.id)));
  }, [ids, rows]);

  const dirty = ordered.some((r, i) => r.id !== serverIds[i]);

  const moveTo = (id: string, targetId: string) => {
    if (id === targetId) return;
    setIds((cur) => {
      const list = ordered.map((r) => r.id);
      const from = list.indexOf(id);
      const to = list.indexOf(targetId);
      if (from < 0 || to < 0) return cur;
      list.splice(from, 1);
      list.splice(to, 0, id);
      return list;
    });
  };

  const move = (id: string, dir: -1 | 1) => {
    const list = ordered.map((r) => r.id);
    const at = list.indexOf(id);
    const target = list[at + dir];
    if (target) moveTo(id, target);
  };

  const dragProps = (id: string, enabled = true) =>
    enabled
      ? {
          draggable: true,
          onDragStart: (e: React.DragEvent) => {
            setDragId(id);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", id);
          },
          onDragOver: (e: React.DragEvent) => {
            if (!dragId) return;
            e.preventDefault();
            if (dragId !== id) moveTo(dragId, id);
          },
          onDrop: (e: React.DragEvent) => e.preventDefault(),
          onDragEnd: () => setDragId(null),
        }
      : {};

  const save = async () => {
    setSaving(true);
    const results = await Promise.all(
      ordered.map((r, index) =>
        supabase
          .from(table)
          .update({ sort_order: index + 1 } as never)
          .eq("id", r.id),
      ),
    );
    setSaving(false);
    if (results.some(({ error }) => error)) {
      toast.error("Some positions could not be saved. Please try again.");
      return;
    }
    toast.success("Order saved");
    refresh();
  };

  return {
    ordered,
    dirty,
    saving,
    dragId,
    move,
    dragProps,
    save,
    reset: () => setIds(serverIds),
  };
}
