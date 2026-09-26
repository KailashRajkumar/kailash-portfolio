import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "motion/react";
import { useMemo, useRef, useState } from "react";
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
  Sparkles,
} from "lucide-react";
import { portfolioQuery, projectImage, type Project } from "@/lib/portfolio";
import { ThemeToggle } from "@/components/ThemeToggle";

const TITLE = "Kailash Rajkumar — Full Stack Developer in Dubai";
const DESC =
  "Kailash Rajkumar builds fintech platforms, broker CRMs, trading infrastructure and modern web & Flutter apps. Explore projects and get in touch.";

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
  loader: ({ context }) => context.queryClient.ensureQueryData(portfolioQuery),
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
  const { data } = useSuspenseQuery(portfolioQuery);
  const p = data.profile;
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
      <Marquee items={data.skills.flatMap((s) => s.items)} />
      <Work projects={data.projects} />
      <Skills />
      <ExperienceSection />
      <Contact />

      <footer className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <span>© {new Date().getFullYear()} {p?.name}. Crafted in Dubai.</span>
        <Link to="/admin" className="hover:text-foreground">Admin</Link>
      </footer>
    </div>
  );
}

function Hero() {
  const { data } = useSuspenseQuery(portfolioQuery);
  const p = data.profile;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const words = (p?.tagline ?? "").split(" ");

  return (
    <section id="top" ref={ref} className="relative overflow-hidden pt-36 pb-24">
      <div className="absolute inset-0 bg-hero" aria-hidden />
      <motion.div style={{ y, opacity }} className="relative mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-glass px-3 py-1 text-xs font-medium backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Available for freelance & full-time
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-8 text-lg text-muted-foreground">
          Hi, I'm {p?.name} — {p?.title}
        </motion.p>
        <h1 className="mt-3 text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mr-[0.25em] inline-block"
            >
              {w}
            </motion.span>
          ))}
        </h1>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-10 flex flex-wrap items-center gap-3">
          <a href="#work" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.03] active:scale-95">
            View my work
          </a>
          <a href="#contact" className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-95">
            Let's talk
          </a>
          <div className="ml-1 flex gap-2">
            {p?.github && <IconLink href={p.github} label="GitHub"><Github className="h-4 w-4" /></IconLink>}
            {p?.linkedin && <IconLink href={p.linkedin} label="LinkedIn"><Linkedin className="h-4 w-4" /></IconLink>}
            {p?.email && <IconLink href={`mailto:${p.email}`} label="Email"><Mail className="h-4 w-4" /></IconLink>}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [`${data.projects.length}+`, "Projects shipped"],
            ["500+", "Daily active users"],
            ["30%", "Faster page loads"],
            [p?.location.split(",").pop()?.trim() || "UAE", p?.location.split(",")[0] || "Based in"],
          ].map(([a, b]) => (
            <div key={b} className="rounded-2xl border border-border bg-glass p-4 backdrop-blur">
              <div className="text-2xl font-bold tracking-tight">{a}</div>
              <div className="text-xs text-muted-foreground">{b}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
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

function Marquee({ items }: { items: string[] }) {
  if (!items.length) return null;
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-border bg-card py-4">
      <div className="flex w-max animate-marquee gap-8">
        {row.map((s, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap text-sm font-medium text-muted-foreground">
            {s} <Sparkles className="h-3 w-3 text-primary" />
          </span>
        ))}
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
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${cat === c ? "bg-foreground text-background" : "bg-card text-muted-foreground hover:text-foreground"}`}
          >
            {c}
          </button>
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
  const big = p.featured && i < 2;
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
      className={`group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card ${big ? "lg:col-span-1 sm:col-span-1" : ""}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {img && (
          <img src={img} alt={`${p.title} preview`} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
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
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
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
  const { data } = useSuspenseQuery(portfolioQuery);
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
  const { data } = useSuspenseQuery(portfolioQuery);
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
  const { data } = useSuspenseQuery(portfolioQuery);
  const p = data.profile;
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
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] active:scale-[0.98]">
              <Send className="h-4 w-4" /> Send via WhatsApp
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
