import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../lib/auth';
import { getAdminState } from '../../../../lib/cms';
import { getSupabaseAdmin, storageBucket } from '../../../../lib/supabase';

function slugify(v='') { return v.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || `page-${Date.now()}`; }
async function guard() { if (!await isAdmin()) return NextResponse.json({error:'Unauthorized'}, {status:401}); return null; }
async function snapshot(sb, pageId) {
  const [{data:page},{data:sections}] = await Promise.all([
    sb.from('pages').select('*').eq('id',pageId).maybeSingle(),
    sb.from('page_sections').select('*').eq('page_id',pageId).order('position')
  ]);
  if (page) await sb.from('page_revisions').insert({ page_id:pageId, snapshot:{ page, sections:sections||[] } });
}
async function duplicatePage(sb, id, requestedTitle) {
  const {data:source} = await sb.from('pages').select('*').eq('id',id).single();
  const {data:sections} = await sb.from('page_sections').select('*').eq('page_id',id).order('position');
  const title = requestedTitle || `${source.title} Copy`;
  const {id:_id,created_at:_c,updated_at:_u,published_at:_p,...rest}=source;
  const {data:page,error}=await sb.from('pages').insert({...rest,title,slug:`${slugify(title)}-${Date.now().toString().slice(-5)}`,status:'draft',is_homepage:false,published_at:null}).select().single();
  if(error) throw error;
  if(sections?.length){
    const rows=sections.map(({id:_sid,created_at:_sc,updated_at:_su,...s})=>({...s,page_id:page.id}));
    const {error:e}=await sb.from('page_sections').insert(rows); if(e) throw e;
  }
  return page;
}

export async function GET() {
  const denied=await guard(); if(denied) return denied;
  return NextResponse.json(await getAdminState());
}

export async function POST(request) {
  const denied=await guard(); if(denied) return denied;
  const sb=getSupabaseAdmin(); if(!sb) return NextResponse.json({error:'Supabase is not configured.'},{status:503});
  const body=await request.json().catch(()=>({})); const {action,payload={}}=body;
  try{
    if(action==='createPage'){
      const title=payload.title||'Untitled Page';
      const {error}=await sb.from('pages').insert({title,slug:payload.slug||slugify(title),page_type:payload.page_type||'standard',status:'draft',seo_title:payload.seo_title||'',seo_description:payload.seo_description||'',sort_order:payload.sort_order||100}); if(error) throw error;
    }
    else if(action==='updatePage'){
      const {id,...changes}=payload; delete changes.created_at; delete changes.updated_at;
      const {error}=await sb.from('pages').update(changes).eq('id',id); if(error) throw error;
    }
    else if(action==='deletePage'){
      const {error}=await sb.from('pages').delete().eq('id',payload.id); if(error) throw error;
    }
    else if(action==='duplicatePage') await duplicatePage(sb,payload.id,payload.title);
    else if(action==='publishPage'){
      await snapshot(sb,payload.id);
      const {error}=await sb.from('pages').update({status:'published',published_at:new Date().toISOString()}).eq('id',payload.id); if(error) throw error;
    }
    else if(action==='unpublishPage'){
      const {error}=await sb.from('pages').update({status:'draft'}).eq('id',payload.id); if(error) throw error;
    }
    else if(action==='createSection'){
      const {data:last}=await sb.from('page_sections').select('position').eq('page_id',payload.page_id).order('position',{ascending:false}).limit(1);
      const position=(last?.[0]?.position||0)+10;
      const {error}=await sb.from('page_sections').insert({page_id:payload.page_id,type:payload.type||'rich_text',variant:payload.variant||'default',position,content:payload.content||{},settings:payload.settings||{},is_visible:true}); if(error) throw error;
    }
    else if(action==='updateSection'){
      const {id,...changes}=payload; delete changes.created_at; delete changes.updated_at;
      const {error}=await sb.from('page_sections').update(changes).eq('id',id); if(error) throw error;
    }
    else if(action==='deleteSection'){
      const {error}=await sb.from('page_sections').delete().eq('id',payload.id); if(error) throw error;
    }
    else if(action==='duplicateSection'){
      const {data:s,error}=await sb.from('page_sections').select('*').eq('id',payload.id).single(); if(error) throw error;
      const {id:_id,created_at:_c,updated_at:_u,...copy}=s;
      const {error:e}=await sb.from('page_sections').insert({...copy,position:(s.position||0)+1}); if(e) throw e;
    }
    else if(action==='reorderSections'){
      const rows=payload.items||[];
      for(let i=0;i<rows.length;i++){ const {error}=await sb.from('page_sections').update({position:(i+1)*10}).eq('id',rows[i]); if(error) throw error; }
    }
    else if(action==='createProject'){
      const title=payload.title||'Untitled Project', slug=payload.slug||slugify(title);
      const {data:page,error:pe}=await sb.from('pages').insert({title,slug:`projects/${slug}`,page_type:'project',status:'draft',seo_title:title,seo_description:payload.summary||'',sort_order:payload.sort_order||100}).select().single(); if(pe) throw pe;
      const {error}=await sb.from('projects').insert({title,slug,category:payload.category||'',industry:payload.industry||'',year:payload.year||'',role:payload.role||'',services:payload.services||[],summary:payload.summary||'',cover_media_id:payload.cover_media_id||null,cover_url:payload.cover_url||'',page_id:page.id,status:'draft',featured:false,sort_order:payload.sort_order||100}); if(error) throw error;
    }
    else if(action==='updateProject'){
      const {id,...changes}=payload; delete changes.created_at; delete changes.updated_at;
      const {error}=await sb.from('projects').update(changes).eq('id',id); if(error) throw error;
    }
    else if(action==='publishProject'){
      const {data:p}=await sb.from('projects').select('page_id').eq('id',payload.id).single();
      const {error}=await sb.from('projects').update({status:'published'}).eq('id',payload.id); if(error) throw error;
      if(p?.page_id){ await snapshot(sb,p.page_id); await sb.from('pages').update({status:'published',published_at:new Date().toISOString()}).eq('id',p.page_id); }
    }
    else if(action==='duplicateProject'){
      const {data:p,error}=await sb.from('projects').select('*').eq('id',payload.id).single(); if(error) throw error;
      const page=await duplicatePage(sb,p.page_id,`${p.title} Copy`);
      const {id:_id,created_at:_c,updated_at:_u,...copy}=p;
      await sb.from('projects').insert({...copy,title:`${p.title} Copy`,slug:`${slugify(p.title)}-copy-${Date.now().toString().slice(-5)}`,page_id:page.id,status:'draft',featured:false});
    }
    else if(action==='deleteProject'){
      const {data:p}=await sb.from('projects').select('page_id').eq('id',payload.id).maybeSingle();
      const {error}=await sb.from('projects').delete().eq('id',payload.id); if(error) throw error;
      if(p?.page_id) await sb.from('pages').delete().eq('id',p.page_id);
    }
    else if(action==='registerMedia'){
      const {error}=await sb.from('media_assets').insert(payload); if(error) throw error;
    }
    else if(action==='updateMedia'){
      const {id,...changes}=payload; const {error}=await sb.from('media_assets').update(changes).eq('id',id); if(error) throw error;
    }
    else if(action==='deleteMedia'){
      const {data:m}=await sb.from('media_assets').select('storage_path').eq('id',payload.id).maybeSingle();
      if(m?.storage_path) await sb.storage.from(storageBucket()).remove([m.storage_path]);
      const {error}=await sb.from('media_assets').delete().eq('id',payload.id); if(error) throw error;
    }
    else if(action==='saveSetting'){
      const {error}=await sb.from('site_settings').upsert({key:payload.key,value:payload.value},{onConflict:'key'}); if(error) throw error;
    }
    else return NextResponse.json({error:'Unknown action.'},{status:400});
    return NextResponse.json({ok:true,state:await getAdminState()});
  }catch(error){
    console.error('CMS action failed',action,error);
    return NextResponse.json({error:error.message||'CMS action failed.'},{status:500});
  }
}
