DROP POLICY "visible projects or admin read" ON public.projects;
CREATE POLICY "public active projects read" ON public.projects FOR SELECT TO anon USING (active);
CREATE POLICY "signed-in active or admin projects read" ON public.projects FOR SELECT TO authenticated USING (active OR public.has_role(auth.uid(), 'admin'));