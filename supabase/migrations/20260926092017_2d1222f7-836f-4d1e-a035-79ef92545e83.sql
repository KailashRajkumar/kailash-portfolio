create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.handle_first_admin() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users for each row execute function public.handle_first_admin();

create table public.profile (
  id int primary key default 1 check (id = 1),
  name text not null default '', title text not null default '', tagline text not null default '', summary text not null default '',
  location text not null default '', email text not null default '', phone text not null default '', whatsapp text not null default '',
  linkedin text not null default '', github text not null default '', avatar_url text, resume_url text,
  updated_at timestamptz not null default now()
);
create table public.skills (id uuid primary key default gen_random_uuid(), category text not null, items text[] not null default '{}', sort_order int not null default 0);
create table public.experiences (id uuid primary key default gen_random_uuid(), role text not null, company text not null, period text not null default '', location text not null default '', bullets text[] not null default '{}', sort_order int not null default 0);
create table public.projects (id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', category text not null default 'Web', tags text[] not null default '{}', url text, image_url text, featured boolean not null default false, sort_order int not null default 0);
create table public.education (id uuid primary key default gen_random_uuid(), degree text not null, school text not null default '', year text not null default '', sort_order int not null default 0);

do $$ declare t text; begin
  foreach t in array array['profile','skills','experiences','projects','education'] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;

create policy "portfolio read" on storage.objects for select using (bucket_id='portfolio');
create policy "portfolio admin write" on storage.objects for insert to authenticated with check (bucket_id='portfolio' and public.has_role(auth.uid(),'admin'));
create policy "portfolio admin update" on storage.objects for update to authenticated using (bucket_id='portfolio' and public.has_role(auth.uid(),'admin'));
create policy "portfolio admin delete" on storage.objects for delete to authenticated using (bucket_id='portfolio' and public.has_role(auth.uid(),'admin'));

insert into public.profile (name,title,tagline,summary,location,email,phone,whatsapp,linkedin,github) values (
 'Kailash Rajkumar','Full Stack Developer','I build fintech platforms, trading infrastructure and fast, beautiful web apps.',
 'Full Stack Developer building responsive, high-performance web applications with React, Laravel, Python and Tailwind CSS. At Bridging FX I deliver complete fintech products - broker CRMs, admin dashboards, a B2B marketplace and event platforms - and own the full delivery flow from hosting and DNS to databases and integrations. I also build trading infrastructure in Python, including an MT5 bridge and prop-firm rule-enforcement services, and use powerful AI models, technical knowledge, and integrations to ship faster.',
 'Karama, Dubai, UAE','kailashrajkumar14@gmail.com','+971 52 663 5447','971526635447','https://linkedin.com/in/kailash-rajkumar','https://github.com/KailashRajkumar');

insert into public.skills (category,items,sort_order) values
('Front End', array['React.js','JavaScript (ES6+)','Tailwind CSS','Bootstrap 5','Material UI','GSAP','Vite','HTML5','CSS3','Laravel Blade'],1),
('Back End & Data', array['Laravel','Python','REST APIs','PostgreSQL','MySQL','MongoDB','Authentication','Admin Dashboards / CRM'],2),
('Trading Infrastructure', array['MT5 Bridge','Prop-Firm Rule Engine','White-Label Broker Platforms','Remote Server Ops'],3),
('Hosting & DevOps', array['cPanel','WHM','DNS & Domains','Database Provisioning','Git & GitHub','CI/CD'],4),
('AI', array['Powerful AI Models','Prompt Engineering','AI Integrations','AI CRM Plugins'],5),
('Mobile', array['Flutter','React Native'],6),
('CMS & Tools', array['WordPress','Wix Studio','Base44','Figma'],7);

insert into public.experiences (role,company,period,location,bullets,sort_order) values
('Full Stack Developer','Bridging FX Limited','Aug 2025 - Present','Dubai, UAE', array['Built React + Laravel web apps, lifting engagement on client dashboards by 25%.','Maintained admin dashboards and client interfaces serving 500+ daily active users.','Cut page load times by 30% with modern Tailwind and Bootstrap UI.','Run hosting via cPanel/WHM: DNS, SSL, email and per-client PostgreSQL/MySQL provisioning.','Delivered 10+ production websites and platforms on schedule.'],1),
('Freelance Web Developer','Self-employed','2025 - Present','Remote', array['WordPress site for MNV Associates and single-page corporate sites for Aji Internationals and KandyDGhana.'],2),
('Software Developer Intern','Pixalive Technology Services','Oct 2023 - Mar 2024','Bengaluru, India', array['Built React UI components for MasterIn, Pixalive Web Services and Guide Care.','Handled Figma-to-code handoff and API/MongoDB integrations.'],3),
('Engineering Intern - Full Stack','Skill-Lync','Nov 2022 - Feb 2023','Remote', array['Built a streaming-platform clone, a TMDB movie app and an expense tracker with React and MongoDB.'],4);

insert into public.education (degree,school,year,sort_order) values
('MSc, Computer Science','Hindusthan College of Arts and Science, Coimbatore','2022',1),
('BSc, Computer Science','Valluvar College of Science and Management, Karur','2019',2);

insert into public.projects (title,description,category,tags,url,featured,sort_order) values
('BridgeX Platform','Broker CRM with purchasable modules; every broker runs on a dedicated PostgreSQL database. Responsive workspace UI with secure routing and dynamic content.','Fintech',array['React','Laravel','PostgreSQL'],'https://bridgexsuite.com',true,1),
('BridgeX Suite Client App','Cross-platform client application for the BridgeX Suite, built with Flutter.','Mobile',array['Flutter','Dart','Mobile'],'https://bridgexapps.com',true,2),
('TrilliFX','Broker website and client experience for TrilliFX.','Fintech',array['React','Tailwind'],'https://trillifx.com',true,3),
('FundedFly','Prop-firm platform website with challenge plans and trader onboarding.','Fintech',array['React','Prop Firm'],'https://fundedfly.com',true,4),
('Libert Markets','Broker marketing website with secure client-portal routing.','Fintech',array['Web','Broker'],'https://libertmarkets.org',true,5),
('ProFX Summit & Expos','Event platforms with admin CRM, SVG floor plans with seat reservation, registration tracking and ticketing.','Events',array['React','Laravel','SVG'],'https://profxsummit.com',true,6),
('Finxcart','Multi-vendor B2B fintech marketplace with vendor and customer portals, multi-currency and multi-language.','Fintech',array['Laravel','Marketplace'],'https://finxcart.com',false,7),
('Trading Infrastructure','Prop-firm rule-enforcement services in Python and an MT5 bridge powering white-label broker portals.','Fintech',array['Python','MT5'],'https://secure.leveragemarkets.com',false,8),
('Leverage Markets','Responsive broker marketing website.','Fintech',array['Web'],'https://leveragemarkets.com',false,9),
('StoxPips','Responsive broker marketing website.','Fintech',array['Web'],'https://stoxpips.com',false,10),
('Bridging FX','Corporate website with dynamic content management.','Corporate',array['Laravel'],'https://bridgingfx.com',false,11),
('Bridging FX Academy','Learning management system for trading education.','Education',array['LMS'],'https://bridgingfxacademy.com',false,12),
('MNV Associates','WordPress business website with custom theme.','Freelance',array['WordPress'],'https://mnvassociates.com',false,13),
('Aji Internationals','Animated single-page corporate site with secure contact form.','Freelance',array['Bootstrap','JS'],'https://ajiinternational.com',false,14),
('KandyDGhana','Lifestyle and fashion brand site with GSAP animations and TradingView ticker.','Freelance',array['GSAP'],'https://kandydghana.com',false,15);
