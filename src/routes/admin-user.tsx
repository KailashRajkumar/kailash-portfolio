import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { ArrowLeft, LogOut, Plus, Save, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { portfolioQuery, projectImage, type Profile } from "@/lib/portfolio";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/admin-user")({
  head: () => ({
    meta: [
      { title: "Admin — Kailash Portfolio" },
      { name: "description", content: "Manage portfolio content." },
      { property: "og:title", content: "Admin — Kailash Portfolio" },
      { property: "og:description", content: "Manage portfolio content." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const input = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const btn = "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-transform active:scale-95";

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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-primary"><ArrowLeft className="h-4 w-4" />Portfolio</Link>
          <span className="font-semibold">Admin</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session && (
              <button aria-label="Sign out" onClick={() => supabase.auth.signOut()} className="rounded-full p-2 hover:bg-secondary"><LogOut className="h-4 w-4" /></button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">
        {!ready ? null : !session ? (
          <AuthCard />
        ) : isAdmin === null ? (
          <p className="text-muted-foreground">Checking access…</p>
        ) : !isAdmin ? (
          <div className="rounded-3xl bg-card p-8 text-center shadow-card">This account doesn't have admin access.</div>
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
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin-user` } });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (mode === "up" && !data.session) toast.success("Check your email to confirm your account.");
  };
  return (
    <form onSubmit={go} className="mx-auto mt-10 max-w-sm space-y-3 rounded-3xl bg-card p-7 shadow-card">
      <h1 className="text-2xl font-bold tracking-tight">{mode === "in" ? "Sign in" : "Create admin account"}</h1>
      <p className="text-sm text-muted-foreground">The first account created becomes the portfolio owner.</p>
      <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className={input} type="password" placeholder="Password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button disabled={busy} className={`${btn} w-full justify-center bg-primary text-primary-foreground`}>{busy ? "…" : mode === "in" ? "Sign in" : "Sign up"}</button>
      <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-center text-sm text-primary">
        {mode === "in" ? "First time? Create account" : "Have an account? Sign in"}
      </button>
    </form>
  );
}

const TABS = ["Profile", "Projects", "Skills", "Experience", "Education"] as const;

function Dashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profile");
  return (
    <div>
      <div className="mb-6 inline-flex flex-wrap gap-1 rounded-full bg-secondary p-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${tab === t ? "bg-card shadow-card" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab === "Profile" && <ProfileEditor />}
      {tab === "Projects" && (
        <ListEditor
          table="projects"
          blank={{ title: "New project", description: "", category: "Web", tags: [], url: "", image_url: null, featured: false }}
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
        <ListEditor table="skills" blank={{ category: "New group", items: [] }} fields={[["category", "Group", "text"], ["items", "Skills (comma separated)", "list"]]} />
      )}
      {tab === "Experience" && (
        <ListEditor
          table="experiences"
          blank={{ role: "Role", company: "Company", period: "", location: "", bullets: [] }}
          fields={[["role", "Role", "text"], ["company", "Company", "text"], ["period", "Period", "text"], ["location", "Location", "text"], ["bullets", "Highlights (one per line)", "lines"]]}
        />
      )}
      {tab === "Education" && (
        <ListEditor table="education" blank={{ degree: "Degree", school: "", year: "" }} fields={[["degree", "Degree", "text"], ["school", "School", "text"], ["year", "Year", "text"]]} />
      )}
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
  const { data } = await supabase.storage.from("portfolio").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  return data?.signedUrl ?? null;
}

function useRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["portfolio"] });
}

function ProfileEditor() {
  const { data } = useQuery(portfolioQuery);
  const refresh = useRefresh();
  const [p, setP] = useState<Profile | null>(null);
  useEffect(() => { if (data?.profile) setP(data.profile); }, [data?.profile]);
  if (!p) return null;
  const f = (k: keyof Profile, label: string, area = false) => (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {area ? (
        <textarea className={`${input} min-h-28`} value={(p[k] as string) ?? ""} onChange={(e) => setP({ ...p, [k]: e.target.value })} />
      ) : (
        <input className={input} value={(p[k] as string) ?? ""} onChange={(e) => setP({ ...p, [k]: e.target.value })} />
      )}
    </label>
  );
  const save = async () => {
    const { error } = await supabase.from("profile").update({ ...p, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
    refresh();
  };
  return (
    <div className="space-y-4 rounded-3xl bg-card p-6 shadow-card">
      <div className="grid gap-4 sm:grid-cols-2">
        {f("name", "Name")}{f("title", "Title")}{f("location", "Location")}{f("email", "Email")}
        {f("phone", "Phone (display)")}{f("whatsapp", "WhatsApp number (digits, e.g. 971526635447)")}
        {f("linkedin", "LinkedIn URL")}{f("github", "GitHub URL")}
      </div>
      {f("tagline", "Headline")}
      {f("summary", "About / summary", true)}
      <button onClick={save} className={`${btn} bg-primary text-primary-foreground`}><Save className="h-4 w-4" />Save profile</button>
    </div>
  );
}

type FieldType = "text" | "textarea" | "list" | "lines" | "bool" | "image";
type Table = "projects" | "skills" | "experiences" | "education";
type Row = Record<string, unknown> & { id: string; sort_order: number };

function ListEditor({ table, blank, fields }: { table: Table; blank: Record<string, unknown>; fields: [string, string, FieldType][] }) {
  const { data } = useQuery(portfolioQuery);
  const refresh = useRefresh();
  const rows = ((data?.[table] ?? []) as unknown) as Row[];

  const add = async () => {
    const sort_order = (rows.at(-1)?.sort_order ?? 0) + 1;
    const { error } = await supabase.from(table).insert({ ...blank, sort_order } as never);
    if (error) { toast.error(error.message); return; }
    refresh();
  };

  return (
    <div className="space-y-4">
      {rows.map((r) => <RowCard key={r.id} table={table} row={r} fields={fields} onDone={refresh} />)}
      <button onClick={add} className={`${btn} bg-foreground text-background`}><Plus className="h-4 w-4" />Add</button>
    </div>
  );
}

function RowCard({ table, row, fields, onDone }: { table: Table; row: Row; fields: [string, string, FieldType][]; onDone: () => void }) {
  const [r, setR] = useState<Row>(row);
  useEffect(() => setR(row), [row]);
  const set = (k: string, v: unknown) => setR({ ...r, [k]: v });

  const save = async () => {
    const { id, ...rest } = r;
    const { error } = await supabase.from(table).update(rest as never).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    onDone();
  };
  const del = async () => {
    if (!confirm("Delete this item?")) return undefined;
    const { error } = await supabase.from(table).delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
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
            {type === "text" && <input className={input} value={(v as string) ?? ""} onChange={(e) => set(k, e.target.value)} />}
            {type === "textarea" && <textarea className={`${input} min-h-20`} value={(v as string) ?? ""} onChange={(e) => set(k, e.target.value)} />}
            {type === "list" && (
              <input className={input} defaultValue={((v as string[]) ?? []).join(", ")} onBlur={(e) => set(k, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            )}
            {type === "lines" && (
              <textarea className={`${input} min-h-28`} defaultValue={((v as string[]) ?? []).join("\n")} onBlur={(e) => set(k, e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
            )}
            {type === "bool" && (
              <input type="checkbox" className="h-5 w-5 accent-primary" checked={!!v} onChange={(e) => set(k, e.target.checked)} />
            )}
            {type === "image" && (
              <div className="flex items-center gap-3">
                {projectImage({ image_url: v as string | null, url: (r["url"] as string) ?? null }) && (
                  <img src={projectImage({ image_url: v as string | null, url: (r["url"] as string) ?? null })!} alt="" className="h-16 w-28 rounded-xl object-cover object-top" />
                )}
                <span className={`${btn} cursor-pointer bg-secondary`}>
                  <Upload className="h-4 w-4" />Upload
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    if (url) set(k, url);
                  }} />
                </span>
                {v ? <button type="button" onClick={() => set(k, null)} className="text-xs text-muted-foreground">Use auto screenshot</button> : <span className="text-xs text-muted-foreground">Auto screenshot from live URL</span>}
              </div>
            )}
          </label>
        );
      })}
      <div className="flex items-center gap-2 sm:col-span-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">Order
          <input type="number" className={`${input} w-20`} value={r.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} />
        </label>
        <div className="ml-auto flex gap-2">
          <button onClick={del} className={`${btn} text-destructive hover:bg-secondary`}><Trash2 className="h-4 w-4" /></button>
          <button onClick={save} className={`${btn} bg-primary text-primary-foreground`}><Save className="h-4 w-4" />Save</button>
        </div>
      </div>
    </div>
  );
}
