import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { siReact, siJavascript, siTailwindcss, siLaravel, siPython, siPostgresql, siFlutter, siTypescript, siWordpress, siMysql, siMongodb, siVite, siFigma, sidevelopment tooling, siGit, type SimpleIcon } from "simple-icons";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Briefcase,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Send,
} from "lucide-react";
import { portfolioQuery, profileQuery, projectImage, type Project } from "@/lib/portfolio";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import portrait from "@/assets/kailash-portrait.png.asset.json";

const TITLE = "Kailash Rajkumar — Full Stack Developer in Dubai";
const DESC =
  "Kailash Rajkumar builds business websites, custom CRM platforms, and mobile apps with Flutter and React Native, using secure AI-assisted workflows.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: Index,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

const NAV = [
  ["Work", "#work"],
  ["Skills", "#skills"],
  ["Experience", "#experience"],
  ["Contact", "#contact"],
] as const;

function Index() {
  const { data: p } = useSuspenseQuery(profileQuery);
  const { data } = useQuery(portfolioQuery);
  const first = p?.name.split(" ")[0] ?? "Kailash";

  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-3 z-50 mx-auto flex w-[min(96%,56rem)] items-center justify-between rounded-full border border-border bg-glass px-4 py-2 backdrop-blur-xl shadow-card">
        <a href="#top" className="text-base font-semibold tracking-tight">
          {first.toLowerCase()}<span className="text-primary">.dev</span>
        </a>
        <nav className="hidden gap-1 sm:flex">
          {NAV.map(([l, h]) => (
            <a key={h} href={h} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              {l}
            </a>
          ))}
        </nav>
        <ThemeToggle />
      </header>

      <Hero />
       {data ? <>
         <Marquee items={data.skills.flatMap((s) => s.items)} />
         <Work projects={data.projects.filter((project) => project.active)} />
         <Skills />
         <ExperienceSection />
       </> : <div className="mx-auto max-w-6xl px-6 py-16" aria-label="Loading portfolio"><div className="h-8 w-40 animate-pulse rounded bg-secondary" /><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-md bg-secondary" />)}</div></div>}
       <Contact />

      <footer className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <span>© {new Date().getFullYear()} {p?.name}. Crafted in Dubai.</span>
      </footer>
    </div>
  );
}

function Hero() {
  const { data: p } = useSuspenseQuery(profileQuery);

  return (
    <section id="top" className="relative isolate overflow-hidden border-b border-border bg-background pt-28 sm:pt-32">
       <div className="relative mx-auto flex max-w-7xl flex-col items-center px-5 pb-8 text-center sm:px-8 lg:min-h-[610px] lg:flex-row-reverse lg:items-end lg:gap-8 lg:pb-0 lg:text-left">
         <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative mb-5 h-[170px] w-[170px] shrink-0 overflow-hidden rounded-full border-[6px] border-card shadow-card sm:h-[260px] sm:w-[260px] lg:mb-0 lg:h-[min(42vw,520px)] lg:w-[min(42vw,520px)] lg:rounded-none lg:border-0 lg:shadow-none">
          <img src={portrait.url} alt="Kailash Rajkumar" width="400" height="400" fetchPriority="high" className="h-full w-full object-cover object-top lg:object-contain lg:object-bottom" />
        </motion.div>
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="relative z-10 min-w-0 max-w-[640px] lg:flex-1 lg:pb-20">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase text-primary sm:mb-5 sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />Full-stack developer · Dubai
          </p>
           <h1 className="font-display text-4xl font-extrabold leading-[1.08] sm:text-6xl lg:text-6xl xl:text-7xl">
            Kailash <span className="block text-primary">Rajkumar</span>
          </h1>
          <p className="mt-4 max-w-[580px] text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-xl">
            {p?.tagline}
          </p>
          <p className="mt-3 max-w-[580px] text-sm leading-relaxed text-foreground/80 sm:mt-4 sm:text-base">
            From business websites to all-in-one CRMs and Flutter or React Native apps. I use development tooling and development tooling to move faster while keeping client work secure.
          </p>
           <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-3 lg:justify-start">
            <Button asChild size="lg" className="h-12 rounded-md px-6 text-sm font-semibold"><a href="#contact">Start a project <ArrowUpRight className="h-4 w-4" /></a></Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-md px-6 text-sm font-semibold"><a href="#work">View my work</a></Button>
            <div className="flex gap-2 sm:ml-2">
              {p?.github && <IconLink href={p.github} label="GitHub"><Github className="h-4 w-4" /></IconLink>}
              {p?.linkedin && <IconLink href={p.linkedin} label="LinkedIn"><Linkedin className="h-4 w-4" /></IconLink>}
              {p?.email && <IconLink href={`mailto:${p.email}`} label="Email"><Mail className="h-4 w-4" /></IconLink>}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card transition-colors hover:text-primary">
      {children}
    </a>
  );
}

const TECHNOLOGY_MARKS: Record<string, SimpleIcon> = {
  "React.js": siReact, "JavaScript (ES6+)": siJavascript, "Tailwind CSS": siTailwindcss,
  "Laravel": siLaravel, Python: siPython, PostgreSQL: siPostgresql, MySQL: siMysql,
  MongoDB: siMongodb, Flutter: siFlutter, "React Native": siReact,
  "Advanced Tooling": sidevelopment tooling, "Git & GitHub": siGit, WordPress: siWordpress,
  Figma: siFigma, Vite: siVite, "TypeScript": siTypescript,
};

function Marquee({ items }: { items: string[] }) {
  const technologies = Array.from(new Set(items)).filter((item) => TECHNOLOGY_MARKS[item]);
  if (!technologies.length) return null;
  return (
    <div className="overflow-hidden border-b border-border bg-card py-6">
      <div className="mx-auto mb-4 max-w-7xl px-6 text-xs font-bold uppercase text-muted-foreground sm:px-8">Technologies & tools</div>
      <div className="flex w-max animate-marquee items-center">
        {[0, 1].map((copy) => <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1 ? true : undefined}>
          {technologies.map((name) => {
            const mark = TECHNOLOGY_MARKS[name];
            return <span key={name} className="mx-7 flex shrink-0 items-center gap-3 whitespace-nowrap text-sm font-semibold text-foreground/75 sm:mx-10 sm:text-base">
              {mark && <svg role="img" aria-label={`${name} logo`} viewBox="0 0 24 24" className="h-7 w-7 fill-primary sm:h-8 sm:w-8"><path d={mark.path} /></svg>}
              {name}
            </span>;
          })}
        </div>)}
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <motion.div {...fadeUp} className="mb-10">
      <p className="text-sm font-semibold text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h2>
    </motion.div>
  );
}

function Work({ projects }: { projects: Project[] }) {
  const cats = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.category)))], [projects]);
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? projects : projects.filter((p) => p.category === cat);

  return (
    <section id="work" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHead eyebrow="Selected work" title="Things I've built." />
      <div className="mb-8 flex flex-wrap gap-2 rounded-full">
        {cats.map((c) => (
           <Button
            key={c}
            onClick={() => setCat(c)}
             variant={cat === c ? "default" : "secondary"}
             size="sm"
             className="rounded-full px-4 text-sm"
          >
            {c}
           </Button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => (
          <ProjectCard key={p.id} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const img = projectImage(p);
  return (
    <motion.a
      href={p.url ?? undefined}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
      whileHover={{ y: -6 }}
       className="group flex min-w-0 flex-col overflow-hidden rounded-md border border-border bg-card shadow-card"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {img && (
           <img src={img} alt={`${p.title} preview`} loading="lazy" decoding="async" width="480" height="300" className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
        )}
        {p.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-glass px-2.5 py-1 text-[11px] font-semibold backdrop-blur">Featured</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-primary">{p.category}</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">{p.title}</h3>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-45">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {p.tags.map((t) => (
            <span key={t} className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">{t}</span>
          ))}
        </div>
      </div>
    </motion.a>
  );
}

function Skills() {
   const { data } = useQuery(portfolioQuery);
   if (!data) return null;
  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHead eyebrow="Toolkit" title="What I work with." />
      <motion.p {...fadeUp} className="mb-10 max-w-3xl text-lg leading-relaxed text-muted-foreground">
        {data.profile?.summary}
      </motion.p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.skills.map((s, i) => (
          <motion.div key={s.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: (i % 3) * 0.08 }} className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-semibold">{s.category}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {s.items.map((it) => (
                <span key={it} className="rounded-xl bg-secondary px-3 py-1.5 text-sm">{it}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ExperienceSection() {
   const { data } = useQuery(portfolioQuery);
   if (!data) return null;
  return (
    <section id="experience" className="mx-auto max-w-4xl px-6 py-24">
      <SectionHead eyebrow="Journey" title="Experience." />
      <div className="relative space-y-5 border-l border-border pl-8">
        {data.experiences.map((e) => (
          <motion.div key={e.id} {...fadeUp} className="relative rounded-3xl border border-border bg-card p-6 shadow-card">
            <span className="absolute -left-[42px] top-7 flex h-5 w-5 items-center justify-center rounded-full bg-primary ring-4 ring-background">
              <Briefcase className="h-2.5 w-2.5 text-primary-foreground" />
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold">{e.role} · <span className="text-primary">{e.company}</span></h3>
              <span className="text-sm text-muted-foreground">{e.period}</span>
            </div>
            {e.location && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{e.location}</p>}
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {e.bullets.map((b, i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />{b}</li>)}
            </ul>
          </motion.div>
        ))}
        {data.education.map((ed) => (
          <motion.div key={ed.id} {...fadeUp} className="relative rounded-3xl border border-border bg-card p-6 shadow-card">
            <span className="absolute -left-[42px] top-7 flex h-5 w-5 items-center justify-center rounded-full bg-foreground ring-4 ring-background">
              <GraduationCap className="h-2.5 w-2.5 text-background" />
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">{ed.degree}</h3>
              <span className="text-sm text-muted-foreground">{ed.year}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{ed.school}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(1, "Please write a message").max(1000),
});

function Contact() {
   const { data: p } = useSuspenseQuery(profileQuery);
  const wa = (p?.whatsapp || "971526635447").replace(/\D/g, "");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = contactSchema.safeParse(form);
    if (!r.success) { toast.error(r.error.issues[0]?.message ?? "Invalid input"); return; }
    const text = `Hi Kailash! 👋\n\nName: ${r.data.name}\nEmail: ${r.data.email}\n\n${r.data.message}`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    toast.success("Opening WhatsApp — just hit send!");
    setForm({ name: "", email: "", message: "" });
  };

  const field = "w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring";

  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-24">
      <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-card sm:p-12">
        <div className="absolute inset-0 bg-hero opacity-60" aria-hidden />
        <div className="relative grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-primary">Contact</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight">Let's build something great.</h2>
            <p className="mt-4 text-muted-foreground">Send a message and it lands straight in my WhatsApp. I usually reply within a few hours.</p>
            <div className="mt-8 space-y-3 text-sm">
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-primary"><MessageCircle className="h-4 w-4 text-success" />{p?.phone}</a>
              <a href={`mailto:${p?.email}`} className="flex items-center gap-3 hover:text-primary"><Mail className="h-4 w-4 text-primary" />{p?.email}</a>
              <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" />{p?.location}</p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <input className={field} placeholder="Your name" maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={field} placeholder="Email address" type="email" maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <textarea className={`${field} min-h-36 resize-none`} placeholder="Tell me about your project…" maxLength={1000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
             <Button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold">
              <Send className="h-4 w-4" /> Send via WhatsApp
             </Button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
