import { createClient } from '@supabase/supabase-js';

let adminClient;
let readerClient;

const CMS_TABLE_MAP = {
  pages: 'cms_pages',
  page_sections: 'cms_page_sections',
  projects: 'cms_projects',
  media_assets: 'cms_media_assets',
  site_settings: 'cms_site_settings',
  page_revisions: 'cms_page_revisions',
  navigation_items: 'cms_navigation_items'
};

const DEFAULT_SUPABASE_URL = 'https://wwuutndlekinlkdgjyao.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_JxpzvFGpaX83HsVJfweM4A__Fi4jY24';

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

export function getSupabaseReader() {
  if (!readerClient) {
    const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    readerClient = wrapCmsClient(client);
  }
  return readerClient;
}

export function storageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || 'portfolio-media';
}

export function publicStorageUrl(path) {
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  if (!url || !path) return '';
  const clean = path.split('/').map(encodeURIComponent).join('/');
  return `${url}/storage/v1/object/public/${storageBucket()}/${clean}`;
}
