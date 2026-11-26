import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  CheckSquare,
  Eye,
  EyeOff,
  FolderKanban,
  GripVertical,
  ImageOff,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { portfolioQuery, projectImage, type Project } from "@/lib/portfolio";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  EditorModal,
  EmptyState,
  Field,
  FloatingBar,
  ImageDrop,
  TagInput,
  inputClass,
  isSame,
  useConfirm,
} from "./ui";
import { useOrdering, useRefresh } from "./useOrdering";

type Draft = Omit<Project, "id" | "sort_order">;
type Filter = "all" | "live" | "hidden" | "featured";

const BLANK: Draft = {
  title: "",
  description: "",
  category: "Web",
  tags: [],
  url: "",
  image_url: null,
  featured: false,
  active: true,
};

function toDraft(p: Project): Draft {
  const { id: _id, sort_order: _s, ...rest } = p;
  return { ...rest, url: rest.url ?? "" };
}

function validUrl(u: string) {
  if (!u) return true;
  try {
    const url = new URL(u);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ProjectsManager() {
  const { data, isLoading } = useQuery(portfolioQuery);
  const refresh = useRefresh();
  const projects = useMemo(() => data?.projects ?? [], [data?.projects]);
  const order = useOrdering("projects", projects);
  const { confirm, dialog } = useConfirm();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Project | "new" | null>(null);

  const categories = useMemo(
    () => [...new Set(projects.map((p) => p.category).filter(Boolean))].sort(),
    [projects],
  );
  const allTags = useMemo(
    () => [...new Set(projects.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b)),
    [projects],
  );

  const filtering = !!query || filter !== "all" || !!category;
  const visible = order.ordered.filter((p) => {
    if (filter === "live" && !p.active) return false;
    if (filter === "hidden" && p.active) return false;
    if (filter === "featured" && !p.featured) return false;
    if (category && p.category !== category) return false;
    if (query) {
      const q = query.toLowerCase();
      return [p.title, p.description, p.category, ...p.tags].some((s) =>
        s?.toLowerCase().includes(q),
      );
    }
    return true;
  });

  const counts = {
    all: projects.length,
    live: projects.filter((p) => p.active).length,
    hidden: projects.filter((p) => !p.active).length,
    featured: projects.filter((p) => p.featured).length,
  };

  const update = async (ids: string[], patch: Partial<Project>, message: string) => {
    setBusy(true);
    const { error } = await supabase.from("projects").update(patch).in("id", ids);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success(message);
    refresh();
    return true;
  };

  const remove = async (ids: string[]) => {
    const one = ids.length === 1 ? projects.find((p) => p.id === ids[0]) : null;
    const ok = await confirm({
      title: one ? `Delete “${one.title}”?` : `Delete ${ids.length} projects?`,
      description:
        "This permanently removes the project from your portfolio and cannot be undone. Tip: hide it instead if you might want it back.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return false;
    setBusy(true);
    const { error } = await supabase.from("projects").delete().in("id", ids);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success(ids.length === 1 ? "Project deleted" : `${ids.length} projects deleted`);
    setSelected((s) => s.filter((id) => !ids.includes(id)));
    refresh();
    return true;
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const exitSelect = () => {
    setSelecting(false);
    setSelected([]);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, description or tag…"
            aria-label="Search projects"
            className={cn(inputClass, "pl-9 pr-9")}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={selecting ? "secondary" : "outline"}
            onClick={() => (selecting ? exitSelect() : setSelecting(true))}
            disabled={!projects.length}
          >
            <CheckSquare className="h-4 w-4" />
            {selecting ? "Done" : "Select"}
          </Button>
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" />
            Add project
          </Button>
        </div>
      </div>

      {/* Filters */}
      {projects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-muted p-1" role="tablist" aria-label="Status">
            {(
              [
                ["all", "All"],
                ["live", "Live"],
                ["hidden", "Hidden"],
                ["featured", "Featured"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
                  filter === key && "bg-background text-foreground shadow-sm",
                )}
              >
                {label}
                <span className="ml-1.5 text-xs tabular-nums opacity-60">{counts[key]}</span>
              </button>
            ))}
          </div>
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(category === c ? null : c)}
                  className={cn(
                    "rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:border-primary",
                    category === c && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!filtering && projects.length > 1 && (
        <p className="text-xs text-muted-foreground">
          Drag cards to reorder how they appear on your portfolio, then save the new order.
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : !projects.length ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Add your first project. If you leave the image empty, a screenshot of the live URL is used automatically."
          action={
            <Button onClick={() => setEditing("new")}>
              <Plus className="h-4 w-4" />
              Add project
            </Button>
          }
        />
      ) : !visible.length ? (
        <EmptyState
          icon={Search}
          title="No matching projects"
          description="Try a different search or filter."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setFilter("all");
                setCategory(null);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => {
            const index = order.ordered.findIndex((o) => o.id === p.id);
            const isSelected = selected.includes(p.id);
            return (
              <ProjectCard
                key={p.id}
                p={p}
                position={index + 1}
                selecting={selecting}
                selected={isSelected}
                dragging={order.dragId === p.id}
                draggable={!filtering && !selecting}
                dragProps={order.dragProps(p.id, !filtering && !selecting)}
                busy={busy}
                isFirst={index === 0}
                isLast={index === order.ordered.length - 1}
                onOpen={() => (selecting ? toggleSelect(p.id) : setEditing(p))}
                onToggleSelect={() => toggleSelect(p.id)}
                onToggleActive={(active) =>
                  update([p.id], { active }, active ? "Project is now live" : "Project hidden")
                }
                onToggleFeatured={() =>
                  update(
                    [p.id],
                    { featured: !p.featured },
                    p.featured ? "Removed from featured" : "Marked as featured",
                  )
                }
                onMove={(d) => order.move(p.id, d)}
                onDelete={() => void remove([p.id])}
              />
            );
          })}
          {!filtering && !selecting && (
            <button
              type="button"
              onClick={() => setEditing("new")}
              className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-muted">
                <Plus className="h-6 w-6" />
              </span>
              Add project
            </button>
          )}
        </div>
      )}

      {/* Floating bars */}
      {selecting ? (
        <FloatingBar>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={visible.length > 0 && visible.every((p) => selected.includes(p.id))}
              onChange={(e) => setSelected(e.target.checked ? visible.map((p) => p.id) : [])}
            />
            {selected.length} selected
          </label>
          <span className="mx-1 h-5 w-px bg-border" />
          <Button
            size="sm"
            variant="outline"
            disabled={busy || !selected.length}
            onClick={async () => {
              if (await update(selected, { active: true }, "Selected projects are live"))
                setSelected([]);
            }}
          >
            <Eye className="h-4 w-4" />
            Show
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || !selected.length}
            onClick={async () => {
              if (await update(selected, { active: false }, "Selected projects hidden"))
                setSelected([]);
            }}
          >
            <EyeOff className="h-4 w-4" />
            Hide
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={busy || !selected.length}
            onClick={() => void remove(selected)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={exitSelect}>
            Cancel
          </Button>
        </FloatingBar>
      ) : order.dirty ? (
        <FloatingBar>
          <span className="text-sm font-medium">Project order changed</span>
          <Button size="sm" variant="ghost" onClick={order.reset} disabled={order.saving}>
            Reset
          </Button>
          <Button size="sm" onClick={order.save} disabled={order.saving}>
            {order.saving ? "Saving…" : "Save order"}
          </Button>
        </FloatingBar>
      ) : null}

      {editing && (
        <ProjectModal
          key={editing === "new" ? "new" : editing.id}
          project={editing === "new" ? null : editing}
          nextSortOrder={(projects.at(-1)?.sort_order ?? 0) + 1}
          categories={categories}
          tagSuggestions={allTags}
          onClose={() => setEditing(null)}
          onDelete={
            editing === "new"
              ? undefined
              : async () => {
                  if (await remove([editing.id])) setEditing(null);
                }
          }
        />
      )}
      {dialog}
    </div>
  );
}

function ProjectCard({
  p,
  position,
  selecting,
  selected,
  dragging,
  draggable,
  dragProps,
  busy,
  isFirst,
  isLast,
  onOpen,
  onToggleSelect,
  onToggleActive,
  onToggleFeatured,
  onMove,
  onDelete,
}: {
  p: Project;
  position: number;
  selecting: boolean;
  selected: boolean;
  dragging: boolean;
  draggable: boolean;
  dragProps: object;
  busy: boolean;
  isFirst: boolean;
  isLast: boolean;
  onOpen: () => void;
  onToggleSelect: () => void;
  onToggleActive: (active: boolean) => void;
  onToggleFeatured: () => void;
  onMove: (d: -1 | 1) => void;
  onDelete: () => void;
}) {
  const img = projectImage(p);
  const [broken, setBroken] = useState(false);
  return (
    <article
      {...dragProps}
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lg",
        !p.active && "opacity-75",
        selected && "ring-2 ring-primary",
        dragging && "scale-[0.98] opacity-50 ring-2 ring-primary/50",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="relative block aspect-[16/10] overflow-hidden bg-secondary text-left"
        aria-label={selecting ? `Select ${p.title}` : `Edit ${p.title}`}
      >
        {img && !broken ? (
          <img
            src={img}
            alt=""
            loading="lazy"
            onError={() => setBroken(true)}
            className={cn(
              "h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105",
              !p.active && "grayscale",
            )}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
            <ImageOff className="h-6 w-6" />
            No image or live URL
          </div>
        )}
        {!selecting && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
              <Pencil className="h-4 w-4" />
              Edit
            </span>
          </span>
        )}
      </button>

      {/* Overlays */}
      <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur",
              p.active ? "bg-emerald-500/90 text-white" : "bg-zinc-800/85 text-white",
            )}
          >
            {p.active ? "Live" : "Hidden"}
          </span>
          {p.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-[11px] font-semibold text-black">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}
        </div>
        {selecting ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`Select ${p.title}`}
            className="pointer-events-auto h-5 w-5 cursor-pointer accent-primary"
          />
        ) : (
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
            #{position}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-2">
          {draggable && (
            <span
              className="-ml-1 mt-0.5 cursor-grab text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-primary">{p.category || "Uncategorised"}</p>
            <h3 className="mt-0.5 truncate text-base font-semibold tracking-tight">
              {p.title || "Untitled project"}
            </h3>
          </div>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {p.description || <span className="italic">No description yet</span>}
        </p>
        {p.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {p.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground"
              >
                {t}
              </span>
            ))}
            {p.tags.length > 4 && (
              <span className="rounded-full px-1.5 py-0.5 text-[11px] text-muted-foreground">
                +{p.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {!selecting && (
          <div className="mt-auto pt-3">
            <div className="flex items-center gap-2 border-t border-border pt-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
                <Switch
                  checked={p.active}
                  disabled={busy}
                  onCheckedChange={onToggleActive}
                  aria-label={p.active ? `Hide ${p.title}` : `Show ${p.title}`}
                />
                {p.active ? "Visible" : "Hidden"}
              </label>
              <div className="ml-auto flex items-center gap-1">
                <Button size="sm" variant="secondary" onClick={onOpen}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onSelect={onToggleFeatured}>
                      <Star className="h-4 w-4" />
                      {p.featured ? "Unmark featured" : "Mark as featured"}
                    </DropdownMenuItem>
                    {p.url && (
                      <DropdownMenuItem asChild>
                        <a href={p.url} target="_blank" rel="noreferrer">
                          <ArrowUpRight className="h-4 w-4" />
                          Open live site
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={isFirst} onSelect={() => onMove(-1)}>
                      <ArrowUp className="h-4 w-4" />
                      Move earlier
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={isLast} onSelect={() => onMove(1)}>
                      <ArrowDown className="h-4 w-4" />
                      Move later
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={onDelete}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function ProjectModal({
  project,
  nextSortOrder,
  categories,
  tagSuggestions,
  onClose,
  onDelete,
}: {
  project: Project | null;
  nextSortOrder: number;
  categories: string[];
  tagSuggestions: string[];
  onClose: () => void;
  onDelete: (() => void) | undefined;
}) {
  const refresh = useRefresh();
  const initial = useMemo(() => (project ? toDraft(project) : BLANK), [project]);
  const [d, setD] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [touched, setTouched] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((cur) => ({ ...cur, [k]: v }));

  const url = d.url?.trim() ?? "";
  const titleError = touched && !d.title.trim() ? "Give your project a title." : null;
  const urlError = url && !validUrl(url) ? "Enter a full URL starting with https://" : null;
  const dirty = !isSame(d, initial);
  const canSave = !!d.title.trim() && !urlError && !uploading;
  const preview = projectImage({ image_url: d.image_url, url: validUrl(url) ? url : null });

  const save = async () => {
    setTouched(true);
    if (!canSave) return;
    setSaving(true);
    const payload = {
      ...d,
      title: d.title.trim(),
      category: d.category.trim(),
      description: d.description.trim(),
      url: url || null,
    };
    const { error } = project
      ? await supabase.from("projects").update(payload).eq("id", project.id)
      : await supabase.from("projects").insert({ ...payload, sort_order: nextSortOrder });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(project ? "Project saved" : "Project added");
    refresh();
    onClose();
  };

  const descLen = d.description.length;

  return (
    <EditorModal
      open
      wide
      title={project ? `Edit ${project.title || "project"}` : "Add a new project"}
      description={
        project
          ? "Update the details below. Changes go live as soon as you save."
          : "Fill in the details. Only the title is required."
      }
      dirty={dirty}
      saving={saving}
      canSave={canSave}
      saveLabel={project ? "Save changes" : "Add project"}
      onSave={save}
      onClose={onClose}
      onDelete={onDelete}
      aside={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Live preview
          </p>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
            <div className="relative aspect-[16/10] bg-secondary">
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-cover object-top" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
              {d.featured && (
                <span className="absolute left-2 top-2 rounded-full bg-glass px-2 py-0.5 text-[10px] font-semibold backdrop-blur">
                  Featured
                </span>
              )}
            </div>
            <div className="p-4">
              <p className="text-xs font-medium text-primary">{d.category || "Category"}</p>
              <p className="mt-0.5 font-semibold">{d.title || "Project title"}</p>
              <p className="mt-1.5 line-clamp-3 text-xs text-muted-foreground">
                {d.description || "Your description will appear here."}
              </p>
              {d.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {d.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {!d.active && (
            <p className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              <EyeOff className="h-3.5 w-3.5" />
              Hidden — visitors won't see this project.
            </p>
          )}
        </div>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" required error={titleError} className="sm:col-span-2">
          <input
            autoFocus={!project}
            className={inputClass}
            value={d.title}
            aria-invalid={!!titleError}
            placeholder="e.g. Analytics dashboard"
            onBlur={() => setTouched(true)}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>
        <Field label="Category" hint="Pick an existing one or type a new one.">
          <input
            className={inputClass}
            list="project-categories"
            value={d.category}
            placeholder="Web"
            onChange={(e) => set("category", e.target.value)}
          />
          <datalist id="project-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field
          label="Live URL"
          error={urlError}
          hint="Used for the Visit button and the auto screenshot."
        >
          <div className="relative">
            <input
              className={cn(inputClass, url && validUrl(url) && "pr-10")}
              type="url"
              inputMode="url"
              value={d.url ?? ""}
              aria-invalid={!!urlError}
              placeholder="https://example.com"
              onChange={(e) => set("url", e.target.value)}
            />
            {url && validUrl(url) && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label="Open URL in new tab"
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </Field>
        <Field
          label="Description"
          className="sm:col-span-2"
          counter={`${descLen} chars`}
          hint={
            descLen > 125
              ? "Long descriptions show a “View more” link on the portfolio card."
              : "A sentence or two about what it is and your role."
          }
        >
          <textarea
            className={cn(inputClass, "min-h-28 resize-y")}
            value={d.description}
            placeholder="What does it do, what did you build, what was the impact?"
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <Field label="Tags" className="sm:col-span-2" hint="Press Enter or comma to add.">
          <TagInput
            ariaLabel="Tags"
            value={d.tags}
            onChange={(v) => set("tags", v)}
            suggestions={tagSuggestions}
            placeholder="React, TypeScript…"
          />
        </Field>
        <Field
          label="Cover image"
          className="sm:col-span-2"
          hint={
            d.image_url
              ? "Using your uploaded image."
              : url
                ? "No upload — a screenshot of the live URL is used automatically."
                : "Upload an image, or add a live URL for an automatic screenshot."
          }
        >
          <ImageDrop
            preview={preview}
            hasCustom={!!d.image_url}
            onUploaded={(u) => set("image_url", u)}
            onReset={() => set("image_url", null)}
            onBusyChange={setUploading}
            resetLabel="Use auto screenshot instead"
          />
        </Field>
        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
          <ToggleRow
            label="Visible on portfolio"
            description="Turn off to hide without deleting."
            checked={d.active}
            onChange={(v) => set("active", v)}
          />
          <ToggleRow
            label="Featured"
            description="Highlight this project with a badge."
            checked={d.featured}
            onChange={(v) => set("featured", v)}
          />
        </div>
      </div>
    </EditorModal>
  );
}

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  );
}
