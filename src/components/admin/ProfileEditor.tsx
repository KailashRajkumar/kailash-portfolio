import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Camera,
  CheckCircle2,
  Github,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Save,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { portfolioQuery, type Profile } from "@/lib/portfolio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import portrait from "@/assets/kailash-portrait.png";
import { Field, inputClass, isSame, uploadImage, useBeforeUnload, useConfirm } from "./ui";
import { useRefresh } from "./useOrdering";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function IconInput({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input {...props} className={cn(inputClass, "pl-9")} />
    </div>
  );
}

function AvatarPicker({
  url,
  onChange,
  onBusyChange,
}: {
  url: string | null;
  onChange: (url: string | null) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const handle = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    onBusyChange(true);
    const uploaded = await uploadImage(file);
    setBusy(false);
    onBusyChange(false);
    if (uploaded) {
      onChange(uploaded);
      toast.success("Photo uploaded — click Save to publish it.");
    }
  };
  return (
    <div className="flex flex-col items-center text-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
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
        aria-label="Change portrait"
        className={cn(
          "group relative h-36 w-36 overflow-hidden rounded-full bg-muted ring-4 ring-background shadow-card",
          drag && "ring-primary",
        )}
      >
        <img
          src={url || portrait}
          alt="Current home portrait"
          className="h-full w-full object-cover object-top"
        />
        <span
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100",
            (busy || drag) && "opacity-100",
          )}
        >
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Camera className="h-6 w-6" />
              {drag ? "Drop photo" : "Change photo"}
            </>
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => {
          void handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
          Upload photo
        </Button>
        {url && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onChange(null)}
          >
            <RotateCcw className="h-4 w-4" />
            Use original
          </Button>
        )}
      </div>
    </div>
  );
}

export function ProfileEditor({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const { data, isLoading } = useQuery(portfolioQuery);
  const refresh = useRefresh();
  const { confirm, dialog } = useConfirm();
  const [saved, setSaved] = useState<Profile | null>(null);
  const [p, setP] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!data?.profile) return;
    // Don't clobber in-progress edits when background refetches arrive.
    setP((cur) => (cur && saved && !isSame(cur, saved) ? cur : data.profile));
    setSaved(data.profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.profile]);

  const dirty = !!p && !!saved && !isSame(p, saved);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useBeforeUnload(dirty);

  if (isLoading || !p) {
    return (
      <div className="grid gap-5 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <div className="h-80 animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-5">
          <div className="h-56 animate-pulse rounded-2xl bg-muted" />
          <div className="h-56 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setP((cur) => (cur ? { ...cur, [k]: v } : cur));
  const text = (k: keyof Profile) => ({
    value: (p[k] as string | null) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(k, e.target.value as never),
  });

  const whatsappError =
    p.whatsapp && /\D/.test(p.whatsapp) ? "Use digits only, including country code." : null;
  const nameError = !p.name.trim() ? "Name can't be empty." : null;

  const save = async () => {
    if (nameError || whatsappError) {
      toast.error(nameError ?? whatsappError);
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profile")
      .update({ ...p, updated_at: new Date().toISOString() })
      .eq("id", 1);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSaved(p);
    toast.success("Profile saved");
    refresh();
  };

  const discard = async () => {
    const ok = await confirm({
      title: "Discard unsaved changes?",
      description: "Your profile will go back to the last saved version.",
      confirmLabel: "Discard",
      destructive: true,
    });
    if (ok && saved) setP(saved);
  };

  return (
    <div
      className="space-y-5"
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          if (dirty && !saving) void save();
        }
      }}
    >
      {/* Save bar — always visible, sticks under the site header */}
      <div className="sticky top-[57px] z-30 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background/95 px-4 py-3 shadow-card backdrop-blur">
        {dirty ? (
          <span className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Unsaved changes
          </span>
        ) : (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            All changes saved
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {dirty && (
            <Button size="sm" variant="ghost" onClick={discard} disabled={saving}>
              Discard
            </Button>
          )}
          <Button size="sm" onClick={save} disabled={!dirty || saving || uploading}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Identity card */}
        <aside className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center xl:sticky xl:top-[136px] xl:flex-col">
          <AvatarPicker
            url={p.avatar_url}
            onChange={(u) => set("avatar_url", u)}
            onBusyChange={setUploading}
          />
          <div className="min-w-0 flex-1 text-center sm:text-left xl:w-full xl:border-t xl:border-border xl:pt-5 xl:text-center">
            <p className="text-lg font-semibold leading-tight">{p.name || "Your name"}</p>
            <p className="mt-1 text-sm text-primary">{p.title || "Your title"}</p>
            {p.location && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {p.location}
              </p>
            )}
            <p className="mt-4 rounded-xl bg-muted/60 p-3 text-left text-xs leading-relaxed text-muted-foreground">
              Square photos (600×600+) look best. Shared-link previews keep using the original
              portrait.
            </p>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <Section title="Basic info" description="Shown at the top of your portfolio.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" required error={nameError}>
                <input
                  className={inputClass}
                  placeholder="Your name"
                  aria-invalid={!!nameError}
                  {...text("name")}
                />
              </Field>
              <Field label="Location">
                <IconInput icon={MapPin} placeholder="City, Country" {...text("location")} />
              </Field>
              <Field label="Job title" className="sm:col-span-2">
                <input
                  className={inputClass}
                  placeholder="e.g. Senior Software Engineer"
                  {...text("title")}
                />
              </Field>
            </div>
          </Section>

          <Section title="Headline & about" description="Introduce yourself to visitors.">
            <div className="space-y-5">
              <Field
                label="Headline"
                counter={`${p.tagline.length}/120`}
                hint="One punchy line that sums up what you do."
              >
                <input
                  className={inputClass}
                  placeholder="I build…"
                  aria-invalid={p.tagline.length > 120}
                  {...text("tagline")}
                />
              </Field>
              <Field label="About / summary" counter={`${p.summary.length} chars`}>
                <textarea
                  className={cn(inputClass, "min-h-40 resize-y leading-relaxed")}
                  placeholder="A short paragraph about your experience and strengths."
                  {...text("summary")}
                />
              </Field>
            </div>
          </Section>

          <Section title="Contact" description="How visitors can reach you.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email" className="sm:col-span-2">
                <IconInput
                  icon={Mail}
                  type="email"
                  placeholder="you@example.com"
                  {...text("email")}
                />
              </Field>
              <Field label="Phone (as displayed)">
                <IconInput icon={Phone} type="tel" placeholder="+971 …" {...text("phone")} />
              </Field>
              <Field label="WhatsApp number" error={whatsappError}>
                <IconInput
                  icon={MessageCircle}
                  inputMode="numeric"
                  placeholder="971526635447 (digits only)"
                  aria-invalid={!!whatsappError}
                  {...text("whatsapp")}
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Social links"
            description="Linked from your portfolio header and contact section."
          >
            <div className="grid gap-5">
              <Field label="LinkedIn">
                <IconInput
                  icon={Linkedin}
                  type="url"
                  placeholder="https://linkedin.com/in/…"
                  {...text("linkedin")}
                />
              </Field>
              <Field label="GitHub">
                <IconInput
                  icon={Github}
                  type="url"
                  placeholder="https://github.com/…"
                  {...text("github")}
                />
              </Field>
            </div>
          </Section>
        </div>
      </div>
      {dialog}
    </div>
  );
}
