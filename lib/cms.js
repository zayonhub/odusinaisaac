import { getSupabaseAdmin, getSupabaseReader } from './supabase';
import { fallbackPages, fallbackProjects } from './fallback';

const MEDIA_PAGE_SIZE = 1000;

async function getAllMedia(sb, select = '*') {
  const rows = [];
  let from = 0;

  while (true) {
    const { data, error } = await sb
      .from('media_assets')
      .select(select)
      .order('created_at', { ascending: false })
      .range(from, from + MEDIA_PAGE_SIZE - 1);

    if (error) return { data: rows, error };
    const batch = data || [];
    rows.push(...batch);

    if (batch.length < MEDIA_PAGE_SIZE) break;
    from += MEDIA_PAGE_SIZE;
  }

  return { data: rows, error: null };
}

export async function getPublishedProjects() {
  const sb = getSupabaseReader();
  const { data, error } = await sb.from('projects').select('*').eq('status', 'published').order('sort_order');
  if (error || !data?.length) return fallbackProjects;
  return data;
}

export async function getPublishedPage(slug) {
  const fallback = fallbackPages[slug] || null;
  const sb = getSupabaseReader();
  const { data: page, error } = await sb.from('pages').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
  if (error || !page) return fallback;
  const { data: sections, error: sectionError } = await sb.from('page_sections').select('*').eq('page_id', page.id).eq('is_visible', true).order('position');
  if (sectionError) return fallback || { ...page, sections: [] };
  return { ...page, sections: sections || [] };
}

export async function getPublishedProject(slug) {
  const fallback = fallbackProjects.find(x => x.slug === slug);
  const sb = getSupabaseReader();
  const { data: project, error } = await sb.from('projects').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
  if (error || !project) return fallback ? { ...fallback, page: null, sections: [] } : null;
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
  const sb = getSupabaseReader();
  const { data, error } = await getAllMedia(sb, 'id,public_url,alt_text,caption,created_at');
  if (error) return {};
  return Object.fromEntries((data || []).map(m => [m.id, m]));
}

export async function getAdminState() {
  const admin = getSupabaseAdmin();
  const reader = getSupabaseReader();
  const media = await getAllMedia(reader, '*');
  const mediaRows = (media.data || []).sort((a, b) => (a.file_size || 0) - (b.file_size || 0));

  if (!admin) {
    return { configured: false, pages: [], sections: [], projects: [], media: mediaRows, settings: [] };
  }

  const [pages, sections, projects, settings] = await Promise.all([
    admin.from('pages').select('*').order('sort_order'),
    admin.from('page_sections').select('*').order('position'),
    admin.from('projects').select('*').order('sort_order'),
    admin.from('site_settings').select('*').order('key')
  ]);

  return {
    configured: true,
    pages: pages.data || [],
    sections: sections.data || [],
    projects: projects.data || [],
    media: mediaRows,
    settings: settings.data || []
  };
}
