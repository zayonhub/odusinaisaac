import { createClient } from '@supabase/supabase-js';

let adminClient;

const CMS_TABLE_MAP = {
  pages: 'cms_pages',
  page_sections: 'cms_page_sections',
  projects: 'cms_projects',
  media_assets: 'cms_media_assets',
  site_settings: 'cms_site_settings',
  page_revisions: 'cms_page_revisions',
  navigation_items: 'cms_navigation_items'
};

function wrapCmsClient(client) {
  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop === 'from') {
        return (table) => target.from(CMS_TABLE_MAP[table] || table);
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    }
  });
}

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin() {
  if (!supabaseConfigured()) return null;
  if (!adminClient) {
    const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    adminClient = wrapCmsClient(client);
  }
  return adminClient;
}

export function storageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || 'portfolio-media';
}

export function publicStorageUrl(path) {
  if (!process.env.SUPABASE_URL || !path) return '';
  const clean = path.split('/').map(encodeURIComponent).join('/');
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${storageBucket()}/${clean}`;
}
