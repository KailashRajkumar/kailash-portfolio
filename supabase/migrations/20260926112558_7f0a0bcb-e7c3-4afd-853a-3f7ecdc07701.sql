ALTER TABLE public.projects ADD COLUMN active boolean NOT NULL DEFAULT true;
DROP POLICY "public read" ON public.projects;
CREATE POLICY "visible projects or admin read" ON public.projects FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(), 'admin'));