import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BriefcaseBusiness,
  FolderKanban,
  GraduationCap,
  LogOut,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { portfolioQuery, projectImage, type Profile } from "@/lib/portfolio";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import portrait from "@/assets/kailash-portrait.png";

export const Route = createFileRoute("/admin-user")({
  head: () => ({
    meta: [
      { title: "Admin - Kailash Portfolio" },
      { name: "description", content: "Manage portfolio content." },
      { property: "og:title", content: "Admin - Kailash Portfolio" },
      { property: "og:description", content: "Manage portfolio content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const input =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const btn =
  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-transform active:scale-95";

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return setIsAdmin(null);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-glass backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-primary">
            <ArrowLeft className="h-4 w-4" />
            Portfolio
          </Link>
          <span className="font-semibold">Portfolio studio</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session && (
              <Button
                variant="ghost"
                size="icon"
                title="Sign out"
                aria-label="Sign out"
                onClick={() => supabase.auth.signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        {!ready ? null : !session ? (
          <AuthCard />
        ) : isAdmin === null ? (
          <p className="text-muted-foreground">Checking access…</p>
        ) : !isAdmin ? (
          <div className="rounded-3xl bg-card p-8 text-center shadow-card">
            This account doesn't have admin access.
          </div>
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
}

function AuthCard() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}admin-user`,
            },
          });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (mode === "up" && !data.session) toast.success("Check your email to confirm your account.");
  };
  return (
    <form
      onSubmit={go}
      className="mx-auto mt-10 max-w-sm space-y-3 rounded-3xl bg-card p-7 shadow-card"
    >
      <h1 className="text-2xl font-bold tracking-tight">
        {mode === "in" ? "Sign in" : "Create admin account"}
      </h1>
      <p className="text-sm text-muted-foreground">
        The first account created becomes the portfolio owner.
      </p>
      <input
        className={input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className={input}
        type="password"
        placeholder="Password"
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        disabled={busy}
        className={`${btn} w-full justify-center bg-primary text-primary-foreground`}
      >
        {busy ? "…" : mode === "in" ? "Sign in" : "Sign up"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "in" ? "up" : "in")}
        className="w-full text-center text-sm text-primary"
      >
        {mode === "in" ? "First time? Create account" : "Have an account? Sign in"}
      </button>
    </form>
  );
}

const TABS = [
  { label: "Profile", icon: UserRound, key: "profile" },
  { label: "Projects", icon: FolderKanban, key: "projects" },
  { label: "Skills", icon: Sparkles, key: "skills" },
  { label: "Experience", icon: BriefcaseBusiness, key: "experiences" },
  { label: "Education", icon: GraduationCap, key: "education" },
] as const;
type AdminTab = (typeof TABS)[number]["label"];

function Dashboard() {
  const [tab, setTab] = useState<AdminTab>("Profile");
  const { data } = useQuery(portfolioQuery);
  return (
    <div className="grid gap-8 md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="min-w-0 md:sticky md:top-24 md:self-start">
        <div className="mb-5 hidden px-3 md:block">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Workspace</p>
          <p className="mt-1 text-lg font-semibold">Content</p>
        </div>
        <nav
          aria-label="Admin sections"
          className="flex gap-1 overflow-x-auto border-b border-border pb-3 md:flex-col md:overflow-visible md:border-b-0 md:pb-0"
        >
          {TABS.map(({ label, icon: Icon, key }) => (
            <Button
              key={label}
              type="button"
              variant="ghost"
              onClick={() => setTab(label)}
              aria-current={tab === label ? "page" : undefined}
              className={`h-11 shrink-0 justify-start gap-3 rounded-md px-3 text-sm md:w-full ${tab === label ? "bg-primary/10 font-semibold text-primary hover:bg-primary/10 hover:text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {key !== "profile" && (
                <span className="ml-auto hidden text-xs font-normal opacity-70 md:inline">
                  {data?.[key]?.length ?? 0}
                </span>
              )}
            </Button>
          ))}
        </nav>
        <div className="mt-8 hidden border-t border-border px-3 pt-5 text-xs text-muted-foreground md:block">
          {data?.profile?.name}
        </div>
      </aside>
      <section className="min-w-0">
        <div className="mb-6 border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase text-primary">Portfolio studio</p>
          <h1 className="mt-1 text-3xl font-semibold">{tab}</h1>
        </div>
        {tab === "Profile" && <ProfileEditor />}
        {tab === "Projects" && (
          <ListEditor
            table="projects"
            blank={{
              title: "New project",
              description: "",
              category: "Web",
              tags: [],
              url: "",
              image_url: null,
              featured: false,
              active: true,
            }}
            fields={[
              ["title", "Title", "text"],
              ["category", "Category", "text"],
              ["url", "Live URL", "text"],
              ["description", "Description", "textarea"],
              ["tags", "Tags (comma separated)", "list"],
              ["image_url", "Image", "image"],
              ["featured", "Featured", "bool"],
            ]}
          />
        )}
        {tab === "Skills" && (
          <ListEditor
            table="skills"
            blank={{ category: "New group", items: [] }}
            fields={[
              ["category", "Group", "text"],
              ["items", "Skills (comma separated)", "list"],
            ]}
          />
        )}
        {tab === "Experience" && (
          <ListEditor
            table="experiences"
            blank={{ role: "Role", company: "Company", period: "", location: "", bullets: [] }}
            fields={[
              ["role", "Role", "text"],
              ["company", "Company", "text"],
              ["period", "Period", "text"],
              ["location", "Location", "text"],
              ["bullets", "Highlights (one per line)", "lines"],
            ]}
          />
        )}
        {tab === "Education" && (
          <ListEditor
            table="education"
            blank={{ degree: "Degree", school: "", year: "" }}
            fields={[
              ["degree", "Degree", "text"],
              ["school", "School", "text"],
              ["year", "Year", "text"],
            ]}
          />
        )}
      </section>
    </div>
  );
}

async function uploadImage(file: File): Promise<string | null> {
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

function useRefresh() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["portfolio"] });
    qc.invalidateQueries({ queryKey: ["profile"] });
  };
}

function ProfileEditor() {
  const { data } = useQuery(portfolioQuery);
  const refresh = useRefresh();
  const [p, setP] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (data?.profile) setP(data.profile);
  }, [data?.profile]);
  if (!p) return null;
  const f = (k: keyof Profile, label: string, area = false) => (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {area ? (
        <textarea
          className={`${input} min-h-28`}
          value={(p[k] as string) ?? ""}
          onChange={(e) => setP({ ...p, [k]: e.target.value })}
        />
      ) : (
        <input
          className={input}
          value={(p[k] as string) ?? ""}
          onChange={(e) => setP({ ...p, [k]: e.target.value })}
        />
      )}
    </label>
  );
  const save = async () => {
    const { error } = await supabase
      .from("profile")
      .update({ ...p, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved");
    refresh();
  };
  return (
    <div className="space-y-4 rounded-3xl bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-center gap-5 border-b border-border pb-5">
        <img
          src={p.avatar_url || portrait}
          alt="Current home portrait"
          className="h-24 w-24 rounded-full object-cover object-top"
        />
        <div className="space-y-2">
          <p className="text-sm font-semibold">Home portrait</p>
          <p className="text-xs text-muted-foreground">
            Your shared-link preview currently uses the original portrait. Changing this home image
            does not update the shared preview automatically.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Choose image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  const url = await uploadImage(file);
                  if (url) setP((current) => (current ? { ...current, avatar_url: url } : current));
                  setUploading(false);
                  e.target.value = "";
                }}
              />
            </label>
            {p.avatar_url && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setP({ ...p, avatar_url: null })}
              >
                Use original
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Save profile to make your change live.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {f("name", "Name")}
        {f("title", "Title")}
        {f("location", "Location")}
        {f("email", "Email")}
        {f("phone", "Phone (display)")}
        {f("whatsapp", "WhatsApp number (digits, e.g. 971526635447)")}
        {f("linkedin", "LinkedIn URL")}
        {f("github", "GitHub URL")}
      </div>
      {f("tagline", "Headline")}
      {f("summary", "About / summary", true)}
      <Button onClick={save}>
        <Save className="h-4 w-4" />
        Save profile
      </Button>
    </div>
  );
}

type FieldType = "text" | "textarea" | "list" | "lines" | "bool" | "image";
type Table = "projects" | "skills" | "experiences" | "education";
type Row = Record<string, unknown> & { id: string; sort_order: number };

function ListEditor({
  table,
  blank,
  fields,
}: {
  table: Table;
  blank: Record<string, unknown>;
  fields: [string, string, FieldType][];
}) {
  const { data } = useQuery(portfolioQuery);
  const refresh = useRefresh();
  const rows = (data?.[table] ?? []) as unknown as Row[];
  const [selected, setSelected] = useState<string[]>([]);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setOrderedIds(rows.map((r) => r.id));
  }, [data, table]);
  const orderedRows =
    table === "projects"
      ? orderedIds
          .map((id) => rows.find((r) => r.id === id))
          .filter((r): r is Row => !!r)
          .concat(rows.filter((r) => !orderedIds.includes(r.id)))
      : rows;
  const shift = (id: string, direction: number) => {
    const ids = orderedRows.map((r) => r.id);
    const at = ids.indexOf(id);
    const next = at + direction;
    if (next < 0 || next >= ids.length) return;
    const current = ids[at];
    const neighbor = ids[next];
    if (!current || !neighbor) return;
    ids[at] = neighbor;
    ids[next] = current;
    setOrderedIds(ids);
  };
  const saveOrder = async () => {
    setBusy(true);
    const results = await Promise.all(
      orderedRows.map((r, index) =>
        supabase
          .from("projects")
          .update({ sort_order: index + 1 })
          .eq("id", r.id),
      ),
    );
    setBusy(false);
    if (results.some(({ error }) => error)) {
      toast.error("Some positions could not be saved. Please try again.");
      return;
    }
    toast.success("Project order saved");
    refresh();
  };
  const bulkVisibility = async (active: boolean) => {
    setBusy(true);
    const { error } = await supabase.from("projects").update({ active }).in("id", selected);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(active ? "Projects activated" : "Projects deactivated");
    setSelected([]);
    refresh();
  };
  const bulkDelete = async () => {
    if (
      !confirm(
        `Permanently delete ${selected.length} selected project${selected.length === 1 ? "" : "s"}?`,
      )
    )
      return;
    setBusy(true);
    const { error } = await supabase.from("projects").delete().in("id", selected);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Selected projects deleted");
    setSelected([]);
    refresh();
  };
  const toggleActive = async (id: string, active: boolean) => {
    setBusy(true);
    const { error } = await supabase.from("projects").update({ active }).eq("id", id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(active ? "Project activated" : "Project deactivated");
    refresh();
  };

  const add = async () => {
    const sort_order = (rows.at(-1)?.sort_order ?? 0) + 1;
    const { error } = await supabase.from(table).insert({ ...blank, sort_order } as never);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
  };

  return (
    <div className="space-y-4">
      {table === "projects" && rows.length > 0 && (
        <div className="space-y-3 border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className="mr-auto flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                aria-label="Select all projects"
                className="h-4 w-4 accent-primary"
                checked={selected.length === rows.length}
                onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])}
              />
              Select all <span className="text-muted-foreground">({selected.length} selected)</span>
            </label>
            <Button
              size="sm"
              variant="outline"
              disabled={busy || !orderedRows.some((r, i) => r.id !== rows[i]?.id)}
              onClick={saveOrder}
            >
              <Save className="h-4 w-4" />
              Save order
            </Button>
          </div>
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Bulk project actions">
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => bulkVisibility(true)}
              >
                Activate selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => bulkVisibility(false)}
              >
                Deactivate selected
              </Button>
              <Button size="sm" variant="destructive" disabled={busy} onClick={bulkDelete}>
                <Trash2 className="h-4 w-4" />
                Delete selected
              </Button>
            </div>
          )}
        </div>
      )}
      {orderedRows.map((r, index) => (
        <div key={r.id} className="min-w-0">
          {table === "projects" && (
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-secondary px-3 py-2">
              <label className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-primary"
                  aria-label={`Select ${r["title"]}`}
                  checked={selected.includes(r.id)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? [...selected, r.id] : selected.filter((id) => id !== r.id),
                    )
                  }
                />
                <span className="truncate">
                  {index + 1}. {String(r["title"])}
                </span>
                {r["active"] === false && (
                  <span className="shrink-0 text-xs text-muted-foreground">Inactive</span>
                )}
              </label>
              <div className="flex shrink-0 items-center gap-1">
                <Switch
                  checked={r["active"] !== false}
                  disabled={busy}
                  onCheckedChange={(checked) => toggleActive(r.id, checked)}
                  aria-label={`${r["active"] === false ? "Activate" : "Deactivate"} ${r["title"]}`}
                  title={r["active"] === false ? "Activate project" : "Deactivate project"}
                  className="mr-2"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  aria-label={`Move ${r["title"]} up`}
                  title="Move up"
                  disabled={index === 0 || busy}
                  onClick={() => shift(r.id, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  aria-label={`Move ${r["title"]} down`}
                  title="Move down"
                  disabled={index === orderedRows.length - 1 || busy}
                  onClick={() => shift(r.id, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          <RowCard table={table} row={r} fields={fields} onDone={refresh} />
        </div>
      ))}
      <Button onClick={add}>
        <Plus className="h-4 w-4" />
        Add {table === "projects" ? "project" : "item"}
      </Button>
    </div>
  );
}

function RowCard({
  table,
  row,
  fields,
  onDone,
}: {
  table: Table;
  row: Row;
  fields: [string, string, FieldType][];
  onDone: () => void;
}) {
  const [r, setR] = useState<Row>(row);
  useEffect(() => setR(row), [row]);
  const set = (k: string, v: unknown) => setR({ ...r, [k]: v });

  const save = async () => {
    const { id, ...rest } = r;
    const { error } = await supabase
      .from(table)
      .update(rest as never)
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saved");
    onDone();
  };
  const del = async () => {
    if (!confirm("Delete this item?")) return undefined;
    const { error } = await supabase.from(table).delete().eq("id", r.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    onDone();
  };

  return (
    <div className="grid gap-3 rounded-3xl bg-card p-5 shadow-card sm:grid-cols-2">
      {fields.map(([k, label, type]) => {
        const v = r[k];
        const wide = type === "textarea" || type === "lines" || type === "image";
        return (
          <label key={k} className={`block space-y-1 ${wide ? "sm:col-span-2" : ""}`}>
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            {type === "text" && (
              <input
                className={input}
                value={(v as string) ?? ""}
                onChange={(e) => set(k, e.target.value)}
              />
            )}
            {type === "textarea" && (
              <textarea
                className={`${input} min-h-20`}
                value={(v as string) ?? ""}
                onChange={(e) => set(k, e.target.value)}
              />
            )}
            {type === "list" && (
              <input
                className={input}
                defaultValue={((v as string[]) ?? []).join(", ")}
                onBlur={(e) =>
                  set(
                    k,
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
              />
            )}
            {type === "lines" && (
              <textarea
                className={`${input} min-h-28`}
                defaultValue={((v as string[]) ?? []).join("\n")}
                onBlur={(e) =>
                  set(
                    k,
                    e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
              />
            )}
            {type === "bool" && (
              <Switch
                checked={!!v}
                onCheckedChange={(checked) => set(k, checked)}
                aria-label={label}
              />
            )}
            {type === "image" && (
              <div className="flex items-center gap-3">
                {(() => {
                  const image = projectImage({
                    image_url: v as string | null,
                    url: (r["url"] as string) ?? null,
                  });
                  return image ? (
                    <img
                      src={image}
                      alt=""
                      className="h-16 w-28 rounded-md object-cover object-top"
                    />
                  ) : null;
                })()}
                <span className={`${btn} cursor-pointer bg-secondary`}>
                  <Upload className="h-4 w-4" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadImage(file);
                      if (url) set(k, url);
                    }}
                  />
                </span>
                {v ? (
                  <button
                    type="button"
                    onClick={() => set(k, null)}
                    className="text-xs text-muted-foreground"
                  >
                    Use auto screenshot
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Auto screenshot from live URL
                  </span>
                )}
              </div>
            )}
          </label>
        );
      })}
      <div className="flex items-center gap-2 sm:col-span-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Order
          <input
            type="number"
            className={`${input} w-20`}
            value={r.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value))}
          />
        </label>
        <div className="ml-auto flex gap-2">
          <Button
            onClick={del}
            variant="ghost"
            size="icon"
            title="Delete item"
            aria-label="Delete item"
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button onClick={save}>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
