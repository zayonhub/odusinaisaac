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

-- Public media is intentionally CDN-readable. Upload/delete still happens through signed admin operations.
insert into storage.buckets (id,name,public,file_size_limit)
values ('portfolio-media','portfolio-media',true,104857600)
on conflict (id) do update set public=true, file_size_limit=104857600;

-- Seed the existing homepage only when the new CMS is empty.
do $$
declare home_id uuid;
begin
  if not exists (select 1 from public.pages) then
    insert into public.pages(title,slug,page_type,status,seo_title,seo_description,is_homepage,sort_order,published_at)
    values ('Home','home','landing','published','Brand Identity & Visual Designer | Odusina Isaac','Brand identity, packaging, campaigns and digital design by Odusina Isaac.',true,10,now())
    returning id into home_id;

    insert into public.page_sections(page_id,type,variant,position,content) values
    (home_id,'hero','editorial',10,jsonb_build_object(
      'eyebrow','Brand Identity & Visual Designer','title','I make brands look impossible to ignore.',
      'body','I help ambitious businesses turn ideas into distinctive identity systems, packaging, campaigns and digital experiences built to communicate clearly and compete confidently.',
      'primary_label','Explore selected work ↗','primary_url','/work','secondary_label','Get in touch','secondary_url','/contact',
      'media_url','https://raw.githubusercontent.com/zayonhub/odusinaisaac/main/assets/odusina-isaac-headshot.jpg')),
    (home_id,'project_grid','editorial',20,jsonb_build_object('heading','Selected work. Specific decisions.','intro','Explore the brief, the artwork and the thinking behind each selected project.','limit',6)),
    (home_id,'rich_text','split',30,jsonb_build_object('heading','Design for the real world.','body','I’m Odusina Isaac, a graphic and brand identity designer based in Nigeria, with 7+ years across identity, packaging, campaigns and digital work. I work independently and through Zayon Creative Studios, connecting visual design with the practical demands of screens, print and production.')),
    (home_id,'cta','wine',40,jsonb_build_object('eyebrow','Let’s work together','title','A project. A team. A new possibility.','button_label','Start a conversation ↗','button_url','/contact'));

    insert into public.projects(title,slug,category,summary,role,cover_url,status,featured,sort_order) values
    ('Wingate Exotic Hotel','wingate-exotic-hotel','Hospitality campaigns','Room offers translated into clear, image-led hotel promotions.','Graphic design · Promotional artwork','https://raw.githubusercontent.com/zayonhub/odusinaisaac/main/assets/portfolio/social-media/wingate-exotic-hotel/wingate-january-promo.webp','published',true,10),
    ('Yellow Yolk Feeds','yellow-yolk-feeds','Feed packaging','Feed-sack artwork balancing brand recognition and product information.','Packaging design · Visual direction','https://raw.githubusercontent.com/zayonhub/odusinaisaac/main/assets/portfolio/packaging/yellow-yolk-feeds/yellow-yolk-feeds-bag-a.webp','published',true,20),
    ('Foot Impact','foot-impact','Public-health identity','A compact identity shown across light and dark backgrounds.','Brand identity · Graphic design','https://raw.githubusercontent.com/zayonhub/odusinaisaac/main/assets/portfolio/branding/foot-impact/foot-impact-logo.webp','published',true,30);
  end if;
end $$;

insert into public.site_settings(key,value) values
('site_name','"Odusina Isaac"'::jsonb),('accent_color','"#7A1F3D"'::jsonb)
on conflict (key) do nothing;
