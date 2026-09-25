import { createClient } from '@supabase/supabase-js';

let adminClient;

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin() {
  if (!supabaseConfigured()) return null;
  if (!adminClient) {
    adminClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
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
