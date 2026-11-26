import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Github, Linkedin, Loader2, Mail, MessageCircle, Phone, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { portfolioQuery, type Profile } from "@/lib/portfolio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import portrait from "@/assets/kailash-portrait.png";
import {
  Field,
  FloatingBar,
  ImageDrop,
  inputClass,
  isSame,
  useBeforeUnload,
  useConfirm,
} from "./ui";
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
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="mb-5">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
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
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
        ))}
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

  const save = async () => {
    if (!p.name.trim()) {
      toast.error("Name can't be empty.");
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

  const whatsappDigits = p.whatsapp.replace(/\D/g, "");
  const whatsappError =
    p.whatsapp && whatsappDigits !== p.whatsapp ? "Use digits only, including country code." : null;

  return (
    <div
      className="space-y-5 pb-24"
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          if (dirty && !saving) void save();
        }
      }}
    >
      <Section
        title="Home portrait"
        description="Shown in your portfolio hero. Shared-link previews keep using the original portrait."
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="w-40 shrink-0">
            <ImageDrop
              aspect="aspect-square"
              previewClassName="rounded-full"
              preview={p.avatar_url || portrait}
              hasCustom={!!p.avatar_url}
              onUploaded={(u) => set("avatar_url", u)}
              onReset={() => set("avatar_url", null)}
              onBusyChange={setUploading}
              resetLabel="Use original"
              emptyLabel="Drop a photo"
            />
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {p.avatar_url ? "Custom portrait" : "Original portrait"}
            </p>
            <p>Click or drag a new photo onto the image to replace it.</p>
            <p>Square images (at least 600×600) look best. PNG, JPG or WebP up to 8 MB.</p>
          </div>
        </div>
      </Section>

      <Section title="Basics" description="Your name and headline at the top of the portfolio.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" required>
            <input className={inputClass} {...text("name")} />
          </Field>
          <Field label="Title" hint="e.g. Senior Software Engineer">
            <input className={inputClass} {...text("title")} />
          </Field>
          <Field label="Location" className="sm:col-span-2">
            <input className={inputClass} placeholder="Dubai, UAE" {...text("location")} />
          </Field>
          <Field
            label="Headline"
            className="sm:col-span-2"
            counter={`${p.tagline.length} chars`}
            hint="One punchy line. Under ~120 characters reads best."
          >
            <input className={inputClass} {...text("tagline")} />
          </Field>
          <Field
            label="About / summary"
            className="sm:col-span-2"
            counter={`${p.summary.length} chars`}
          >
            <textarea className={cn(inputClass, "min-h-36 resize-y")} {...text("summary")} />
          </Field>
        </div>
      </Section>

      <Section title="Contact & social" description="How visitors can reach you.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email">
            <IconInput icon={Mail} type="email" {...text("email")} />
          </Field>
          <Field label="Phone (display)" hint="Shown exactly as typed.">
            <IconInput icon={Phone} type="tel" {...text("phone")} />
          </Field>
          <Field
            label="WhatsApp number"
            hint="Digits only with country code, e.g. 971526635447"
            error={whatsappError}
          >
            <IconInput icon={MessageCircle} inputMode="numeric" {...text("whatsapp")} />
          </Field>
          <div className="hidden sm:block" />
          <Field label="LinkedIn URL">
            <IconInput
              icon={Linkedin}
              type="url"
              placeholder="https://linkedin.com/in/…"
              {...text("linkedin")}
            />
          </Field>
          <Field label="GitHub URL">
            <IconInput
              icon={Github}
              type="url"
              placeholder="https://github.com/…"
              {...text("github")}
            />
          </Field>
        </div>
      </Section>

      {dirty && (
        <FloatingBar>
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Unsaved changes
          </span>
          <Button size="sm" variant="ghost" onClick={discard} disabled={saving}>
            Discard
          </Button>
          <Button size="sm" onClick={save} disabled={saving || uploading}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </FloatingBar>
      )}
      {dialog}
    </div>
  );
}
