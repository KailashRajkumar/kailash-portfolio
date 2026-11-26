import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditorModal, EmptyState, FloatingBar, isSame, useConfirm } from "./ui";
import { useOrdering, useRefresh, type Table } from "./useOrdering";

type Base = { id: string; sort_order: number };

/**
 * Generic card list + modal editor for simple tables (skills, experience,
 * education). Cards can be dragged to reorder; click a card to edit.
 */
export function CollectionManager<T extends Base, D extends object>({
  table,
  rows,
  noun,
  icon,
  emptyDescription,
  blank,
  toDraft,
  validate,
  normalize,
  renderCard,
  renderForm,
  titleOf,
  columns = 1,
}: {
  table: Table;
  rows: T[];
  noun: string;
  icon: React.ComponentType<{ className?: string }>;
  emptyDescription: string;
  blank: D;
  toDraft: (row: T) => D;
  validate: (d: D) => string | null;
  normalize?: (d: D) => D;
  renderCard: (row: T) => ReactNode;
  renderForm: (d: D, set: (patch: Partial<D>) => void, showErrors: boolean) => ReactNode;
  titleOf: (row: T) => string;
  columns?: 1 | 2;
}) {
  const refresh = useRefresh();
  const order = useOrdering(table, rows);
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<T | "new" | null>(null);

  const remove = async (row: T) => {
    const ok = await confirm({
      title: `Delete “${titleOf(row)}”?`,
      description: `This ${noun} will be removed from your portfolio permanently.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return false;
    const { error } = await supabase.from(table).delete().eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success(`${capitalize(noun)} deleted`);
    refresh();
    return true;
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rows.length
            ? `${rows.length} ${rows.length === 1 ? noun : pluralize(noun)} · drag to reorder, click to edit`
            : null}
        </p>
        <Button onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" />
          Add {noun}
        </Button>
      </div>

      {!rows.length ? (
        <EmptyState
          icon={icon}
          title={`No ${pluralize(noun)} yet`}
          description={emptyDescription}
          action={
            <Button onClick={() => setEditing("new")}>
              <Plus className="h-4 w-4" />
              Add {noun}
            </Button>
          }
        />
      ) : (
        <div className={cn("grid gap-3", columns === 2 && "md:grid-cols-2")}>
          {order.ordered.map((row, i) => (
            <div
              key={row.id}
              {...order.dragProps(row.id)}
              className={cn(
                "group flex items-stretch overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:border-primary/40 hover:shadow-lg",
                order.dragId === row.id && "opacity-50 ring-2 ring-primary/50",
              )}
            >
              <div
                className="flex w-8 shrink-0 cursor-grab items-center justify-center border-r border-border bg-muted/40 text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
                title="Drag to reorder"
              >
                <GripVertical className="h-4 w-4" />
              </div>
              <button
                type="button"
                onClick={() => setEditing(row)}
                className="min-w-0 flex-1 p-4 text-left"
                aria-label={`Edit ${titleOf(row)}`}
              >
                {renderCard(row)}
              </button>
              <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 px-2 opacity-70 transition-opacity group-hover:opacity-100">
                <IconBtn label="Edit" onClick={() => setEditing(row)}>
                  <Pencil className="h-4 w-4" />
                </IconBtn>
                <IconBtn label="Move up" disabled={i === 0} onClick={() => order.move(row.id, -1)}>
                  <ArrowUp className="h-4 w-4" />
                </IconBtn>
                <IconBtn
                  label="Move down"
                  disabled={i === order.ordered.length - 1}
                  onClick={() => order.move(row.id, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </IconBtn>
                <IconBtn label="Delete" danger onClick={() => void remove(row)}>
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="flex min-h-20 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Add {noun}
          </button>
        </div>
      )}

      {order.dirty && (
        <FloatingBar>
          <span className="text-sm font-medium">Order changed</span>
          <Button size="sm" variant="ghost" onClick={order.reset} disabled={order.saving}>
            Reset
          </Button>
          <Button size="sm" onClick={order.save} disabled={order.saving}>
            {order.saving ? "Saving…" : "Save order"}
          </Button>
        </FloatingBar>
      )}

      {editing && (
        <ItemModal
          key={editing === "new" ? "new" : editing.id}
          table={table}
          noun={noun}
          row={editing === "new" ? null : editing}
          initial={editing === "new" ? blank : toDraft(editing)}
          nextSortOrder={(rows.at(-1)?.sort_order ?? 0) + 1}
          validate={validate}
          normalize={normalize}
          renderForm={renderForm}
          title={editing === "new" ? `Add ${noun}` : `Edit ${titleOf(editing)}`}
          onClose={() => setEditing(null)}
          onDelete={
            editing === "new"
              ? undefined
              : async () => {
                  if (await remove(editing)) setEditing(null);
                }
          }
        />
      )}
      {dialog}
    </div>
  );
}

function ItemModal<D extends object>({
  table,
  noun,
  row,
  initial,
  nextSortOrder,
  validate,
  normalize,
  renderForm,
  title,
  onClose,
  onDelete,
}: {
  table: Table;
  noun: string;
  row: Base | null;
  initial: D;
  nextSortOrder: number;
  validate: (d: D) => string | null;
  normalize: ((d: D) => D) | undefined;
  renderForm: (d: D, set: (patch: Partial<D>) => void, showErrors: boolean) => ReactNode;
  title: string;
  onClose: () => void;
  onDelete: (() => void) | undefined;
}) {
  const refresh = useRefresh();
  const start = useMemo(() => initial, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [d, setD] = useState<D>(start);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const error = validate(d);
  const dirty = !isSame(d, start);

  const save = async () => {
    setShowErrors(true);
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    const payload = normalize ? normalize(d) : d;
    const res = row
      ? await supabase
          .from(table)
          .update(payload as never)
          .eq("id", row.id)
      : await supabase.from(table).insert({ ...payload, sort_order: nextSortOrder } as never);
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(row ? "Saved" : `${capitalize(noun)} added`);
    refresh();
    onClose();
  };

  return (
    <EditorModal
      open
      title={title}
      dirty={dirty}
      saving={saving}
      canSave={!error}
      saveLabel={row ? "Save changes" : `Add ${noun}`}
      onSave={save}
      onClose={onClose}
      onDelete={onDelete}
    >
      {renderForm(d, (patch) => setD((cur) => ({ ...cur, ...patch })), showErrors)}
    </EditorModal>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
        danger && "hover:bg-destructive/10 hover:text-destructive",
      )}
    >
      {children}
    </button>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pluralize(s: string) {
  return /[^aeiou]y$/.test(s) ? `${s.slice(0, -1)}ies` : `${s}s`;
}
