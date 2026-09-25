import { getSupabaseAdmin } from './supabase';
import { fallbackPages, fallbackProjects } from './fallback';

export async function getPublishedProjects() {
  const sb = getSupabaseAdmin();
  if (!sb) return fallbackProjects;
  const { data, error } = await sb.from('projects').select('*').eq('status', 'published').order('sort_order');
  if (error || !data?.length) return fallbackProjects;
  return data;
}

export async function getPublishedPage(slug) {
  const fallback = fallbackPages[slug] || null;
  const sb = getSupabaseAdmin();
  if (!sb) return fallback;
  const { data: page, error } = await sb.from('pages').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
  if (error || !page) return fallback;
  const { data: sections } = await sb.from('page_sections').select('*').eq('page_id', page.id).eq('is_visible', true).order('position');
  return { ...page, sections: sections || [] };
}

export async function getPublishedProject(slug) {
  const fallback = fallbackProjects.find(x => x.slug === slug);
  const sb = getSupabaseAdmin();
  if (!sb) return fallback ? { ...fallback, page: null, sections: [] } : null;
  const { data: project } = await sb.from('projects').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
  if (!project) return fallback ? { ...fallback, page: null, sections: [] } : null;
  let page = null, sections = [];
  if (project.page_id) {
    const { data: p } = await sb.from('pages').select('*').eq('id', project.page_id).maybeSingle();
    page = p;
    const { data: s } = await sb.from('page_sections').select('*').eq('page_id', project.page_id).eq('is_visible', true).order('position');
    sections = s || [];
  }
  return { ...project, page, sections };
}

export async function getMediaMap() {
  const sb = getSupabaseAdmin();
  if (!sb) return {};
  const { data } = await sb.from('media_assets').select('*').order('created_at', { ascending: false });
  return Object.fromEntries((data || []).map(m => [m.id, m]));
}

export async function getAdminState() {
  const sb = getSupabaseAdmin();
  if (!sb) return { configured: false, pages: [], sections: [], projects: [], media: [], settings: [] };
  const [pages, sections, projects, media, settings] = await Promise.all([
    sb.from('pages').select('*').order('sort_order'),
    sb.from('page_sections').select('*').order('position'),
    sb.from('projects').select('*').order('sort_order'),
    sb.from('media_assets').select('*').order('created_at', { ascending: false }),
    sb.from('site_settings').select('*').order('key')
  ]);
  return {
    configured: true,
    pages: pages.data || [], sections: sections.data || [], projects: projects.data || [], media: media.data || [], settings: settings.data || []
  };
}
