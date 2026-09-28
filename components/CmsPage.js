function mediaUrl(value, mediaMap) {
  if (!value) return '';
  if (typeof value === 'string' && value.startsWith('http')) return value;
  if (typeof value === 'string' && mediaMap[value]) return mediaMap[value].public_url || '';
  return '';
}

function Header() {
  return <header className="topbar"><div className="wrap nav"><a className="brand" href="/">ODUSINA <span>ISAAC</span></a><nav className="navlinks"><a href="/work">Work</a><a href="/about">About</a><a href="/experience">Experience</a><a href="/contact">Contact</a></nav></div></header>;
}

function Footer() {
  return <footer className="section"><div className="wrap muted">© {new Date().getFullYear()} Odusina Isaac · Brand Identity & Visual Designer</div></footer>;
}

function Hero({ c, mediaMap, fallbackMeta='' }) {
  const image = mediaUrl(c.media_id, mediaMap) || mediaUrl(c.media_url, mediaMap);
  const supporting = c.meta || fallbackMeta;
  return <section className="hero"><div className="wrap hero-grid"><div><div className="mono" style={{color:'var(--wine)',marginBottom:16}}>{c.eyebrow}</div><h1>{c.title}</h1><p>{c.body}</p>{supporting && <p className="muted">{supporting}</p>}<div className="actions">{c.primary_label && <a className="btn primary" href={c.primary_url || '#'}>{c.primary_label}</a>}{c.secondary_label && <a className="btn" href={c.secondary_url || '#'}>{c.secondary_label}</a>}</div></div>{image && <div className="hero-media"><img src={image} alt={c.alt || c.title || ''}/></div>}</div></section>;
}

function RichText({ c }) {
  return <section className="section"><div className="wrap rich"><h2>{c.heading}</h2><div className="rich-copy">{c.body}</div></div></section>;
}

function ImageSection({ c, mediaMap }) {
  const src = mediaUrl(c.media_id, mediaMap) || mediaUrl(c.media_url, mediaMap);
  return <section className="section"><div className="wrap section-image">{src && <img src={src} alt={c.alt || ''}/>} {c.caption && <p className="muted">{c.caption}</p>}</div></section>;
}

function Split({ c, mediaMap }) {
  const src = mediaUrl(c.media_id, mediaMap) || mediaUrl(c.media_url, mediaMap);
  return <section className="section"><div className={`wrap split ${c.reverse ? 'reverse' : ''}`}><div><h2>{c.heading}</h2><p className="rich-copy">{c.body}</p></div>{src && <div className="section-image"><img src={src} alt={c.alt || ''}/></div>}</div></section>;
}

function Gallery({ c, mediaMap }) {
  const ids = Array.isArray(c.media_ids) ? c.media_ids : [];
  return <section className="section"><div className="wrap">{c.heading && <h2 className="section-title">{c.heading}</h2>}<div className="gallery">{ids.map((id, i) => { const m = mediaMap[id]; if (!m?.public_url) return null; return <figure key={`${id}-${i}`}><img src={m.public_url} alt={m.alt_text || ''} loading="lazy"/>{m.caption && <figcaption>{m.caption}</figcaption>}</figure>; })}</div></div></section>;
}

function ProjectGrid({ c, projects }) {
  const set = (projects || []).slice(0, Number(c.limit) || 6);
  return <section className="section"><div className="wrap"><h2 className="section-title">{c.heading || 'Selected work'}</h2>{c.intro && <p className="section-intro">{c.intro}</p>}<div className="project-grid">{set.map(p => <a className="project-card" key={p.id} href={`/projects/${p.slug}`}><img src={p.cover_url || ''} alt={p.title} loading="lazy"/><div className="project-info"><div className="mono" style={{color:'var(--wine)'}}>{p.category}</div><div className="project-title">{p.title}</div><p className="muted">{p.summary}</p><div className="muted">{p.role}</div></div></a>)}</div></div></section>;
}

function CTA({ c }) {
  return <section className="section cta"><div className="wrap"><div className="mono">{c.eyebrow}</div><h2>{c.title}</h2>{c.body && <p>{c.body}</p>}{c.button_label && <div className="actions"><a className="btn primary" href={c.button_url || '#'}>{c.button_label}</a></div>}</div></section>;
}

export default function CmsPage({ page, projects = [], mediaMap = {}, project = null }) {
  const sections = page?.sections || project?.sections || [];
  return <><Header/><main>{project && !sections.length && <section className="hero"><div className="wrap hero-grid"><div><div className="mono" style={{color:'var(--wine)'}}>{project.category}</div><h1>{project.title}</h1><p>{project.summary}</p><p className="muted">{project.role}</p></div>{project.cover_url && <div className="hero-media"><img src={project.cover_url} alt={project.title}/></div>}</div></section>}{sections.map(s => {
    const c = s.content || {};
    if (s.type === 'hero') return <Hero key={s.id} c={c} mediaMap={mediaMap} fallbackMeta={project?.role || ''}/>;
    if (s.type === 'rich_text') return <RichText key={s.id} c={c}/>;
    if (s.type === 'image') return <ImageSection key={s.id} c={c} mediaMap={mediaMap}/>;
    if (s.type === 'split') return <Split key={s.id} c={c} mediaMap={mediaMap}/>;
    if (s.type === 'gallery') return <Gallery key={s.id} c={c} mediaMap={mediaMap}/>;
    if (s.type === 'project_grid') return <ProjectGrid key={s.id} c={c} projects={projects}/>;
    if (s.type === 'cta') return <CTA key={s.id} c={c}/>;
    if (s.type === 'divider') return <div className="wrap" key={s.id}><hr className="divider"/></div>;
    if (s.type === 'spacer') return <div key={s.id} className="spacer" style={{'--space': `${Number(c.height)||60}px`}}/>;
    return null;
  })}</main><Footer/></>;
}
