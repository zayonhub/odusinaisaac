-- Backfill all existing portfolio copy into the isolated CMS tables.
-- This migration is intentionally idempotent so it can be re-run safely.

begin;

update public.cms_page_sections s
set content = s.content || jsonb_build_object(
  'primary_label','Experience & skills',
  'primary_url','/experience',
  'secondary_label','Get in touch',
  'secondary_url','/contact'
)
from public.cms_pages p
where s.page_id=p.id and p.slug='about' and s.type='hero' and s.position=10;

update public.cms_page_sections s
set content = s.content || jsonb_build_object(
  'secondary_label','X / Twitter ↗',
  'secondary_url','https://x.com/isaacodusina'
)
from public.cms_pages p
where s.page_id=p.id and p.slug='contact' and s.type='hero' and s.position=10;

insert into public.cms_page_sections (page_id,type,variant,position,content,settings,is_visible)
select p.id,'cta','wine',30,
  '{"eyebrow":"Let’s work together","title":"A project. A team. A new possibility.","button_label":"Start a conversation ↗","button_url":"/contact"}'::jsonb,
  '{}'::jsonb,true
from public.cms_pages p
where p.slug='work'
  and not exists (select 1 from public.cms_page_sections s where s.page_id=p.id and s.position=30);

insert into public.cms_page_sections (page_id,type,variant,position,content,settings,is_visible)
select p.id,'rich_text','split',20,
  jsonb_build_object(
    'heading','About my practice',
    'body',E'I’m Odusina Isaac, a graphic and web designer with more than seven years of experience. My practice spans brand identity, packaging, promotional communication and WordPress websites.\n\nThrough independent projects and Zayon Creative Studios, I work across digital and physical formats. My production experience informs how I think about layout, materials, legibility and handoff.\n\nI also contribute design support to public-health initiatives, including Foot Impact.'
  ),
  '{}'::jsonb,true
from public.cms_pages p
where p.slug='about'
  and not exists (select 1 from public.cms_page_sections s where s.page_id=p.id and s.position=20);

insert into public.cms_page_sections (page_id,type,variant,position,content,settings,is_visible)
select p.id,'rich_text','process',30,
  jsonb_build_object(
    'heading','How I work',
    'body',E'Understand\nClarify the audience, message, deliverables and practical constraints.\n\nDesign\nDevelop the visual direction and refine its hierarchy, typography and application.\n\nDeliver\nPrepare the work for the screen, print format or production setting where it will be used.'
  ),
  '{}'::jsonb,true
from public.cms_pages p
where p.slug='about'
  and not exists (select 1 from public.cms_page_sections s where s.page_id=p.id and s.position=30);

insert into public.cms_page_sections (page_id,type,variant,position,content,settings,is_visible)
select p.id,'cta','wine',40,
  '{"eyebrow":"Let’s work together","title":"A project. A team. A new possibility.","button_label":"Start a conversation ↗","button_url":"/contact"}'::jsonb,
  '{}'::jsonb,true
from public.cms_pages p
where p.slug='about'
  and not exists (select 1 from public.cms_page_sections s where s.page_id=p.id and s.position=40);

insert into public.cms_page_sections (page_id,type,variant,position,content,settings,is_visible)
select p.id,'rich_text','reading',20,
  jsonb_build_object(
    'heading','Professional profile',
    'body',E'Designer with 7+ years of experience across brand identity, packaging, campaigns, production artwork and web design. Based in Nigeria, working independently and through Zayon Creative Studios.\n\nAreas of contribution\nBrand identity: logos, visual assets and applications.\nPackaging and print: labels, sacks, promotional material and production artwork.\nCampaigns: social graphics, promotional layouts and email artwork.\nWeb: WordPress websites and interface design.\n\nTools\nPhotoshop, CorelDRAW, Figma, Canva, WordPress, Premiere Pro and CapCut.\n\nSelected project experience\nWingate Exotic Hotel: promotional design.\nYellow Yolk Feeds: packaging design.\nFoot Impact: identity and public-health design support.\nSparkles Packaging: identity design.\n\nEducation\nDiploma in Computer Science, Kwara State Polytechnic, 2016.\nBSc Computer Science, National Open University of Nigeria, in view.\n\nOpportunities\nAvailable to discuss design roles, project engagements and creative collaborations.'
  ),
  '{}'::jsonb,true
from public.cms_pages p
where p.slug='experience'
  and not exists (select 1 from public.cms_page_sections s where s.page_id=p.id and s.position=20);

insert into public.cms_page_sections (page_id,type,variant,position,content,settings,is_visible)
select p.id,'cta','wine',30,
  '{"eyebrow":"Professional opportunities","title":"Discuss a role or project.","button_label":"Get in touch ↗","button_url":"/contact"}'::jsonb,
  '{}'::jsonb,true
from public.cms_pages p
where p.slug='experience'
  and not exists (select 1 from public.cms_page_sections s where s.page_id=p.id and s.position=30);

insert into public.cms_page_sections (page_id,type,variant,position,content,settings,is_visible)
select p.id,'rich_text','split',20,
  jsonb_build_object(
    'heading','Two ways to start',
    'body',E'Commission a project\nTell me about your business, the deliverables you need, your intended timeline and any production requirements.\n\nDiscuss a role\nShare the role, team, working arrangement and the type of design challenges you need help with.\n\nNigeria · Working globally'
  ),
  '{}'::jsonb,true
from public.cms_pages p
where p.slug='contact'
  and not exists (select 1 from public.cms_page_sections s where s.page_id=p.id and s.position=20);

insert into public.cms_pages (title,slug,page_type,status,seo_title,seo_description,sort_order,is_homepage,published_at)
select pr.title,'projects/'||pr.slug,'project',pr.status,pr.title,coalesce(pr.summary,''),pr.sort_order,false,
       case when pr.status='published' then now() else null end
from public.cms_projects pr
where pr.page_id is null
  and not exists (select 1 from public.cms_pages p where p.slug='projects/'||pr.slug);

update public.cms_projects pr
set page_id=p.id
from public.cms_pages p
where pr.page_id is null and p.slug='projects/'||pr.slug;

insert into public.cms_page_sections (page_id,type,variant,position,content,settings,is_visible)
select p.id,'hero','editorial',10,
  jsonb_strip_nulls(jsonb_build_object(
    'eyebrow',nullif(pr.category,''),
    'title',pr.title,
    'body',pr.summary,
    'media_url',nullif(pr.cover_url,'')
  )),
  '{}'::jsonb,true
from public.cms_projects pr
join public.cms_pages p on p.id=pr.page_id
where not exists (select 1 from public.cms_page_sections s where s.page_id=p.id);

commit;
