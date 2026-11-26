import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, Calendar, GraduationCap, MapPin, Sparkles } from "lucide-react";
import { portfolioQuery, type Education, type Experience, type Skill } from "@/lib/portfolio";
import { CollectionManager } from "./CollectionManager";
import { Field, LinesEditor, TagInput, inputClass } from "./ui";

function Loading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

/* ------------------------------- Skills -------------------------------- */

type SkillDraft = Pick<Skill, "category" | "items">;

export function SkillsManager() {
  const { data, isLoading } = useQuery(portfolioQuery);
  const rows = useMemo(() => data?.skills ?? [], [data?.skills]);
  const groups = useMemo(() => rows.map((r) => r.category), [rows]);
  if (isLoading) return <Loading />;
  return (
    <CollectionManager<Skill, SkillDraft>
      table="skills"
      rows={rows}
      noun="skill group"
      icon={Sparkles}
      columns={2}
      emptyDescription="Group your skills, e.g. “Frontend”, “Cloud” or “AI tooling”."
      blank={{ category: "", items: [] }}
      toDraft={(r) => ({ category: r.category, items: r.items })}
      validate={(d) => (d.category.trim() ? null : "Give the group a name.")}
      normalize={(d) => ({ ...d, category: d.category.trim() })}
      titleOf={(r) => r.category || "Untitled group"}
      renderCard={(r) => (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate font-semibold">{r.category || "Untitled group"}</p>
            <span className="shrink-0 text-xs text-muted-foreground">{r.items.length} skills</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {r.items.slice(0, 12).map((s) => (
              <span
                key={s}
                className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground"
              >
                {s}
              </span>
            ))}
            {r.items.length > 12 && (
              <span className="px-1 text-[11px] text-muted-foreground">
                +{r.items.length - 12} more
              </span>
            )}
            {!r.items.length && (
              <span className="text-xs italic text-muted-foreground">No skills yet</span>
            )}
          </div>
        </>
      )}
      renderForm={(d, set, showErrors) => (
        <>
          <Field
            label="Group name"
            required
            error={showErrors && !d.category.trim() ? "Give the group a name." : null}
          >
            <input
              autoFocus
              className={inputClass}
              value={d.category}
              placeholder="e.g. Frontend"
              list="skill-groups"
              onChange={(e) => set({ category: e.target.value })}
            />
            <datalist id="skill-groups">
              {groups.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </Field>
          <Field
            label="Skills"
            counter={`${d.items.length}`}
            hint="Press Enter or comma to add. Paste a comma-separated list to add many at once."
          >
            <TagInput
              ariaLabel="Skills"
              value={d.items}
              onChange={(items) => set({ items })}
              placeholder="React, Node.js, AWS…"
            />
          </Field>
        </>
      )}
    />
  );
}

/* ----------------------------- Experience ------------------------------ */

type ExpDraft = Pick<Experience, "role" | "company" | "period" | "location" | "bullets">;

export function ExperienceManager() {
  const { data, isLoading } = useQuery(portfolioQuery);
  const rows = useMemo(() => data?.experiences ?? [], [data?.experiences]);
  if (isLoading) return <Loading />;
  const required = (d: ExpDraft) =>
    !d.role.trim() ? "Role is required." : !d.company.trim() ? "Company is required." : null;
  return (
    <CollectionManager<Experience, ExpDraft>
      table="experiences"
      rows={rows}
      noun="experience"
      icon={BriefcaseBusiness}
      emptyDescription="Add the roles you've held, most recent first."
      blank={{ role: "", company: "", period: "", location: "", bullets: [] }}
      toDraft={(r) => ({
        role: r.role,
        company: r.company,
        period: r.period,
        location: r.location,
        bullets: r.bullets,
      })}
      validate={required}
      normalize={(d) => ({
        role: d.role.trim(),
        company: d.company.trim(),
        period: d.period.trim(),
        location: d.location.trim(),
        bullets: d.bullets.map((b) => b.trim()).filter(Boolean),
      })}
      titleOf={(r) => `${r.role}${r.company ? ` at ${r.company}` : ""}`}
      renderCard={(r) => (
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            {(r.company || r.role || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{r.role || "Untitled role"}</p>
            <p className="truncate text-sm text-muted-foreground">{r.company}</p>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {r.period && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {r.period}
                </span>
              )}
              {r.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {r.location}
                </span>
              )}
              <span>
                {r.bullets.length} highlight{r.bullets.length === 1 ? "" : "s"}
              </span>
            </div>
            {r.bullets[0] && (
              <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">• {r.bullets[0]}</p>
            )}
          </div>
        </div>
      )}
      renderForm={(d, set, showErrors) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Role"
              required
              error={showErrors && !d.role.trim() ? "Role is required." : null}
            >
              <input
                autoFocus
                className={inputClass}
                value={d.role}
                placeholder="e.g. Senior Frontend Engineer"
                onChange={(e) => set({ role: e.target.value })}
              />
            </Field>
            <Field
              label="Company"
              required
              error={showErrors && !d.company.trim() ? "Company is required." : null}
            >
              <input
                className={inputClass}
                value={d.company}
                placeholder="e.g. Acme Inc."
                onChange={(e) => set({ company: e.target.value })}
              />
            </Field>
            <Field label="Period" hint="e.g. Jan 2022 – Present">
              <input
                className={inputClass}
                value={d.period}
                placeholder="2022 – Present"
                onChange={(e) => set({ period: e.target.value })}
              />
            </Field>
            <Field label="Location">
              <input
                className={inputClass}
                value={d.location}
                placeholder="Dubai, UAE · Remote"
                onChange={(e) => set({ location: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Highlights" counter={`${d.bullets.filter(Boolean).length}`}>
            <LinesEditor
              value={d.bullets}
              onChange={(bullets) => set({ bullets })}
              addLabel="Add highlight"
            />
          </Field>
        </>
      )}
    />
  );
}

/* ------------------------------ Education ------------------------------ */

type EduDraft = Pick<Education, "degree" | "school" | "year">;

export function EducationManager() {
  const { data, isLoading } = useQuery(portfolioQuery);
  const rows = useMemo(() => data?.education ?? [], [data?.education]);
  if (isLoading) return <Loading />;
  return (
    <CollectionManager<Education, EduDraft>
      table="education"
      rows={rows}
      noun="education entry"
      icon={GraduationCap}
      columns={2}
      emptyDescription="Add degrees, diplomas or certifications."
      blank={{ degree: "", school: "", year: "" }}
      toDraft={(r) => ({ degree: r.degree, school: r.school, year: r.year })}
      validate={(d) => (d.degree.trim() ? null : "Degree is required.")}
      normalize={(d) => ({
        degree: d.degree.trim(),
        school: d.school.trim(),
        year: d.year.trim(),
      })}
      titleOf={(r) => r.degree || "Untitled"}
      renderCard={(r) => (
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{r.degree || "Untitled"}</p>
            <p className="truncate text-sm text-muted-foreground">{r.school}</p>
            {r.year && <p className="mt-1 text-xs text-muted-foreground">{r.year}</p>}
          </div>
        </div>
      )}
      renderForm={(d, set, showErrors) => (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Degree / certification"
            required
            className="sm:col-span-2"
            error={showErrors && !d.degree.trim() ? "Degree is required." : null}
          >
            <input
              autoFocus
              className={inputClass}
              value={d.degree}
              placeholder="e.g. B.Sc. Computer Science"
              onChange={(e) => set({ degree: e.target.value })}
            />
          </Field>
          <Field label="School / issuer">
            <input
              className={inputClass}
              value={d.school}
              placeholder="University name"
              onChange={(e) => set({ school: e.target.value })}
            />
          </Field>
          <Field label="Year">
            <input
              className={inputClass}
              value={d.year}
              placeholder="2019"
              onChange={(e) => set({ year: e.target.value })}
            />
          </Field>
        </div>
      )}
    />
  );
}
