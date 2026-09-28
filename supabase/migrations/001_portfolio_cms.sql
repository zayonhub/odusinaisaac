-- Portfolio CMS v1
-- Run once in the Supabase SQL editor used by the portfolio.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  page_type text not null default 'standard',
  status text not null default 'draft' check (status in ('draft','published')),
  seo_title text default '',
  seo_description text default '',
  og_image_id uuid,
  is_homepage boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create unique index if not exists pages_one_homepage on public.pages (is_homepage) where is_homepage = true;
drop trigger if exists pages_updated_at on public.pages;
create trigger pages_updated_at before update on public.pages for each row execute function public.set_updated_at();

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  type text not null,
  variant text not null default 'default',
  position integer not null default 100,
  content jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists page_sections_page_position on public.page_sections(page_id,position);
drop trigger if exists page_sections_updated_at on public.page_sections;
create trigger page_sections_updated_at before update on public.page_sections for each row execute function public.set_updated_at();

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  storage_path text not null unique,
  public_url text not null,
  mime_type text,
  file_size bigint,
  width integer,
  height integer,
  alt_text text default '',
  caption text default '',
  folder text default 'portfolio',
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists media_assets_updated_at on public.media_assets;
create trigger media_assets_updated_at before update on public.media_assets for each row execute function public.set_updated_at();

alter table public.pages drop constraint if exists pages_og_image_id_fkey;
alter table public.pages add constraint pages_og_image_id_fkey foreign key (og_image_id) references public.media_assets(id) on delete set null;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.pages(id) on delete cascade,
  title text not null,
  slug text not null unique,
  category text default '',
  industry text default '',
  year text default '',
  role text default '',
  services text[] not null default '{}',
  summary text default '',
  challenge text default '',
  approach text default '',
  outcome text default '',
  cover_media_id uuid references public.media_assets(id) on delete set null,
  cover_url text default '',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists projects_page_unique on public.projects(page_id) where page_id is not null;
drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now()
);
drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

create table if not exists public.page_revisions (
  id bigserial primary key,
  page_id uuid not null references public.pages(id) on delete cascade,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists page_revisions_page_date on public.page_revisions(page_id,created_at desc);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  position integer not null default 100,
  is_visible boolean not null default true
);

-- The Next.js server uses the service-role key. Browser clients receive no database write key.
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.projects enable row level security;
alter table public.media_assets enable row level security;
alter table public.site_settings enable row level security;
alter table public.page_revisions enable row level security;
alter table public.navigation_items enable row level security;

-- Portfolio files are public for CDN delivery; mutation is performed through signed/server operations.
insert into storage.buckets (id,name,public,file_size_limit)
values ('portfolio-media','portfolio-media',true,104857600)
on conflict (id) do update set public=true, file_size_limit=104857600;

-- Seed the current portfolio only when the CMS has no pages yet.
do $$
declare
  home_id uuid;
  work_id uuid;
  about_id uuid;
  experience_id uuid;
  contact_id uuid;
begin
  if not exists (select 1 from public.pages) then
    insert into public.pages(title,slug,page_type,status,seo_title,seo_description,is_homepage,sort_order,published_at)
    values ('Home','home','landing','published','Brand Identity & Visual Designer | Odusina Isaac','Brand identity, packaging, campaigns and digital design by Odusina Isaac.',true,10,now())
    returning id into home_id;

    insert into public.pages(title,slug,page_type,status,seo_title,seo_description,sort_order,published_at) values
    ('Work','work','standard','published','Selected work | Odusina Isaac','Explore identity, packaging, campaign and web projects.',20,now()) returning id into work_id;
    insert into public.pages(title,slug,page_type,status,seo_title,seo_description,sort_order,published_at) values
    ('About','about','standard','published','About | Odusina Isaac','Meet Odusina Isaac, graphic and brand identity designer.',30,now()) returning id into about_id;
    insert into public.pages(title,slug,page_type,status,seo_title,seo_description,sort_order,published_at) values
    ('Experience','experience','standard','published','Experience & skills | Odusina Isaac','Professional profile, capabilities and tools for hiring teams.',40,now()) returning id into experience_id;
    insert into public.pages(title,slug,page_type,status,seo_title,seo_description,sort_order,published_at) values
    ('Contact','contact','standard','published','Contact | Odusina Isaac','Discuss a design project or professional opportunity with Odusina Isaac.',50,now()) returning id into contact_id;

    insert into public.page_sections(page_id,type,variant,position,content) values
    (home_id,'hero','editorial',10,jsonb_build_object(
      'eyebrow','Brand Identity & Visual Designer','title','I make brands look impossible to ignore.',
      'body','I help ambitious businesses turn ideas into distinctive identity systems, packaging, campaigns and digital experiences built to communicate clearly and compete confidently.',
      'primary_label','Explore selected work ↗','primary_url','/work','secondary_label','Get in touch','secondary_url','/contact',
      'media_url','https://raw.githubusercontent.com/zayonhub/odusinaisaac/main/assets/odusina-isaac-headshot.jpg')),
    (home_id,'project_grid','editorial',20,jsonb_build_object('heading','Selected work. Specific decisions.','intro','Explore the brief, the artwork and the thinking behind each selected project.','limit',6)),
    (home_id,'rich_text','split',30,jsonb_build_object('heading','Design for the real world.','body','I’m Odusina Isaac, a graphic and brand identity designer based in Nigeria, with 7+ years across identity, packaging, campaigns and digital work. I work independently and through Zayon Creative Studios, connecting visual design with the practical demands of screens, print and production.')),
    (home_id,'cta','wine',40,jsonb_build_object('eyebrow','Let’s work together','title','A project. A team. A new possibility.','button_label','Start a conversation ↗','button_url','/contact')),

    (work_id,'rich_text','intro',10,jsonb_build_object('heading','Work with context.','body','A focused collection of design work, with clear scope and a closer look at each application.')),
    (work_id,'project_grid','editorial',20,jsonb_build_object('heading','Selected projects','intro','Identity, packaging, campaigns and digital work presented with context.','limit',12)),
    (work_id,'cta','wine',30,jsonb_build_object('eyebrow','Let’s work together','title','A project. A team. A new possibility.','button_label','Start a conversation ↗','button_url','/contact')),

    (about_id,'hero','editorial',10,jsonb_build_object('eyebrow','About the designer','title','Thoughtful design. Practical experience.','body','Based in Nigeria. Working with businesses, organisations and creative teams.','media_url','https://raw.githubusercontent.com/zayonhub/odusinaisaac/main/assets/odusina-isaac-headshot.jpg','primary_label','Experience & skills','primary_url','/experience','secondary_label','Get in touch','secondary_url','/contact')),
    (about_id,'rich_text','split',20,jsonb_build_object('heading','About my practice','body',E'I’m Odusina Isaac, a graphic and web designer with more than seven years of experience. My practice spans brand identity, packaging, promotional communication and WordPress websites.\n\nThrough independent projects and Zayon Creative Studios, I work across digital and physical formats. My production experience informs how I think about layout, materials, legibility and handoff.\n\nI also contribute design support to public-health initiatives, including Foot Impact.')),
    (about_id,'rich_text','process',30,jsonb_build_object('heading','How I work','body',E'Understand\nClarify the audience, message, deliverables and practical constraints.\n\nDesign\nDevelop the visual direction and refine its hierarchy, typography and application.\n\nDeliver\nPrepare the work for the screen, print format or production setting where it will be used.')),
    (about_id,'cta','wine',40,jsonb_build_object('eyebrow','Let’s work together','title','A project. A team. A new possibility.','button_label','Start a conversation ↗','button_url','/contact')),

    (experience_id,'rich_text','intro',10,jsonb_build_object('heading','Experience & skills.','body','Odusina Isaac Imoleayo · Graphic Designer & Brand Identity Designer')),
    (experience_id,'rich_text','reading',20,jsonb_build_object('heading','Professional profile','body',E'Designer with 7+ years of experience across brand identity, packaging, campaigns, production artwork and web design. Based in Nigeria, working independently and through Zayon Creative Studios.\n\nAreas of contribution\nBrand identity: logos, visual assets and applications.\nPackaging and print: labels, sacks, promotional material and production artwork.\nCampaigns: social graphics, promotional layouts and email artwork.\nWeb: WordPress websites and interface design.\n\nTools\nPhotoshop, CorelDRAW, Figma, Canva, WordPress, Premiere Pro and CapCut.\n\nSelected project experience\nWingate Exotic Hotel: promotional design.\nYellow Yolk Feeds: packaging design.\nFoot Impact: identity and public-health design support.\nSparkles Packaging: identity design.\n\nEducation\nDiploma in Computer Science, Kwara State Polytechnic, 2016.\nBSc Computer Science, National Open University of Nigeria, in view.\n\nOpportunities\nAvailable to discuss design roles, project engagements and creative collaborations.')),
    (experience_id,'cta','wine',30,jsonb_build_object('eyebrow','Professional opportunities','title','Discuss a role or project.','button_label','Get in touch ↗','button_url','/contact')),

    (contact_id,'hero','editorial',10,jsonb_build_object('eyebrow','Contact','title','Let’s talk about what comes next.','body','For design projects, team opportunities and creative collaborations.','primary_label','Connect on LinkedIn ↗','primary_url','https://www.linkedin.com/in/odusina-isaac/','secondary_label','X / Twitter ↗','secondary_url','https://x.com/isaacodusina')),
    (contact_id,'rich_text','split',20,jsonb_build_object('heading','Two ways to start','body',E'Commission a project\nTell me about your business, the deliverables you need, your intended timeline and any production requirements.\n\nDiscuss a role\nShare the role, team, working arrangement and the type of design challenges you need help with.\n\nNigeria · Working globally'));

    insert into public.projects(title,slug,category,summary,role,cover_url,status,featured,sort_order) values
    ('Wingate Exotic Hotel','wingate-exotic-hotel','Hospitality campaigns','Room offers translated into clear, image-led hotel promotions.','Graphic design · Promotional artwork','https://raw.githubusercontent.com/zayonhub/odusinaisaac/main/assets/portfolio/social-media/wingate-exotic-hotel/wingate-january-promo.webp','published',true,10),
    ('Yellow Yolk Feeds','yellow-yolk-feeds','Feed packaging','Feed-sack artwork balancing brand recognition and product information.','Packaging design · Visual direction','https://raw.githubusercontent.com/zayonhub/odusinaisaac/main/assets/portfolio/packaging/yellow-yolk-feeds/yellow-yolk-feeds-bag-a.webp','published',true,20),
    ('Foot Impact','foot-impact','Public-health identity','A compact identity shown across light and dark backgrounds.','Brand identity · Graphic design','https://raw.githubusercontent.com/zayonhub/odusinaisaac/main/assets/portfolio/branding/foot-impact/foot-impact-logo.webp','published',true,30),
    ('Sparkles Packaging','sparkles-packaging','Logo study','An expressive symbol for a packaging business.','Brand identity · Graphic design','https://raw.githubusercontent.com/zayonhub/odusinaisaac/main/assets/portfolio/branding/sparkles-packaging/sparkles-logo-c.webp','published',false,40),
    ('Foot Impact website','foot-impact-web','Digital / Public health','Bringing a public-health identity into a live web presence.','Web design · Implementation','https://raw.githubusercontent.com/zayonhub/odusinaisaac/main/assets/portfolio/branding/foot-impact/foot-impact-logo.webp','published',false,50);

    insert into public.navigation_items(label,url,position,is_visible) values
    ('Work','/work',10,true),('About','/about',20,true),('Experience','/experience',30,true),('Contact','/contact',40,true);
  end if;
end $$;

insert into public.site_settings(key,value) values
('site_name','"Odusina Isaac"'::jsonb),('accent_color','"#7A1F3D"'::jsonb)
on conflict (key) do nothing;
