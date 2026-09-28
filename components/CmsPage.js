function mediaUrl(value, mediaMap) {
  if (!value) return '';
  if (typeof value === 'string' && value.startsWith('http')) return value;
  if (typeof value === 'string' && mediaMap[value]) return mediaMap[value].public_url || '';
  return '';
}

function Header() {
  return (
    <header className="topbar">
      <div className="wrap nav">
        <a className="brand" href="/" aria-label="Odusina Isaac home">
          <span className="brand-mark">OI</span>
          <span className="brand-name">Odusina Isaac</span>
        </a>
        <nav className="navlinks" aria-label="Primary navigation">
          <a href="/work">Work</a>
          <a href="/about">About</a>
          <a href="/experience">Experience</a>
          <a href="/contact">Contact</a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <div className="footer-name">Odusina Isaac</div>
          <div className="muted">Brand Identity & Visual Designer</div>
        </div>
        <div className="footer-links">
          <a href="/work">Work</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
        <div className="muted footer-copy">© {new Date().getFullYear()}</div>
      </div>
    </footer>
  );
}

function Hero({ c, mediaMap, fallbackMeta = '' }) {
  const image = mediaUrl(c.media_id, mediaMap) || mediaUrl(c.media_url, mediaMap);
  const supporting = c.meta || fallbackMeta;
  return (
    <section className={`hero ${image ? 'hero-has-media' : 'hero-text-only'}`}>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          {c.eyebrow && <div className="eyebrow">{c.eyebrow}</div>}
          <h1>{c.title}</h1>
          {c.body && <p className="hero-body">{c.body}</p>}
          {supporting && <p className="hero-meta">{supporting}</p>}
          {(c.primary_label || c.secondary_label) && (
            <div className="actions">
              {c.primary_label && <a className="btn primary" href={c.primary_url || '#'}>{c.primary_label}<span aria-hidden="true">↗</span></a>}
              {c.secondary_label && <a className="btn" href={c.secondary_url || '#'}>{c.secondary_label}</a>}
            </div>
          )}
        </div>
        {image && (
          <div className="hero-media">
            <img src={image} alt={c.alt || c.title || ''} fetchPriority="high" />
          </div>
        )}
      </div>
    </section>
  );
}

function RichText({ c }) {
  return (
    <section className="section rich-section">
      <div className="wrap rich">
        <div className="section-label">Overview</div>
        <div>
          {c.heading && <h2>{c.heading}</h2>}
          {c.body && <div className="rich-copy">{c.body}</div>}
        </div>
      </div>
    </section>
  );
}

function ImageSection({ c, mediaMap }) {
  const src = mediaUrl(c.media_id, mediaMap) || mediaUrl(c.media_url, mediaMap);
  if (!src) return null;
  return (
    <section className="section visual-section">
      <div className="wrap section-image">
        <img src={src} alt={c.alt || ''} loading="lazy" />
        {c.caption && <p className="image-caption">{c.caption}</p>}
      </div>
    </section>
  );
}

function Split({ c, mediaMap }) {
  const src = mediaUrl(c.media_id, mediaMap) || mediaUrl(c.media_url, mediaMap);
  return (
    <section className="section split-section">
      <div className={`wrap split ${c.reverse ? 'reverse' : ''}`}>
        <div className="split-copy">
          {c.heading && <h2>{c.heading}</h2>}
          {c.body && <p className="rich-copy">{c.body}</p>}
        </div>
        {src && <div className="section-image"><img src={src} alt={c.alt || ''} loading="lazy" /></div>}
      </div>
    </section>
  );
}

function Gallery({ c, mediaMap }) {
  const ids = Array.isArray(c.media_ids) ? c.media_ids : [];
  const items = ids.map(id => mediaMap[id]).filter(m => m?.public_url);
  if (!items.length) return null;
  return (
    <section className="section gallery-section">
      <div className="wrap">
        {(c.heading || c.body) && (
          <div className="section-head">
            <div className="section-label">Selected visuals</div>
            <div>
              {c.heading && <h2 className="section-title">{c.heading}</h2>}
              {c.body && <p className="section-intro">{c.body}</p>}
            </div>
          </div>
        )}
        <div className="gallery">
          {items.map((m, i) => (
            <figure key={`${m.id}-${i}`} className="gallery-item">
              <img src={m.public_url} alt={m.alt_text || ''} loading="lazy" decoding="async" />
              {m.caption && <figcaption>{m.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectGrid({ c, projects }) {
  const set = (projects || []).slice(0, Number(c.limit) || 7);
  return (
    <section className="section projects-section">
      <div className="wrap">
        <div className="section-head">
          <div className="section-label">Portfolio</div>
          <div>
            <h2 className="section-title">{c.heading || 'Selected work'}</h2>
            {c.intro && <p className="section-intro">{c.intro}</p>}
          </div>
        </div>
        <div className="project-grid">
          {set.map((p, i) => (
            <a className="project-card" key={p.id} href={`/projects/${p.slug}`}>
              <div className="project-media">
                {p.cover_url && <img src={p.cover_url} alt={p.title} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />}
              </div>
              <div className="project-info">
                <div className="project-index">{String(i + 1).padStart(2, '0')}</div>
                <div className="project-details">
                  <div className="eyebrow">{p.category}</div>
                  <div className="project-title">{p.title}</div>
                  {p.summary && <p className="project-summary">{p.summary}</p>}
                  {p.role && <div className="project-role">{p.role}</div>}
                </div>
                <div className="project-arrow" aria-hidden="true">↗</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ c }) {
  return (
    <section className="section cta">
      <div className="wrap cta-grid">
        <div className="section-label light">{c.eyebrow || 'Start a project'}</div>
        <div>
          <h2>{c.title}</h2>
          {c.body && <p>{c.body}</p>}
          {c.button_label && <div className="actions"><a className="btn light-btn" href={c.button_url || '#'}>{c.button_label}<span aria-hidden="true">↗</span></a></div>}
        </div>
      </div>
    </section>
  );
}

export default function CmsPage({ page, projects = [], mediaMap = {}, project = null }) {
  const sections = page?.sections || project?.sections || [];
  return (
    <>
      <Header />
      <main>
        {project && !sections.length && (
          <section className="hero hero-has-media">
            <div className="wrap hero-grid">
              <div className="hero-copy">
                <div className="eyebrow">{project.category}</div>
                <h1>{project.title}</h1>
                {project.summary && <p className="hero-body">{project.summary}</p>}
                {project.role && <p className="hero-meta">{project.role}</p>}
              </div>
              {project.cover_url && <div className="hero-media"><img src={project.cover_url} alt={project.title} /></div>}
            </div>
          </section>
        )}
        {sections.map(s => {
          const c = s.content || {};
          if (s.type === 'hero') return <Hero key={s.id} c={c} mediaMap={mediaMap} fallbackMeta={project?.role || ''} />;
          if (s.type === 'rich_text') return <RichText key={s.id} c={c} />;
          if (s.type === 'image') return <ImageSection key={s.id} c={c} mediaMap={mediaMap} />;
          if (s.type === 'split') return <Split key={s.id} c={c} mediaMap={mediaMap} />;
          if (s.type === 'gallery') return <Gallery key={s.id} c={c} mediaMap={mediaMap} />;
          if (s.type === 'project_grid') return <ProjectGrid key={s.id} c={c} projects={projects} />;
          if (s.type === 'cta') return <CTA key={s.id} c={c} />;
          if (s.type === 'divider') return <div className="wrap" key={s.id}><hr className="divider" /></div>;
          if (s.type === 'spacer') return <div key={s.id} className="spacer" style={{ '--space': `${Number(c.height) || 60}px` }} />;
          return null;
        })}
      </main>
      <Footer />
    </>
  );
}
