'use client';
import { useMemo, useState } from 'react';
import * as tus from 'tus-js-client';
import { useRouter } from 'next/navigation';

const SECTION_TYPES=['hero','rich_text','split','image','gallery','project_grid','cta','divider','spacer'];
const emptyState={pages:[],sections:[],projects:[],media:[],settings:[],configured:false};
const PICKER_PAGE_SIZE=72;
const LIBRARY_PAGE_SIZE=120;

async function measureImage(file){
  if(!file.type?.startsWith('image/')) return {width:null,height:null};
  try{const bitmap=await createImageBitmap(file);const out={width:bitmap.width,height:bitmap.height};bitmap.close();return out;}catch{return {width:null,height:null};}
}

function TextField({label,value='',onChange,type='text',rows}){
  return <div className="field"><label>{label}</label>{rows?<textarea rows={rows} value={value??''} onChange={e=>onChange(e.target.value)}/>:<input type={type} value={value??''} onChange={e=>onChange(e.target.value)}/>}</div>;
}

function mediaText(media){
  return [media.filename,media.folder,media.alt_text,media.caption,...(Array.isArray(media.tags)?media.tags:[])].filter(Boolean).join(' ').toLowerCase();
}

function AssetBrowser({label='Choose image',value,onChange,media,multiple=false}){
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [folder,setFolder]=useState('all');
  const [limit,setLimit]=useState(PICKER_PAGE_SIZE);
  const images=useMemo(()=>media.filter(m=>m.mime_type?.startsWith('image/')&&m.public_url),[media]);
  const folders=useMemo(()=>Array.from(new Set(images.map(m=>m.folder).filter(Boolean))).sort((a,b)=>a.localeCompare(b)),[images]);
  const selectedIds=multiple?(Array.isArray(value)?value:[]):(value?[value]:[]);
  const selectedAssets=selectedIds.map(id=>images.find(m=>m.id===id)).filter(Boolean);
  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return images.filter(m=>(folder==='all'||m.folder===folder)&&(!q||mediaText(m).includes(q)));
  },[images,folder,query]);
  const visible=filtered.slice(0,limit);
  function choose(id){
    if(multiple){
      const exists=selectedIds.includes(id);
      onChange(exists?selectedIds.filter(x=>x!==id):[...selectedIds,id]);
    }else{
      onChange(id);
      setOpen(false);
    }
  }
  return <div className="field asset-field"><label>{label}</label>
    <div className="asset-current">
      {multiple?<div className="asset-current-summary"><strong>{selectedIds.length}</strong><span>selected</span></div>:selectedAssets[0]?<><img src={selectedAssets[0].public_url} alt=""/><div className="asset-current-copy"><strong>{selectedAssets[0].filename}</strong><small>{selectedAssets[0].folder||'Media library'}</small></div></>:<div className="asset-empty">No image selected</div>}
      <div className="toolbar"><button type="button" className="toolbtn" onClick={()=>setOpen(v=>!v)}>{open?'Close library':multiple?'Add images':'Browse media'}</button>{!multiple&&value&&<button type="button" className="toolbtn danger" onClick={()=>onChange('')}>Clear</button>}</div>
    </div>
    {open&&<div className="asset-browser">
      <div className="asset-browser-head"><input placeholder="Search filename, folder, tag or alt text" value={query} onChange={e=>{setQuery(e.target.value);setLimit(PICKER_PAGE_SIZE)}}/><select value={folder} onChange={e=>{setFolder(e.target.value);setLimit(PICKER_PAGE_SIZE)}}><option value="all">All folders</option>{folders.map(f=><option key={f} value={f}>{f}</option>)}</select></div>
      <div className="asset-browser-meta">Showing {Math.min(visible.length,filtered.length)} of {filtered.length} matching images · {images.length} total images in Supabase</div>
      <div className="asset-browser-grid">{visible.map(m=>{const selected=selectedIds.includes(m.id);return <button type="button" key={m.id} className={`asset-tile ${selected?'selected':''}`} onClick={()=>choose(m.id)}><span className="asset-tile-image"><img src={m.public_url} alt={m.alt_text||m.filename} loading="lazy"/></span><span className="asset-tile-name">{m.filename}</span><span className="asset-tile-folder">{m.folder||'Media library'}</span><span className="asset-tile-action">{selected?(multiple?'Selected':'Current'):(multiple?'Add':'Choose')}</span></button>})}</div>
      {!visible.length&&<div className="empty">No images match this search.</div>}
      {filtered.length>limit&&<button type="button" className="toolbtn asset-more" onClick={()=>setLimit(n=>n+PICKER_PAGE_SIZE)}>Show more images</button>}
    </div>}
  </div>;
}

function MediaSelect({label,value,onChange,media}){
  return <AssetBrowser label={label} value={value} onChange={onChange} media={media}/>;
}

function GalleryField({value=[],onChange,media}){
  const [drag,setDrag]=useState(null); const selected=value||[];
  function drop(target){if(drag===null||drag===target)return;const next=[...selected];const [m]=next.splice(drag,1);next.splice(target,0,m);onChange(next);setDrag(null);}
  return <div><AssetBrowser label="Gallery media" value={selected} onChange={onChange} media={media} multiple/><div className="gallery-selected">{selected.map((id,i)=>{const m=media.find(x=>x.id===id);if(!m)return null;return <div className="gallery-selected-row" key={`${id}-${i}`} draggable onDragStart={()=>setDrag(i)} onDragOver={e=>e.preventDefault()} onDrop={()=>drop(i)}><span className="drag">⋮⋮</span><img src={m.public_url} alt=""/><span className="grow"><strong>{m.filename}</strong><small>{m.folder||''}</small></span><button className="toolbtn" type="button" onClick={()=>onChange([...selected.slice(0,i+1),id,...selected.slice(i+1)])}>Duplicate</button><button className="toolbtn danger" type="button" onClick={()=>onChange(selected.filter((_,n)=>n!==i))}>Remove</button></div>})}</div></div>;
}

function SectionFields({type,content,setContent,media}){
  const set=(k,v)=>setContent({...content,[k]:v});
  if(type==='hero') return <><TextField label="Eyebrow" value={content.eyebrow} onChange={v=>set('eyebrow',v)}/><TextField label="Headline" value={content.title} onChange={v=>set('title',v)} rows={2}/><TextField label="Body" value={content.body} onChange={v=>set('body',v)} rows={4}/><div className="two"><TextField label="Primary button label" value={content.primary_label} onChange={v=>set('primary_label',v)}/><TextField label="Primary button URL" value={content.primary_url} onChange={v=>set('primary_url',v)}/><TextField label="Secondary button label" value={content.secondary_label} onChange={v=>set('secondary_label',v)}/><TextField label="Secondary button URL" value={content.secondary_url} onChange={v=>set('secondary_url',v)}/></div><MediaSelect label="Hero image" value={content.media_id} onChange={v=>set('media_id',v)} media={media}/><TextField label="Image alt text" value={content.alt} onChange={v=>set('alt',v)}/></>;
  if(type==='rich_text') return <><TextField label="Heading" value={content.heading} onChange={v=>set('heading',v)} rows={2}/><TextField label="Body" value={content.body} onChange={v=>set('body',v)} rows={7}/></>;
  if(type==='split') return <><TextField label="Heading" value={content.heading} onChange={v=>set('heading',v)}/><TextField label="Body" value={content.body} onChange={v=>set('body',v)} rows={6}/><MediaSelect label="Image" value={content.media_id} onChange={v=>set('media_id',v)} media={media}/><div className="field"><label>Image placement</label><select value={content.reverse?'right':'left'} onChange={e=>set('reverse',e.target.value==='right')}><option value="left">Image left</option><option value="right">Image right</option></select></div></>;
  if(type==='image') return <><MediaSelect label="Image" value={content.media_id} onChange={v=>set('media_id',v)} media={media}/><TextField label="Alt text" value={content.alt} onChange={v=>set('alt',v)}/><TextField label="Caption" value={content.caption} onChange={v=>set('caption',v)}/></>;
  if(type==='gallery') return <><TextField label="Heading" value={content.heading} onChange={v=>set('heading',v)}/><GalleryField value={content.media_ids||[]} onChange={v=>set('media_ids',v)} media={media}/></>;
  if(type==='project_grid') return <><TextField label="Heading" value={content.heading} onChange={v=>set('heading',v)}/><TextField label="Introduction" value={content.intro} onChange={v=>set('intro',v)} rows={3}/><TextField label="Maximum projects" value={content.limit||6} type="number" onChange={v=>set('limit',Number(v))}/></>;
  if(type==='cta') return <><TextField label="Eyebrow" value={content.eyebrow} onChange={v=>set('eyebrow',v)}/><TextField label="Headline" value={content.title} onChange={v=>set('title',v)} rows={2}/><TextField label="Body" value={content.body} onChange={v=>set('body',v)} rows={3}/><div className="two"><TextField label="Button label" value={content.button_label} onChange={v=>set('button_label',v)}/><TextField label="Button URL" value={content.button_url} onChange={v=>set('button_url',v)}/></div></>;
  if(type==='spacer') return <TextField label="Height in pixels" value={content.height||60} type="number" onChange={v=>set('height',Number(v))}/>;
  return <p className="muted">This section has no content fields.</p>;
}

function SectionCard({section,media,onAction}){
  const [content,setContent]=useState(section.content||{}); const [variant,setVariant]=useState(section.variant||'default');
  return <div className="section-card" draggable data-id={section.id}><div className="section-top"><div><span className="drag">⋮⋮</span> <strong>{section.type}</strong> <span className="muted">· {variant}</span></div><div className="toolbar"><button className="toolbtn" onClick={()=>onAction('duplicateSection',{id:section.id})}>Duplicate</button><button className="toolbtn danger" onClick={()=>confirm('Delete this section?')&&onAction('deleteSection',{id:section.id})}>Delete</button></div></div><TextField label="Variant" value={variant} onChange={setVariant}/><SectionFields type={section.type} content={content} setContent={setContent} media={media}/><div className="toolbar"><button className="toolbtn primary" onClick={()=>onAction('updateSection',{id:section.id,content,variant})}>Save section</button><button className="toolbtn" onClick={()=>onAction('updateSection',{id:section.id,is_visible:!section.is_visible})}>{section.is_visible?'Hide':'Show'}</button></div></div>;
}

function PagesTab({state,onAction}){
  const [selectedId,setSelectedId]=useState(state.pages.find(p=>p.is_homepage)?.id||state.pages[0]?.id||null);
  const selected=state.pages.find(p=>p.id===selectedId); const sections=state.sections.filter(s=>s.page_id===selectedId).sort((a,b)=>a.position-b.position);
  const [newTitle,setNewTitle]=useState(''); const [newType,setNewType]=useState('standard'); const [newSection,setNewSection]=useState('rich_text'); const [dragId,setDragId]=useState(null);
  async function reorder(target){if(!dragId||dragId===target)return;const ids=sections.map(s=>s.id);const from=ids.indexOf(dragId),to=ids.indexOf(target);const [m]=ids.splice(from,1);ids.splice(to,0,m);setDragId(null);await onAction('reorderSections',{items:ids});}
  return <div className="admin-grid"><div className="panel"><div className="field"><label>New page</label><input placeholder="Page title" value={newTitle} onChange={e=>setNewTitle(e.target.value)}/><select value={newType} onChange={e=>setNewType(e.target.value)}><option value="standard">Standard</option><option value="landing">Landing</option></select><button className="toolbtn primary" onClick={async()=>{if(!newTitle)return;await onAction('createPage',{title:newTitle,page_type:newType});setNewTitle('')}}>Create page</button></div><div className="list">{state.pages.map(p=><button className={`list-row ${selectedId===p.id?'selected':''}`} key={p.id} onClick={()=>setSelectedId(p.id)}><span><strong>{p.title}</strong><small>/{p.slug}</small></span><span className={`status ${p.status}`}>{p.status}</span></button>)}</div></div><div className="editor">{!selected?<div className="empty">Create or select a page.</div>:<PageEditor page={selected} sections={sections} media={state.media} onAction={onAction} newSection={newSection} setNewSection={setNewSection} dragId={dragId} setDragId={setDragId} reorder={reorder}/>}</div></div>;
}

function PageEditor({page,sections,media,onAction,newSection,setNewSection,dragId,setDragId,reorder}){
  const [draft,setDraft]=useState(page);
  if(draft.id!==page.id) setDraft(page);
  return <><div className="admin-head"><div><h2>{page.title}</h2><span className={`status ${page.status}`}>{page.status}</span></div><div className="toolbar"><a className="toolbtn" href={page.is_homepage?'/':`/${page.slug}`} target="_blank">Preview ↗</a><button className="toolbtn" onClick={()=>onAction('duplicatePage',{id:page.id})}>Duplicate page</button><button className="toolbtn primary" onClick={()=>onAction('publishPage',{id:page.id})}>Publish</button></div></div><div className="two"><TextField label="Title" value={draft.title} onChange={v=>setDraft({...draft,title:v})}/><TextField label="Slug" value={draft.slug} onChange={v=>setDraft({...draft,slug:v})}/><TextField label="SEO title" value={draft.seo_title} onChange={v=>setDraft({...draft,seo_title:v})}/><TextField label="SEO description" value={draft.seo_description} onChange={v=>setDraft({...draft,seo_description:v})}/></div><div className="toolbar"><button className="toolbtn primary" onClick={()=>onAction('updatePage',{id:page.id,title:draft.title,slug:draft.slug,seo_title:draft.seo_title,seo_description:draft.seo_description})}>Save page settings</button>{page.status==='published'&&<button className="toolbtn" onClick={()=>onAction('unpublishPage',{id:page.id})}>Return to draft</button>} {!page.is_homepage&&<button className="toolbtn danger" onClick={()=>confirm('Delete this page and all its sections?')&&onAction('deletePage',{id:page.id})}>Delete page</button>}</div><hr className="divider" style={{margin:'24px 0'}}/><div className="section-add"><div><strong>Add a section</strong><p className="muted">Choose Image, Hero, Split or Gallery to attach media from the full Supabase library.</p></div><div className="toolbar"><select value={newSection} onChange={e=>setNewSection(e.target.value)}>{SECTION_TYPES.map(t=><option key={t}>{t}</option>)}</select><button className="toolbtn primary" onClick={()=>onAction('createSection',{page_id:page.id,type:newSection})}>+ Add section</button></div></div><div className="section-list">{sections.map(s=><div key={s.id} onDragStart={()=>setDragId(s.id)} onDragOver={e=>e.preventDefault()} onDrop={()=>reorder(s.id)} className={dragId===s.id?'dragging':''}><SectionCard section={s} media={media} onAction={onAction}/></div>)}</div></>;
}

function ProjectsTab({state,onAction}){
  const [title,setTitle]=useState(''); const [selectedId,setSelectedId]=useState(state.projects[0]?.id||null); const selected=state.projects.find(p=>p.id===selectedId);
  return <div className="admin-grid"><div className="panel"><div className="field"><label>New project</label><input placeholder="Project title" value={title} onChange={e=>setTitle(e.target.value)}/><button className="toolbtn primary" onClick={async()=>{if(!title)return;await onAction('createProject',{title});setTitle('')}}>Create project</button></div><div className="list">{state.projects.map(p=><button key={p.id} className={`list-row ${selectedId===p.id?'selected':''}`} onClick={()=>setSelectedId(p.id)}><span><strong>{p.title}</strong><small>{p.category||'Uncategorised'}</small></span><span className={`status ${p.status}`}>{p.status}</span></button>)}</div></div><div className="editor">{selected?<ProjectEditor project={selected} media={state.media} onAction={onAction}/>:<div className="empty">Create or select a project.</div>}</div></div>;
}

function ProjectEditor({project,media,onAction}){
  const [p,setP]=useState(project); if(p.id!==project.id)setP(project); const set=(k,v)=>setP({...p,[k]:v});
  return <><div className="admin-head"><h2>{project.title}</h2><div className="toolbar"><a className="toolbtn" href={`/projects/${project.slug}`} target="_blank">Preview ↗</a><button className="toolbtn" onClick={()=>onAction('duplicateProject',{id:project.id})}>Duplicate</button><button className="toolbtn primary" onClick={()=>onAction('publishProject',{id:project.id})}>Publish</button></div></div><div className="two"><TextField label="Project title" value={p.title} onChange={v=>set('title',v)}/><TextField label="Slug" value={p.slug} onChange={v=>set('slug',v)}/><TextField label="Category" value={p.category} onChange={v=>set('category',v)}/><TextField label="Industry" value={p.industry} onChange={v=>set('industry',v)}/><TextField label="Year" value={p.year} onChange={v=>set('year',v)}/><TextField label="Role" value={p.role} onChange={v=>set('role',v)}/></div><TextField label="Summary" value={p.summary} onChange={v=>set('summary',v)} rows={4}/><TextField label="Services (comma separated)" value={(p.services||[]).join(', ')} onChange={v=>set('services',v.split(',').map(x=>x.trim()).filter(Boolean))}/><MediaSelect label="Cover image" value={p.cover_media_id} onChange={v=>{const m=media.find(x=>x.id===v);setP({...p,cover_media_id:v||null,cover_url:m?.public_url||''})}} media={media}/><div className="toolbar"><button className="toolbtn primary" onClick={()=>onAction('updateProject',p)}>Save project</button><button className="toolbtn danger" onClick={()=>confirm('Delete this project and its page?')&&onAction('deleteProject',{id:p.id})}>Delete project</button></div><p className="notice">Edit this project’s actual page layout from the Pages tab. Project pages use the same visual media picker and section builder as every other page.</p></>;
}

function MediaTab({state,onAction}){
  const [uploads,setUploads]=useState({});
  const [query,setQuery]=useState('');
  const [folder,setFolder]=useState('all');
  const [limit,setLimit]=useState(LIBRARY_PAGE_SIZE);
  const folders=useMemo(()=>Array.from(new Set(state.media.map(m=>m.folder).filter(Boolean))).sort((a,b)=>a.localeCompare(b)),[state.media]);
  const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return state.media.filter(m=>(folder==='all'||m.folder===folder)&&(!q||mediaText(m).includes(q)));},[state.media,folder,query]);
  const visible=filtered.slice(0,limit);
  async function uploadFiles(files){
    for(const file of files){
      const key=`${file.name}-${file.size}-${file.lastModified}`; setUploads(x=>({...x,[key]:{name:file.name,progress:0,status:'Signing…'}}));
      try{
        const signed=await fetch('/api/admin/media/sign',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({filename:file.name,folder:'portfolio'})}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);return d});
        if(!signed.projectRef) throw new Error('SUPABASE_PROJECT_REF is missing.');
        const dims=await measureImage(file);
        await new Promise((resolve,reject)=>{
          const upload=new tus.Upload(file,{endpoint:`https://${signed.projectRef}.storage.supabase.co/storage/v1/upload/resumable`,retryDelays:[0,3000,5000,10000,20000],headers:{'x-signature':signed.token,'x-upsert':'false'},uploadDataDuringCreation:true,removeFingerprintOnSuccess:true,metadata:{bucketName:signed.bucket,objectName:signed.path,contentType:file.type||'application/octet-stream',cacheControl:'3600'},onProgress:(sent,total)=>setUploads(x=>({...x,[key]:{name:file.name,progress:Math.round(sent/total*100),status:'Uploading…'}})),onError:reject,onSuccess:resolve});upload.start();
        });
        await onAction('registerMedia',{filename:file.name,storage_path:signed.path,public_url:signed.publicUrl,mime_type:file.type,file_size:file.size,width:dims.width,height:dims.height,alt_text:'',caption:'',folder:'portfolio',tags:[]},false);
        setUploads(x=>({...x,[key]:{name:file.name,progress:100,status:'Done'}}));
      }catch(e){setUploads(x=>({...x,[key]:{name:file.name,progress:0,status:e.message||'Failed'}}));}
    }
    await onAction('refresh',{},true);
  }
  return <div><div className="admin-head"><div><h2>Media Library</h2><p className="muted">{state.media.length} assets loaded from Supabase. Search and preview them here, then use the same library inside page sections.</p></div></div><div className="upload-row"><input type="file" multiple accept="image/*,video/*,.pdf" onChange={e=>uploadFiles(Array.from(e.target.files||[]))}/><p className="muted">Bulk uploads are resumable and show per-file progress.</p>{Object.entries(uploads).map(([k,u])=><div key={k}><small>{u.name} · {u.status}</small><div className="progress"><span style={{width:`${u.progress}%`}}/></div></div>)}</div><div className="media-library-tools"><input placeholder="Search media, folder, tag, caption or alt text" value={query} onChange={e=>{setQuery(e.target.value);setLimit(LIBRARY_PAGE_SIZE)}}/><select value={folder} onChange={e=>{setFolder(e.target.value);setLimit(LIBRARY_PAGE_SIZE)}}><option value="all">All folders</option>{folders.map(f=><option key={f} value={f}>{f}</option>)}</select><span>{Math.min(visible.length,filtered.length)} / {filtered.length}</span></div><div className="media-grid">{visible.map(m=><MediaCard key={m.id} media={m} onAction={onAction}/>)}</div>{filtered.length>limit&&<button type="button" className="toolbtn asset-more" onClick={()=>setLimit(n=>n+LIBRARY_PAGE_SIZE)}>Show more assets</button>}</div>;
}

function MediaCard({media,onAction}){
  const [alt,setAlt]=useState(media.alt_text||''); const [caption,setCaption]=useState(media.caption||'');
  return <div className="media-card">{media.mime_type?.startsWith('image/')?<img src={media.public_url} alt={alt||media.filename} loading="lazy"/>:<div style={{aspectRatio:1,display:'grid',placeItems:'center'}}>FILE</div>}<div className="meta"><strong>{media.filename}</strong><small className="media-folder-label">{media.folder||'Media library'}</small><TextField label="Alt" value={alt} onChange={setAlt}/><TextField label="Caption" value={caption} onChange={setCaption}/><div className="toolbar"><button className="toolbtn" onClick={()=>onAction('updateMedia',{id:media.id,alt_text:alt,caption})}>Save</button><button className="toolbtn" onClick={()=>navigator.clipboard?.writeText(media.public_url)}>Copy URL</button><button className="toolbtn danger" onClick={()=>confirm('Delete this media asset?')&&onAction('deleteMedia',{id:media.id})}>Delete</button></div></div></div>;
}

function SettingsTab({state,onAction}){
  const [key,setKey]=useState('');const [value,setValue]=useState('');
  return <div className="panel"><div className="admin-head"><h2>Site settings</h2></div><div className="two"><TextField label="Setting key" value={key} onChange={setKey}/><TextField label="Value" value={value} onChange={setValue}/></div><button className="toolbtn primary" onClick={()=>key&&onAction('saveSetting',{key,value})}>Save setting</button><div className="list" style={{marginTop:20}}>{state.settings.map(s=><div className="list-row" key={s.key}><strong>{s.key}</strong><small>{String(s.value)}</small></div>)}</div></div>;
}

export default function AdminDashboardV2({initialState=emptyState}){
  const router=useRouter(); const [state,setState]=useState(initialState); const [tab,setTab]=useState('pages'); const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false);
  async function onAction(action,payload={},refreshFromResponse=true){
    if(action==='refresh'){const r=await fetch('/api/admin/cms');const s=await r.json();setState(s);return s;}
    setBusy(true);setMessage('Saving…');
    const r=await fetch('/api/admin/cms',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,payload})});const d=await r.json().catch(()=>({}));setBusy(false);
    if(!r.ok){setMessage(d.error||'Action failed.');return null;}setMessage('Saved.');if(refreshFromResponse&&d.state)setState(d.state);return d;
  }
  async function logout(){await fetch('/api/admin/logout',{method:'POST'});router.replace('/admin/login');router.refresh();}
  return <div className="admin-shell"><aside className="admin-sidebar"><h1>ISAAC CMS</h1><div className="admin-nav">{['pages','projects','media','settings'].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</div><div style={{marginTop:25,fontSize:12,color:'#bcaebe'}}>{busy?'Working…':message}</div><button className="toolbtn" style={{marginTop:20}} onClick={logout}>Log out</button></aside><main className="admin-main">{!state.configured&&<p className="notice">Supabase admin writes are not configured. Public media can still render, but add SUPABASE_SERVICE_ROLE_KEY and SUPABASE_PROJECT_REF in Vercel to edit and upload.</p>}{tab==='pages'&&<PagesTab state={state} onAction={onAction}/>} {tab==='projects'&&<ProjectsTab state={state} onAction={onAction}/>} {tab==='media'&&<MediaTab state={state} onAction={onAction}/>} {tab==='settings'&&<SettingsTab state={state} onAction={onAction}/>}</main></div>;
}
