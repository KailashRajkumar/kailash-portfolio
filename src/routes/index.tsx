import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  MotionConfig,
  motion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { useMemo, useRef, useState } from "react";
import {
  siReact,
  siJavascript,
  siTailwindcss,
  siLaravel,
  siPython,
  siPostgresql,
  siFlutter,
  siTypescript,
  siWordpress,
  siMysql,
  siMongodb,
  siVite,
  siFigma,
  siGit,
  type SimpleIcon,
} from "simple-icons";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Bot,
  Briefcase,
  CandlestickChart,
  Code2,
  PhoneCall,
  Plug,
  Smartphone,
  Workflow,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Send,
} from "lucide-react";
import {
  portfolioQuery,
  profileQuery,
  projectImage,
  type Project,
  type Skill,
} from "@/lib/portfolio";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import portrait from "@/assets/kailash-portrait.png";

const TITLE = "Kailash Rajkumar - Full Stack Developer in Dubai";
const DESC =
  "Full-stack developer in Dubai building business websites, custom CRM platforms, mobile apps, integrations, and secure web solutions.";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => await context.queryClient.ensureQueryData(profileQuery),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://kailashrajkumar.github.io/kailash-portfolio/" },
      {
        property: "og:image",
        content: "https://kailashrajkumar.github.io/kailash-portfolio/portrait-share.jpg",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Kailash Rajkumar" },
      {
        name: "twitter:image",
        content: "https://kailashrajkumar.github.io/kailash-portfolio/portrait-share.jpg",
      },
    ],
  }),
  pendingMs: 0,
  pendingComponent: HomeSkeleton,
  component: Index,
});

function SkeletonBar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-secondary ${className}`} />;
}

function HomeSkeleton() {
  return (
    <div className="min-h-screen" role="status" aria-label="Loading portfolio">
      <span className="sr-only">Loading portfolio…</span>
      <header className="fixed inset-x-0 top-3 z-50 mx-auto flex w-[min(96%,56rem)] items-center justify-between rounded-full border border-border bg-glass px-4 py-2 shadow-card">
        <SkeletonBar className="h-6 w-24" />
        <SkeletonBar className="hidden h-6 w-64 sm:block" />
        <SkeletonBar className="h-9 w-9 rounded-full" />
      </header>
      <section className="border-b border-border bg-background pt-28 sm:pt-32">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center px-4 pb-8 sm:px-6 lg:grid lg:min-h-[610px] lg:grid-cols-2 lg:items-end lg:gap-8 lg:px-8 lg:pb-0">
          <SkeletonBar className="mb-5 h-[170px] w-[170px] shrink-0 rounded-full sm:h-[260px] sm:w-[260px] lg:mb-0 lg:h-[min(42vw,520px)] lg:w-[min(42vw,520px)] lg:rounded-none" />
          <div className="flex w-full max-w-[640px] flex-col items-center gap-4 lg:col-start-1 lg:row-start-1 lg:max-w-none lg:items-start lg:pb-20">
            <SkeletonBar className="h-5 w-48" />
            <SkeletonBar className="h-12 w-3/4 sm:h-16" />
            <SkeletonBar className="h-12 w-2/3 sm:h-16" />
            <SkeletonBar className="mt-3 h-5 w-full max-w-lg" />
            <SkeletonBar className="h-5 w-5/6 max-w-lg" />
            <SkeletonBar className="h-5 w-3/4 max-w-lg" />
            <div className="mt-4 flex gap-3">
              <SkeletonBar className="h-12 w-36" />
              <SkeletonBar className="h-12 w-36" />
            </div>
          </div>
        </div>
      </section>
      <PortfolioSkeleton />
      <ContactSkeleton />
    </div>
  );
}

function SkeletonHeading() {
  return (
    <div className="mb-10 space-y-3">
      <SkeletonBar className="h-4 w-28" />
      <SkeletonBar className="h-10 w-64 max-w-full" />
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <div role="status" aria-label="Loading work, skills and experience">
      <span className="sr-only">Loading work, skills and experience…</span>
      <div className="overflow-hidden border-b border-border bg-card py-6">
        <div className="mx-auto max-w-[1600px] space-y-4 px-4 sm:px-6 lg:px-8">
          <SkeletonBar className="h-4 w-36" />
          <div className="flex gap-8 overflow-hidden">
            {[0, 1, 2, 3, 4].map((i) => (
              <SkeletonBar key={i} className="h-8 w-36 shrink-0" />
            ))}
          </div>
        </div>
      </div>
      <section id="work" className="mx-auto max-w-[1600px] px-4 py-24 sm:px-6 lg:px-8">
        <SkeletonHeading />
        <div className="mb-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <SkeletonBar key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="overflow-hidden rounded-md border border-border bg-card">
              <SkeletonBar className="aspect-[16/10] w-full rounded-none" />
              <div className="space-y-3 p-5">
                <SkeletonBar className="h-4 w-24" />
                <SkeletonBar className="h-6 w-3/4" />
                <SkeletonBar className="h-4 w-full" />
                <SkeletonBar className="h-4 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section id="skills" className="mx-auto max-w-[1600px] px-4 py-24 sm:px-6 lg:px-8">
        <SkeletonHeading />
        <SkeletonBar className="mb-10 h-5 w-full max-w-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="space-y-5 rounded-3xl border border-border bg-card p-6">
              <SkeletonBar className="h-5 w-36" />
              <div className="flex gap-2">
                <SkeletonBar className="h-8 w-20" />
                <SkeletonBar className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section id="experience" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SkeletonHeading />
        <div className="space-y-5 border-l border-border pl-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-4 rounded-3xl border border-border bg-card p-6">
              <SkeletonBar className="h-6 w-2/3" />
              <SkeletonBar className="h-4 w-36" />
              <SkeletonBar className="h-4 w-full" />
              <SkeletonBar className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContactSkeleton() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      role="status"
      aria-label="Loading contact"
    >
      <div className="grid gap-10 rounded-[2rem] border border-border bg-card p-8 sm:p-12 md:grid-cols-2">
        <div className="space-y-4">
          <SkeletonBar className="h-4 w-20" />
          <SkeletonBar className="h-10 w-4/5" />
          <SkeletonBar className="h-5 w-full" />
          <SkeletonBar className="h-5 w-3/4" />
        </div>
        <div className="space-y-3">
          <SkeletonBar className="h-12 w-full" />
          <SkeletonBar className="h-12 w-full" />
          <SkeletonBar className="h-36 w-full" />
          <SkeletonBar className="h-12 w-full" />
        </div>
      </div>
    </section>
  );
}

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
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <ScrollProgress />
        <header className="fixed inset-x-0 top-3 z-50 mx-auto flex w-[min(96%,56rem)] items-center justify-between rounded-full border border-border bg-glass px-4 py-2 backdrop-blur-xl shadow-card">
          <a href="#top" className="text-base font-semibold tracking-tight">
            {first.toLowerCase()}
            <span className="text-primary">.dev</span>
          </a>
          <nav className="hidden gap-1 sm:flex">
            {NAV.map(([l, h]) => (
              <a
                key={h}
                href={h}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {l}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </header>

        <Hero />
        {data ? (
          <>
            <Marquee items={data.skills.flatMap((s) => s.items)} />
            <Work projects={data.projects.filter((project) => project.active)} />
            <Skills />
            <ExperienceSection />
          </>
        ) : (
          <PortfolioSkeleton />
        )}
        <Contact />

        <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} {p?.name}. Crafted in Dubai.
          </span>
        </footer>
      </div>
    </MotionConfig>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-primary via-primary/80 to-success"
    />
  );
}

const heroStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const heroItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function Hero() {
  const { data: p } = useSuspenseQuery(profileQuery);
  const { scrollY } = useScroll();
  const portraitY = useTransform(scrollY, [0, 700], [0, 70]);
  const textY = useTransform(scrollY, [0, 700], [0, -40]);

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden border-b border-border bg-background pt-28 sm:pt-32"
    >
      <div className="relative mx-auto flex max-w-[1600px] flex-col items-center px-4 pb-8 text-center sm:px-6 lg:grid lg:min-h-[610px] lg:grid-cols-2 lg:items-end lg:gap-0 lg:px-12 lg:pb-0 lg:text-left xl:px-16">
        <motion.div
          style={{ y: portraitY }}
          className="relative mb-5 h-[170px] w-[170px] shrink-0 overflow-hidden rounded-full border-[6px] border-card shadow-card sm:h-[260px] sm:w-[260px] lg:col-start-2 lg:row-start-1 lg:mb-0 lg:h-[min(42vw,520px)] lg:w-[min(42vw,520px)] lg:max-w-full lg:justify-self-end lg:rounded-none lg:border-0 lg:shadow-none"
        >
          <img
            src={p?.avatar_url || portrait}
            alt="Kailash Rajkumar"
            width="400"
            height="400"
            fetchPriority="high"
            className="h-full w-full object-cover object-top lg:object-contain lg:object-bottom"
          />
        </motion.div>
        <motion.div
          style={{ y: textY }}
          variants={heroStagger}
          initial="hidden"
          animate="show"
          className="relative z-10 min-w-0 max-w-[640px] lg:col-start-1 lg:row-start-1 lg:max-w-none lg:pb-20"
        >
          <motion.p
            variants={heroItem}
            className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase text-primary sm:mb-5 sm:text-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Full-stack developer · Dubai
          </motion.p>
          <motion.h1
            variants={heroItem}
            className="font-display text-4xl font-extrabold leading-[1.08] sm:text-6xl lg:text-6xl xl:text-7xl"
          >
            Kailash <span className="block text-primary">Rajkumar</span>
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="mt-4 max-w-[580px] text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-xl"
          >
            {p?.tagline}
          </motion.p>
          <motion.p
            variants={heroItem}
            className="mt-3 max-w-[580px] text-sm leading-relaxed text-foreground/80 sm:mt-4 sm:text-base"
          >
            From business websites to all-in-one CRMs and Flutter or React Native apps. I use
            powerful AI models, technical knowledge, and integrations to move faster while keeping
            client work secure.
          </motion.p>
          <motion.div
            variants={heroItem}
            className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-3 lg:justify-start"
          >
            <Button asChild size="lg" className="h-12 rounded-md px-6 text-sm font-semibold">
              <a href="#contact">
                Start a project <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-md px-6 text-sm font-semibold"
            >
              <a href="#work">View my work</a>
            </Button>
            <div className="flex gap-2 sm:ml-2">
              {p?.github && (
                <IconLink href={p.github} label="GitHub">
                  <Github className="h-4 w-4" />
                </IconLink>
              )}
              {p?.linkedin && (
                <IconLink href={p.linkedin} label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </IconLink>
              )}
              {p?.email && (
                <IconLink href={`mailto:${p.email}`} label="Email">
                  <Mail className="h-4 w-4" />
                </IconLink>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card transition-colors hover:text-primary"
    >
      {children}
    </a>
  );
}

const TECHNOLOGY_MARKS: Record<string, SimpleIcon> = {
  "React.js": siReact,
  "JavaScript (ES6+)": siJavascript,
  "Tailwind CSS": siTailwindcss,
  Laravel: siLaravel,
  Python: siPython,
  PostgreSQL: siPostgresql,
  MySQL: siMysql,
  MongoDB: siMongodb,
  Flutter: siFlutter,
  "React Native": siReact,
  "Git & GitHub": siGit,
  WordPress: siWordpress,
  Figma: siFigma,
  Vite: siVite,
  TypeScript: siTypescript,
};

function Marquee({ items }: { items: string[] }) {
  const technologies = Array.from(new Set(items)).filter((item) => TECHNOLOGY_MARKS[item]);
  if (!technologies.length) return null;
  return (
    <div className="overflow-hidden border-b border-border bg-card py-6">
      <div className="mx-auto mb-4 max-w-[1600px] px-4 text-xs font-bold uppercase text-muted-foreground sm:px-6 lg:px-8">
        Technologies & tools
      </div>
      <div className="flex w-max animate-marquee items-center">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center"
            aria-hidden={copy === 1 ? true : undefined}
          >
            {technologies.map((name) => {
              const mark = TECHNOLOGY_MARKS[name];
              return (
                <span
                  key={name}
                  className="mx-7 flex shrink-0 items-center gap-3 whitespace-nowrap text-sm font-semibold text-foreground/75 sm:mx-10 sm:text-base"
                >
                  {mark && (
                    <svg
                      role="img"
                      aria-label={`${name} logo`}
                      viewBox="0 0 24 24"
                      className="h-7 w-7 fill-primary sm:h-8 sm:w-8"
                    >
                      <path d={mark.path} />
                    </svg>
                  )}
                  {name}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-10"
    >
      <p className="flex items-center gap-3 text-sm font-semibold text-primary">
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-px w-10 origin-left bg-primary"
        />
        {eyebrow}
      </p>
      <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h2>
    </motion.div>
  );
}

function Work({ projects }: { projects: Project[] }) {
  const cats = useMemo(
    () => ["All", ...Array.from(new Set(projects.map((p) => p.category)))],
    [projects],
  );
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? projects : projects.filter((p) => p.category === cat);

  return (
    <section id="work" className="mx-auto max-w-[1600px] px-4 py-24 sm:px-6 lg:px-8">
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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p, i) => (
          <ProjectCard key={p.id} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const img = projectImage(p);
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
        whileHover={{ y: -6 }}
        className="group flex min-w-0 flex-col overflow-hidden rounded-md border border-border bg-card shadow-card transition-shadow duration-300 hover:shadow-xl"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
          {img && (
            <img
              src={img}
              alt={`${p.title} preview`}
              loading="lazy"
              decoding="async"
              width="480"
              height="300"
              className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
          )}
          {p.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-glass px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
              Featured
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-primary">{p.category}</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">{p.title}</h3>
            </div>
            {p.url && (
              <Button
                asChild
                variant="secondary"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full"
                title={`Visit ${p.title}`}
              >
                <a href={p.url} target="_blank" rel="noreferrer" aria-label={`Visit ${p.title}`}>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {p.description}
          </p>
          {p.description.length > 125 && (
            <Button
              variant="link"
              className="h-auto w-fit p-0 text-xs"
              onClick={() => setOpen(true)}
            >
              View more about {p.title}
            </Button>
          )}
          <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {p.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.article>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto rounded-md">
          <DialogHeader>
            <DialogTitle>{p.title}</DialogTitle>
            <DialogDescription>{p.category}</DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
            {p.description}
          </p>
          {p.url && (
            <Button asChild className="w-fit">
              <a href={p.url} target="_blank" rel="noreferrer">
                Visit project <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;

const gridStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const popIn: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
};
const chipStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.15 } },
};
const chipIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const isIntegrationGroup = (s: Skill) => /integrat/i.test(s.category);

function Skills() {
  const { data } = useQuery(portfolioQuery);
  if (!data) return null;
  const integrations = data.skills.find(isIntegrationGroup);
  const groups = data.skills.filter((s) => !isIntegrationGroup(s));
  return (
    <section id="skills" className="mx-auto max-w-[1600px] px-4 py-24 sm:px-6 lg:px-8">
      <SectionHead eyebrow="Toolkit" title="What I work with." />
      <motion.p
        {...fadeUp}
        className="mb-10 max-w-3xl text-lg leading-relaxed text-muted-foreground"
      >
        {data.profile?.summary}
      </motion.p>
      {integrations && integrations.items.length > 0 && <Integrations group={integrations} />}
      <motion.div
        variants={gridStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {groups.map((s) => (
          <motion.div
            key={s.id}
            variants={popIn}
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-card transition-colors duration-300 hover:border-primary/40"
          >
            <h3 className="font-semibold">{s.category}</h3>
            <motion.div variants={chipStagger} className="mt-4 flex flex-wrap gap-2">
              {s.items.map((it) => (
                <motion.span
                  key={it}
                  variants={chipIn}
                  className="rounded-xl bg-secondary px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {it}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/** Picks an icon for an integration item by keyword. */
function integrationIcon(label: string) {
  const l = label.toLowerCase();
  if (/trad|mt5|ctrader|broker/.test(l) && /autom/.test(l)) return Workflow;
  if (/trad|mt5|ctrader|broker/.test(l)) return CandlestickChart;
  if (/mail|smtp/.test(l)) return Mail;
  if (/\bai\b|agent|llm|gpt/.test(l)) return Bot;
  if (/voip|dial|call|phone|sip/.test(l)) return PhoneCall;
  if (/mobile|flutter|app/.test(l)) return Smartphone;
  if (/autom|workflow/.test(l)) return Workflow;
  if (/api/.test(l)) return Code2;
  return Plug;
}

/** "Label — detail" (also accepts " - " or ": "). */
function splitItem(item: string) {
  const m = item.match(/^(.+?)\s+(?:—|–|-)\s+(.+)$/) ?? item.match(/^(.+?):\s+(.+)$/);
  return m ? { label: m[1] ?? item, detail: m[2] ?? "" } : { label: item, detail: "" };
}

// Stretch the last card so the final row never has gaps (grid: 1/2/3/4 cols).
const SPAN = {
  sm: ["", "sm:col-span-1", "sm:col-span-2"],
  lg: ["", "lg:col-span-1", "lg:col-span-2", "lg:col-span-3"],
  xl: ["", "xl:col-span-1", "xl:col-span-2", "xl:col-span-3", "xl:col-span-4"],
} as const;
function lastSpan(n: number) {
  const span = (cols: number) => (n % cols === 0 ? 1 : cols - (n % cols) + 1);
  return `${SPAN.sm[span(2)]} ${SPAN.lg[span(3)]} ${SPAN.xl[span(4)]}`;
}

function Integrations({ group }: { group: Skill }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative mb-6 overflow-hidden rounded-[2rem] border border-primary/20 bg-card p-6 shadow-card sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-success/10 blur-3xl"
      />
      <div className="relative flex flex-wrap items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Plug className="h-5 w-5" />
        </span>
        <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{group.category}</h3>
      </div>
      <motion.ul
        variants={gridStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {group.items.map((item, index) => {
          const { label, detail } = splitItem(item);
          const isLast = index === group.items.length - 1;
          const Icon = integrationIcon(label);
          return (
            <motion.li
              key={item}
              variants={popIn}
              whileHover={{ y: -4 }}
              className={`${isLast ? lastSpan(group.items.length) : ""} group flex gap-3 rounded-2xl border border-border bg-background/70 p-4 backdrop-blur transition-colors duration-300 hover:border-primary/50 hover:bg-background`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold leading-snug">{label}</span>
                {detail && (
                  <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
                    {detail}
                  </span>
                )}
              </span>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.div>
  );
}

const bulletStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } },
};
const bulletIn: Variants = {
  hidden: { opacity: 0, x: 12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
};

const timelineCard: Variants = {
  hidden: { opacity: 0, x: 48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE } },
};
const timelineDot: Variants = {
  hidden: { scale: 0 },
  show: { scale: 1, transition: { type: "spring", stiffness: 400, damping: 18, delay: 0.15 } },
};

function TimelineItem({ dot, children }: { dot: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      variants={timelineCard}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="group relative"
    >
      <motion.span
        variants={timelineDot}
        className="absolute -left-[42px] top-7 z-10 flex h-5 w-5 items-center justify-center"
      >
        <span className="absolute inset-0 rounded-full bg-primary/40 opacity-0 group-hover:animate-ping group-hover:opacity-100" />
        <span className="relative flex h-5 w-5 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-125">
          {dot}
        </span>
      </motion.span>
      <div className="relative rounded-3xl border border-border bg-card p-6 shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:border-primary/40 group-hover:shadow-xl">
        <span
          aria-hidden
          className="absolute -left-2 top-8 h-4 w-4 rotate-45 border-b border-l border-border bg-card transition-colors duration-300 group-hover:border-primary/40"
        />
        {children}
      </div>
    </motion.div>
  );
}

function ExperienceSection() {
  const { data } = useQuery(portfolioQuery);
  const lineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 80%", "end 60%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 25, mass: 0.4 });
  if (!data) return null;
  return (
    <section id="experience" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHead eyebrow="Journey" title="Experience." />
      <div ref={lineRef} className="relative space-y-6 pl-8">
        <span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-border" />
        <motion.span
          aria-hidden
          style={{ scaleY: fill }}
          className="absolute bottom-0 left-0 top-0 w-0.5 -translate-x-[0.5px] origin-top rounded-full bg-gradient-to-b from-primary via-primary to-success"
        />
        {data.experiences.map((e) => (
          <TimelineItem
            key={e.id}
            dot={
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary ring-4 ring-background">
                <Briefcase className="h-2.5 w-2.5 text-primary-foreground" />
              </span>
            }
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold">
                {e.role} · <span className="text-primary">{e.company}</span>
              </h3>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary">
                {e.period}
              </span>
            </div>
            {e.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {e.location}
              </p>
            )}
            <motion.ul
              variants={bulletStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="mt-3 space-y-1.5 text-sm text-muted-foreground"
            >
              {e.bullets.map((b, i) => (
                <motion.li key={i} variants={bulletIn} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-150" />
                  {b}
                </motion.li>
              ))}
            </motion.ul>
          </TimelineItem>
        ))}
        {data.education.map((ed) => (
          <TimelineItem
            key={ed.id}
            dot={
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground ring-4 ring-background">
                <GraduationCap className="h-2.5 w-2.5 text-background" />
              </span>
            }
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">{ed.degree}</h3>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary">
                {ed.year}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{ed.school}</p>
          </TimelineItem>
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
    if (!r.success) {
      toast.error(r.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    const text = `Hi Kailash! 👋\n\nName: ${r.data.name}\nEmail: ${r.data.email}\n\n${r.data.message}`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    toast.success("Opening WhatsApp - just hit send!");
    setForm({ name: "", email: "", message: "" });
  };

  const field =
    "w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring";

  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        {...fadeUp}
        className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-card sm:p-12"
      >
        <div className="absolute inset-0 bg-hero opacity-60" aria-hidden />
        <div className="relative grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-primary">Contact</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight">Let's build something great.</h2>
            <p className="mt-4 text-muted-foreground">
              Send a message and it lands straight in my WhatsApp. I usually reply within a few
              hours.
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 hover:text-primary"
              >
                <MessageCircle className="h-4 w-4 text-success" />
                {p?.phone}
              </a>
              <a href={`mailto:${p?.email}`} className="flex items-center gap-3 hover:text-primary">
                <Mail className="h-4 w-4 text-primary" />
                {p?.email}
              </a>
              <p className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                {p?.location}
              </p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <input
              className={field}
              placeholder="Your name"
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className={field}
              placeholder="Email address"
              type="email"
              maxLength={255}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <textarea
              className={`${field} min-h-36 resize-none`}
              placeholder="Tell me about your project…"
              maxLength={1000}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <Button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold"
            >
              <Send className="h-4 w-4" /> Send via WhatsApp
            </Button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
