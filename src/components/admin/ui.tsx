import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/30 aria-[invalid=true]:border-destructive";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function isSame(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Warns the browser before leaving the page while there are unsaved edits. */
export function useBeforeUnload(active: boolean) {
  useEffect(() => {
    if (!active) return undefined;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);
}

const MAX_UPLOAD_MB = 8;

export async function uploadImage(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) {
    toast.error("Please choose an image file (PNG, JPG or WebP).");
    return null;
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    toast.error(`Image is too large. Max ${MAX_UPLOAD_MB} MB.`);
    return null;
  }
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "")}`;
  const { error } = await supabase.storage.from("portfolio").upload(path, file);
  if (error) {
    toast.error(error.message);
    return null;
  }
  const { data } = await supabase.storage
    .from("portfolio")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  return data?.signedUrl ?? null;
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  error,
  required,
  counter,
  className,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null | undefined;
  required?: boolean;
  counter?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("block space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </span>
        {counter && <span className="text-xs tabular-nums text-muted-foreground">{counter}</span>}
      </div>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** Chip-style input: Enter or comma adds, Backspace removes the last chip. */
export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  suggestions = [],
  ariaLabel,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  ariaLabel?: string;
}) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const add = (raw: string) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const lower = value.map((v) => v.toLowerCase());
    const next = [...value];
    for (const p of parts) {
      if (!lower.includes(p.toLowerCase())) {
        next.push(p);
        lower.push(p.toLowerCase());
      }
    }
    onChange(next);
    setText("");
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const lowerValue = value.map((v) => v.toLowerCase());
  const matches = suggestions
    .filter((s) => !lowerValue.includes(s.toLowerCase()))
    .filter((s) => !text || s.toLowerCase().includes(text.toLowerCase()))
    .slice(0, 10);

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-input bg-background px-2 py-1.5 transition-shadow",
          focused && "border-ring ring-2 ring-ring/30",
        )}
        onClick={() => ref.current?.focus()}
      >
        {value.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-2.5 pr-1 text-xs font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={(e) => {
                e.stopPropagation();
                remove(i);
              }}
              className="grid h-4 w-4 place-items-center rounded-full hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={ref}
          aria-label={ariaLabel}
          value={text}
          placeholder={value.length ? "" : placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            add(text);
          }}
          onChange={(e) => {
            const v = e.target.value;
            if (v.includes(",")) add(v);
            else setText(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(text);
            } else if (e.key === "Backspace" && !text && value.length) {
              remove(value.length - 1);
            }
          }}
          className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground/70"
        />
      </div>
      {matches.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Suggestions:</span>
          {matches.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => add(s)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-3 w-3" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Editable list of text lines (e.g. experience highlights). */
export function LinesEditor({
  value,
  onChange,
  placeholder = "Describe an achievement or responsibility",
  addLabel = "Add line",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const refs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  useEffect(() => {
    if (focusIndex === null) return;
    refs.current[focusIndex]?.focus();
    setFocusIndex(null);
  }, [focusIndex]);
  const update = (i: number, v: string) => onChange(value.map((x, idx) => (idx === i ? v : x)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    const a = next[i] as string;
    next[i] = next[j] as string;
    next[j] = a;
    onChange(next);
  };
  const insertAt = (i: number) => {
    const next = [...value];
    next.splice(i, 0, "");
    onChange(next);
    setFocusIndex(i);
  };
  return (
    <div className="space-y-2">
      {value.map((line, i) => (
        <div key={i} className="group flex items-start gap-2">
          <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <textarea
            ref={(el) => {
              refs.current[i] = el;
            }}
            rows={2}
            value={line}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                insertAt(i + 1);
              } else if (e.key === "Backspace" && !line && value.length > 0) {
                e.preventDefault();
                onChange(value.filter((_, idx) => idx !== i));
                setFocusIndex(Math.max(0, i - 1));
              }
            }}
            className={cn(inputClass, "min-h-0 resize-y py-2")}
          />
          <div className="flex shrink-0 flex-col opacity-60 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <button
              type="button"
              aria-label="Move up"
              disabled={i === 0}
              onClick={() => move(i, -1)}
              className="grid h-6 w-6 place-items-center rounded-md hover:bg-muted disabled:opacity-30"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Move down"
              disabled={i === value.length - 1}
              onClick={() => move(i, 1)}
              className="grid h-6 w-6 place-items-center rounded-md hover:bg-muted disabled:opacity-30"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            aria-label="Remove line"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="mt-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => insertAt(value.length)}>
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Tip: press Enter for a new line, Shift+Enter for a line break.
        </p>
      )}
    </div>
  );
}

/** Drag-and-drop image picker with live preview. */
export function ImageDrop({
  preview,
  hasCustom,
  onUploaded,
  onReset,
  resetLabel = "Remove image",
  emptyLabel = "Drop an image here or click to browse",
  aspect = "aspect-[16/10]",
  previewClassName,
  onBusyChange,
}: {
  preview: string | null;
  hasCustom: boolean;
  onUploaded: (url: string) => void;
  onReset: () => void;
  resetLabel?: string;
  emptyLabel?: string;
  aspect?: string;
  previewClassName?: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const id = useId();
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [preview]);
  const handle = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    onBusyChange?.(true);
    const url = await uploadImage(file);
    setBusy(false);
    onBusyChange?.(false);
    if (url) {
      onUploaded(url);
      toast.success("Image uploaded — save to publish it.");
    }
  };
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "group relative block cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-primary/60",
          aspect,
          drag && "border-primary bg-primary/5",
        )}
      >
        {preview && !broken ? (
          <img
            src={preview}
            alt="Preview"
            onError={() => setBroken(true)}
            className={cn("h-full w-full object-cover object-top", previewClassName)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
            <ImagePlus className="h-8 w-8" />
            {emptyLabel}
          </div>
        )}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100",
            (busy || drag) && "opacity-100",
          )}
        >
          {busy ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              {drag ? "Drop to upload" : preview ? "Click or drop to replace" : "Choose image"}
            </>
          )}
        </div>
        <input
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            void handle(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {hasCustom && (
        <Button type="button" variant="ghost" size="sm" onClick={onReset} disabled={busy}>
          <RotateCcw className="h-4 w-4" />
          {resetLabel}
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dialogs                                                             */
/* ------------------------------------------------------------------ */

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Small hook that returns a confirm() replacement backed by ConfirmDialog. */
export function useConfirm() {
  const [state, setState] = useState<{
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    destructive?: boolean;
    resolve: (ok: boolean) => void;
  } | null>(null);
  const confirm = (opts: {
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    destructive?: boolean;
  }) => new Promise<boolean>((resolve) => setState({ ...opts, resolve }));
  const close = (ok: boolean) => {
    state?.resolve(ok);
    setState(null);
  };
  const dialog = (
    <ConfirmDialog
      open={!!state}
      onOpenChange={(o) => !o && close(false)}
      title={state?.title ?? ""}
      description={state?.description}
      confirmLabel={state?.confirmLabel ?? "Confirm"}
      destructive={state?.destructive ?? false}
      onConfirm={() => close(true)}
    />
  );
  return { confirm, dialog };
}

/**
 * Modal editor. Closing (X, Esc, backdrop or Cancel) with unsaved changes
 * asks "Discard changes?" with Keep editing / Discard. Cmd/Ctrl+S saves.
 */
export function EditorModal({
  open,
  title,
  description,
  dirty,
  saving,
  canSave = true,
  saveLabel = "Save changes",
  onSave,
  onClose,
  onDelete,
  wide,
  aside,
  children,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  dirty: boolean;
  saving: boolean;
  canSave?: boolean;
  saveLabel?: string;
  onSave: () => void;
  onClose: () => void;
  onDelete?: (() => void) | undefined;
  wide?: boolean;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const [askDiscard, setAskDiscard] = useState(false);
  useBeforeUnload(open && dirty);
  const requestClose = () => {
    if (saving) return;
    if (dirty) setAskDiscard(true);
    else onClose();
  };
  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && requestClose()}>
        <DialogContent
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
              e.preventDefault();
              if (dirty && canSave && !saving) onSave();
            }
          }}
          className={cn(
            "flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden p-0 sm:h-auto sm:max-h-[90vh] sm:rounded-2xl",
            wide ? "sm:max-w-5xl" : "sm:max-w-2xl",
          )}
        >
          <DialogHeader className="border-b border-border px-6 py-4 pr-12 text-left">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="truncate">{title}</span>
              {dirty && (
                <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  Unsaved
                </span>
              )}
            </DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : (
              <DialogDescription className="sr-only">Edit the fields and save.</DialogDescription>
            )}
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {aside ? (
              <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="space-y-5 p-6">{children}</div>
                <aside className="border-t border-border bg-muted/30 p-6 lg:border-l lg:border-t-0">
                  <div className="lg:sticky lg:top-0">{aside}</div>
                </aside>
              </div>
            ) : (
              <div className="space-y-5 p-6">{children}</div>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-border bg-background px-6 py-3">
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onDelete}
                disabled={saving}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
            <span className="ml-auto hidden text-xs text-muted-foreground md:inline">
              {dirty ? "⌘/Ctrl + S to save" : "No changes yet"}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={requestClose}
              disabled={saving}
              className="ml-auto md:ml-2"
            >
              Cancel
            </Button>
            <Button type="button" onClick={onSave} disabled={!dirty || !canSave || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : saveLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={askDiscard}
        onOpenChange={setAskDiscard}
        title="Discard unsaved changes?"
        description="You have edits that haven't been saved. If you leave now, they'll be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        destructive
        onConfirm={() => {
          setAskDiscard(false);
          onClose();
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Layout bits                                                         */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <p className="mt-4 text-base font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Floating bar pinned to the bottom of the viewport. */
export function FloatingBar({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/95 px-4 py-2.5 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-4">
        {children}
      </div>
    </div>
  );
}
