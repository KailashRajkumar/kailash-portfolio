import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type T = Database["public"]["Tables"];
export type Profile = T["profile"]["Row"];
export type Skill = T["skills"]["Row"];
export type Experience = T["experiences"]["Row"];
export type Project = T["projects"]["Row"];
export type Education = T["education"]["Row"];

export async function fetchPortfolio() {
  const [profile, skills, experiences, projects, education] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).maybeSingle(),
    supabase.from("skills").select("*").order("sort_order"),
    supabase.from("experiences").select("*").order("sort_order"),
    supabase.from("projects").select("*").order("sort_order"),
    supabase.from("education").select("*").order("sort_order"),
  ]);
  return {
    profile: profile.data,
    skills: skills.data ?? [],
    experiences: experiences.data ?? [],
    projects: projects.data ?? [],
    education: education.data ?? [],
  };
}

export const portfolioQuery = queryOptions({
  queryKey: ["portfolio"],
  queryFn: fetchPortfolio,
});

export function projectImage(p: Pick<Project, "image_url" | "url">) {
  if (p.image_url) return p.image_url;
  if (p.url) return `https://s0.wp.com/mshots/v1/${encodeURIComponent(p.url)}?w=1200&h=760`;
  return null;
}
