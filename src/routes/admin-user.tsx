import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
  GraduationCap,
  Loader2,
  LogOut,
  Sparkles,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { portfolioQuery } from "@/lib/portfolio";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ui";
import { ProfileEditor } from "@/components/admin/ProfileEditor";
import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { EducationManager, ExperienceManager, SkillsManager } from "@/components/admin/sections";

export const Route = createFileRoute("/admin-user")({
  head: () => ({
    meta: [
      { title: "Admin - Kailash Portfolio" },
      {
        name: "description",
        content:
          "Private portfolio management dashboard for updating profile, skills, experience, and project content.",
      },
      { property: "og:title", content: "Admin - Kailash Portfolio" },
      {
        property: "og:description",
        content:
          "Private portfolio management dashboard for updating profile, skills, experience, and project content.",
      },
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
                onClick={() => void supabase.auth.signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        {!ready ? (
          <div className="flex justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !session ? (
          <AuthCard />
        ) : isAdmin === null ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking access…
          </p>
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
  const [showPassword, setShowPassword] = useState(false);
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
      className="mx-auto mt-10 max-w-sm space-y-4 rounded-3xl border border-border bg-card p-7 shadow-card"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "in" ? "Welcome back" : "Create admin account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "in"
            ? "Sign in to manage your portfolio content."
            : "The first account created becomes the portfolio owner."}
        </p>
      </div>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Email</span>
        <input
          className={input}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Password</span>
        <div className="relative">
          <input
            className={`${input} pr-10`}
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            placeholder={mode === "up" ? "At least 6 characters" : "••••••••"}
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </label>
      <button
        disabled={busy}
        className={`${btn} w-full justify-center bg-primary text-primary-foreground disabled:opacity-70`}
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "in" ? "up" : "in")}
        className="w-full text-center text-sm text-primary hover:underline"
      >
        {mode === "in" ? "First time? Create account" : "Have an account? Sign in"}
      </button>
    </form>
  );
}

const TABS = [
  { label: "Profile", icon: UserRound, key: "profile", hint: "Name, headline, contact" },
  { label: "Projects", icon: FolderKanban, key: "projects", hint: "Your work showcase" },
  { label: "Skills", icon: Sparkles, key: "skills", hint: "Grouped skill chips" },
  { label: "Experience", icon: BriefcaseBusiness, key: "experiences", hint: "Roles & highlights" },
  { label: "Education", icon: GraduationCap, key: "education", hint: "Degrees & certificates" },
] as const;
type AdminTab = (typeof TABS)[number]["label"];
const TAB_KEY = "admin-tab";

function Dashboard() {
  const [tab, setTabState] = useState<AdminTab>(() => {
    try {
      const saved = sessionStorage.getItem(TAB_KEY);
      return TABS.some((t) => t.label === saved) ? (saved as AdminTab) : "Profile";
    } catch {
      return "Profile";
    }
  });
  const [profileDirty, setProfileDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState<AdminTab | null>(null);
  const { data } = useQuery(portfolioQuery);
  const onDirtyChange = useCallback((d: boolean) => setProfileDirty(d), []);

  const go = (next: AdminTab) => {
    try {
      sessionStorage.setItem(TAB_KEY, next);
    } catch {
      /* ignore */
    }
    setTabState(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const setTab = (next: AdminTab) => {
    if (next === tab) return;
    if (tab === "Profile" && profileDirty) setPendingTab(next);
    else go(next);
  };
  const current = TABS.find((t) => t.label === tab);

  return (
    <div className="grid gap-8 md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="min-w-0 md:sticky md:top-24 md:self-start">
        <div className="mb-5 hidden px-3 md:block">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Workspace</p>
          <p className="mt-1 text-lg font-semibold">Content</p>
        </div>
        <nav
          aria-label="Admin sections"
          className="-mx-5 flex gap-1 overflow-x-auto border-b border-border px-5 pb-3 md:mx-0 md:flex-col md:overflow-visible md:border-b-0 md:px-0 md:pb-0"
        >
          {TABS.map(({ label, icon: Icon, key }) => (
            <Button
              key={label}
              type="button"
              variant="ghost"
              onClick={() => setTab(label)}
              aria-current={tab === label ? "page" : undefined}
              className={`h-11 shrink-0 justify-start gap-3 rounded-xl px-3 text-sm md:w-full ${tab === label ? "bg-primary/10 font-semibold text-primary hover:bg-primary/10 hover:text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {key === "profile" ? (
                profileDirty && (
                  <span
                    className="ml-auto h-2 w-2 rounded-full bg-amber-500"
                    title="Unsaved changes"
                  />
                )
              ) : (
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-normal tabular-nums">
                  {data?.[key]?.length ?? 0}
                </span>
              )}
            </Button>
          ))}
        </nav>
        <div className="mt-8 hidden space-y-3 border-t border-border px-3 pt-5 md:block">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="truncate text-sm font-medium">{data?.profile?.name}</p>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/" target="_blank">
              <ExternalLink className="h-4 w-4" />
              View live portfolio
            </Link>
          </Button>
        </div>
      </aside>
      <section className="min-w-0">
        <div className="mb-6 border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase text-primary">Portfolio studio</p>
          <h1 className="mt-1 text-3xl font-semibold">{tab}</h1>
          {current && <p className="mt-1 text-sm text-muted-foreground">{current.hint}</p>}
        </div>
        {tab === "Profile" && <ProfileEditor onDirtyChange={onDirtyChange} />}
        {tab === "Projects" && <ProjectsManager />}
        {tab === "Skills" && <SkillsManager />}
        {tab === "Experience" && <ExperienceManager />}
        {tab === "Education" && <EducationManager />}
      </section>
      <ConfirmDialog
        open={!!pendingTab}
        onOpenChange={(o) => !o && setPendingTab(null)}
        title="Discard unsaved profile changes?"
        description="You've edited your profile but haven't saved. Leaving this section will discard those edits."
        cancelLabel="Keep editing"
        confirmLabel="Discard & continue"
        destructive
        onConfirm={() => {
          const next = pendingTab;
          setPendingTab(null);
          setProfileDirty(false);
          if (next) go(next);
        }}
      />
    </div>
  );
}
