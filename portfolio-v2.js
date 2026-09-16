import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';

const URL='https://wwuutndlekinlkdgjyao.supabase.co';
const KEY='sb_publishable_JxpzvFGpaX83HsVJfweM4A__Fi4jY24';
const BUCKET='zayon-media';
const sb=createClient(URL,KEY);

let groups=[];
let archiveItems=[];

const labels={
  social:'Campaign Design',
  branding:'Brand Identity',
  packaging:'Packaging',
  digital:'Digital Design',
  web:'Digital Design',
  other:'Visual Design'
};

const defaults={
  branding:{
    role:'Brand Identity · Visual Design',
    deliverables:'Identity system · Brand assets',
    summary:title=>`Selected identity work for ${title}, presented as a connected visual system rather than an isolated logo.`
  },
  packaging:{
    role:'Packaging Design · Visual Direction',
    deliverables:'Packaging · Production artwork',
    summary:title=>`Packaging work for ${title}, bringing brand recognition, hierarchy and production requirements into one practical visual system.`
  },
  social:{
    role:'Campaign Design · Visual Direction',
    deliverables:'Campaign system · Social & promotional design',
    summary:title=>`A connected campaign system for ${title}, showing how one visual direction carries consistently across multiple communications.`
  },
  digital:{
    role:'Digital Design · Visual Direction',
    deliverables:'Web & digital experience',
    summary:title=>`A digital design project for ${title}, focused on translating the brand into a clear and usable screen experience.`
  },
  other:{
    role:'Visual Design',
    deliverables:'Selected design applications',
    summary:title=>`A curated visual project for ${title}, presented as a connected body of work.`
  }
};

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));

function publicUrl(path){
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function cleanTitle(title='Selected Project'){
  return title.replace(/\.[a-z0-9]+$/i,'').replace(/\s+\d+$/,'').trim() || 'Selected Project';
}

function groupKey(p){
  const s=(p.title||'Untitled')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/,'')
    .replace(/[\-_]+/g,' ')
    .replace(/\b(mockup|design|post|flyer|slide|carousel|page|copy|final|rev|revision|version|v\d+)\b/g,' ')
    .replace(/\b\d+\b/g,' ')
    .replace(/\s+/g,' ')
    .trim();
  return `${p.category||'other'}:${s.split(' ').slice(0,4).join(' ')}`;
}

import {curatedProjects,additionalProjectStories} from './portfolio-stories.js';

function projectStoryFor(g){
  if(g.story) return g.story;
  const found=additionalProjectStories.find(item=>item.match.test(g.title||''));
  if(found) return found.story;
  const d=defaults[g.category]||defaults.other;
  const base=g.summary||d.summary(g.title);
  const extensions={
    branding:` The project is presented here as a system rather than a single mark, showing how the identity can remain coherent when it moves into real communication and brand applications.`,
    packaging:` The work is shown as a practical packaging system, with attention to recognition, information hierarchy and the realities of production.`,
    social:` The project brings related communications together to show the thinking and consistency behind the campaign, rather than presenting each graphic as an isolated post.`,
    digital:` The work focuses on translating the brand into a clear digital experience, connecting visual character with usability and communication.`,
    other:` The pieces are presented together to show the visual thinking and consistency behind the project.`
  };
  return base+(extensions[g.category]||extensions.other);
}

function projectSectionsFor(g){
  if(g.storySections) return g.storySections;
  const found=additionalProjectStories.find(item=>item.match.test(g.title||''));
  if(found?.sections) return found.sections;
  const d=defaults[g.category]||defaults.other;
  return {
    context:g.summary||d.summary(g.title),
    approach:g.category==='packaging'
      ?'The design balances recognition, information hierarchy and production requirements so the visual idea remains useful when it becomes a physical package.'
      :g.category==='branding'
        ?'The work is approached as a visual system rather than a single asset, with consistency and recognisability guiding how the identity moves across applications.'
        :g.category==='social'
          ?'Related communications are treated as one campaign language, using hierarchy and consistent visual cues so individual messages still feel connected.'
          :'The project is shaped around clarity, consistency and the practical context in which the design has to work.',
    system:g.category==='digital'
      ?'The visual language is translated into a usable digital experience so the brand remains recognisable while communication stays clear on screen.'
      :'The applications shown here demonstrate how the visual direction holds together across the available project touchpoints.'
  };
}

function dynamicGroups(data){
  const curated=curatedProjects.map(def=>({...def,items:[]}));  
  const generic=new Map();

  data.forEach(p=>{
    const title=p.title||'Untitled';
    const curatedGroup=curated.find(g=>g.match.test(title));
    if(curatedGroup){
      curatedGroup.items.push({
        title,
        src:publicUrl(p.image_path),
        sortOrder:p.sort_order??999
      });
      return;
    }

    const key=groupKey(p);
    if(!generic.has(key)){
      generic.set(key,{
        key,
        title:cleanTitle(title),
        category:p.category||'other',
        categoryLabel:p.category_label||labels[p.category]||'Visual Design',
        summary:p.summary||p.description||'',
        role:p.role||'',
        deliverables:p.deliverables||'',
        sortOrder:(p.sort_order??999)+1000,
        items:[]
      });
    }
    const g=generic.get(key);
    g.items.push({
      title,
      src:publicUrl(p.image_path),
      sortOrder:p.sort_order??999
    });
    if(!g.summary && (p.summary||p.description)) g.summary=p.summary||p.description;
    if(!g.role && p.role) g.role=p.role;
    if(!g.deliverables && p.deliverables) g.deliverables=p.deliverables;
  });

  curated.forEach(g=>g.items.sort((a,b)=>a.sortOrder-b.sortOrder));
  const selected=curated.filter(g=>g.items.length);
  const rest=[...generic.values()].sort((a,b)=>a.sortOrder-b.sortOrder);
  return [...selected,...rest];
}

function staticGroups(payload){
  return (payload?.projects||[]).map(p=>({
    key:p.id||p.title,
    title:p.title,
    category:p.category||'other',
    categoryLabel:p.categoryLabel||labels[p.category]||'Visual Design',
    summary:p.summary||'',
    role:p.role||'',
    deliverables:p.deliverables||'',
    sortOrder:p.sortOrder??999,
    items:(p.images||[]).map((src,i)=>({title:p.title,src,sortOrder:i}))
  })).sort((a,b)=>a.sortOrder-b.sortOrder);
}

function hydrateGroup(g){
  const d=defaults[g.category]||defaults.other;
  return {
    ...g,
    categoryLabel:g.categoryLabel||labels[g.category]||'Visual Design',
    summary:g.summary||d.summary(g.title),
    story:projectStoryFor(g),
    storySections:projectSectionsFor(g),
    role:g.role||d.role,
    deliverables:g.deliverables||d.deliverables
  };
}

function rebuildArchive(){
  archiveItems=groups.flatMap(g=>g.items.map(item=>({
    ...item,
    groupTitle:g.title,
    category:g.category,
    categoryLabel:g.categoryLabel
  })));
}

function render(filter='all'){
  const root=document.getElementById('projects');
  const set=groups.filter(g=>filter==='all'||g.category===filter).slice(0,6);
  if(!set.length){
    root.innerHTML='<div class="empty">No selected projects in this category yet.</div>';
    return;
  }
  root.innerHTML='';
  set.forEach((g,index)=>{
    const hero=g.items[0];
    if(!hero) return;
    const card=document.createElement('article');
    card.className='project-card';
    card.tabIndex=0;
    card.setAttribute('role','button');
    card.setAttribute('aria-label',`Open ${g.title} project`);
    card.innerHTML=`
      <div class="project-media">
        <img loading="${index===0?'eager':'lazy'}" src="${esc(hero.src)}" alt="${esc(g.title)}">
        <div class="project-index mono">${String(index+1).padStart(2,'0')} / Selected</div>
      </div>
      <div class="project-info">
        <div class="project-kicker mono"><span>${esc(g.categoryLabel)}</span><span>${g.items.length} ${g.items.length===1?'piece':'pieces'}</span></div>
        <div class="project-title">${esc(g.title)}</div>
        <p class="project-summary">${esc(g.summary)}</p>
        <div class="project-foot">
          <span class="project-role">${esc(g.role)}</span>
          <span class="project-link">Open project ↗</span>
        </div>
      </div>`;
    card.addEventListener('click',()=>openStory(g));
    card.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();openStory(g)}
    });
    root.appendChild(card);
  });
}

function openStory(g){
  document.getElementById('story-cat').textContent=g.categoryLabel;
  document.getElementById('story-title').textContent=g.title;
  document.getElementById('story-text').textContent=g.summary;
  document.getElementById('story-role').textContent=g.role;
  document.getElementById('story-deliverables').textContent=g.deliverables;
  document.getElementById('story-count').textContent=`${g.items.length} related ${g.items.length===1?'piece':'pieces'}`;
  const sections=g.storySections||projectSectionsFor(g);
  document.getElementById('story-narrative').innerHTML=`
    <article class="story-block"><span class="mono">01 / The context</span><h3>What the project needed</h3><p>${esc(sections.context)}</p></article>
    <article class="story-block"><span class="mono">02 / Design approach</span><h3>How I shaped the direction</h3><p>${esc(sections.approach)}</p></article>
    <article class="story-block"><span class="mono">03 / System in use</span><h3>How the identity carries</h3><p>${esc(sections.system)}</p></article>`;
  document.getElementById('story-gallery').innerHTML=g.items
    .map(item=>`<figure><img loading="lazy" src="${esc(item.src)}" alt="${esc(item.title||g.title)}"></figure>`)
    .join('');
  openModal('case-modal');
}

function openModal(id){
  const el=document.getElementById(id);
  el.classList.add('open');
  el.setAttribute('aria-hidden','false');
  document.body.classList.add('lock');
}

function closeModal(id){
  const el=document.getElementById(id);
  el.classList.remove('open');
  el.setAttribute('aria-hidden','true');
  document.body.classList.remove('lock');
}

document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m.id)}));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') document.querySelectorAll('.modal.open').forEach(m=>closeModal(m.id));
});

document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  render(b.dataset.filter);
});

document.getElementById('all-work-btn').onclick=()=>{
  const grid=document.getElementById('all-grid');
  if(!archiveItems.length){
    grid.innerHTML='<div class="empty">No archive items are available yet.</div>';
  } else {
    grid.innerHTML=archiveItems.map(item=>`
      <div class="all-item">
        <img loading="lazy" src="${esc(item.src)}" alt="${esc(item.title||item.groupTitle)}">
        <div class="all-label">${esc(item.groupTitle)} · ${esc(item.categoryLabel)}</div>
      </div>`).join('');
  }
  openModal('all-modal');
};

async function loadPortfolio(){
  try{
    const {data,error}=await sb.from('portfolio_projects').select('*').order('sort_order',{ascending:true,nullsFirst:false});
    if(error) throw error;
    const dynamic=dynamicGroups(data||[]);
    if(dynamic.length) groups=dynamic.map(hydrateGroup);
  }catch(error){
    console.warn('Supabase portfolio unavailable, trying static portfolio data.',error);
  }

  if(!groups.length){
    try{
      const response=await fetch('portfolio-data.json',{cache:'no-store'});
      if(response.ok){
        const payload=await response.json();
        groups=staticGroups(payload).map(hydrateGroup);
      }
    }catch(error){
      console.warn('Static portfolio fallback unavailable.',error);
    }
  }

  rebuildArchive();
  render();
}

async function loadContent(){
  try{
    const {data}=await sb.from('site_content').select('*').eq('id',1).maybeSingle();
    if(!data) return;
    if(data.contact_email){
      const e=document.getElementById('email-btn');
      e.href=`mailto:${data.contact_email}`;
      const a=document.createElement('a');
      a.href=`mailto:${data.contact_email}`;
      a.textContent='Email';
      document.getElementById('contact-links').prepend(a);
    }
  }catch(error){
    console.warn('Site content unavailable.',error);
  }
}

async function loadTestimonials(){
  const root=document.getElementById('testimonials');
  try{
    const {data,error}=await sb.from('testimonials').select('*').order('sort_order',{ascending:true,nullsFirst:false});
    if(error) throw error;
    if(!data?.length){
      root.innerHTML='<div class="empty">Client feedback will appear here as it is added.</div>';
      return;
    }
    root.innerHTML=data.slice(0,6).map(t=>`
      <article class="quote">
        <div>
          <div class="quote-mark">“</div>
          <p>${esc(t.quote)}</p>
        </div>
        <small>${esc(t.brand_name||'Client')}${t.brand_role?' · '+esc(t.brand_role):''}</small>
      </article>`).join('');
  }catch(error){
    console.warn('Testimonials unavailable.',error);
    root.innerHTML='<div class="empty">Client feedback will appear here as it is added.</div>';
  }
}

document.getElementById('year').textContent=new Date().getFullYear();
loadPortfolio();
loadContent();
loadTestimonials();
