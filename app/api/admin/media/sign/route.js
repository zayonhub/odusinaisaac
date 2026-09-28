import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../../lib/auth';
import { getSupabaseAdmin, publicStorageUrl, storageBucket } from '../../../../../lib/supabase';

function safeName(name='file') { return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-'); }

export async function POST(request) {
  if (!await isAdmin()) return NextResponse.json({error:'Unauthorized'},{status:401});
  const sb=getSupabaseAdmin(); if(!sb) return NextResponse.json({error:'Supabase is not configured.'},{status:503});
  const { filename='file', folder='uploads' } = await request.json().catch(()=>({}));
  const path=`${safeName(folder)}/${Date.now()}-${crypto.randomUUID().slice(0,8)}-${safeName(filename)}`;
  const {data,error}=await sb.storage.from(storageBucket()).createSignedUploadUrl(path,{upsert:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({
    path,
    token:data.token,
    bucket:storageBucket(),
    projectRef:process.env.SUPABASE_PROJECT_REF || '',
    publicUrl:publicStorageUrl(path)
  });
}
