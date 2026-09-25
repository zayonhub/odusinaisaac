const RAW = 'https://raw.githubusercontent.com/zayonhub/odusinaisaac/main';

export const fallbackProjects = [
  {
    id: 'fallback-wingate', title: 'Wingate Exotic Hotel', slug: 'wingate-exotic-hotel', category: 'Hospitality campaigns',
    summary: 'Room offers translated into clear, image-led hotel promotions.', role: 'Graphic design · Promotional artwork',
    cover_url: `${RAW}/assets/portfolio/social-media/wingate-exotic-hotel/wingate-january-promo.webp`, sort_order: 10, status: 'published'
  },
  {
    id: 'fallback-yellow-yolk', title: 'Yellow Yolk Feeds', slug: 'yellow-yolk-feeds', category: 'Feed packaging',
    summary: 'Feed-sack artwork balancing brand recognition and product information.', role: 'Packaging design · Visual direction',
    cover_url: `${RAW}/assets/portfolio/packaging/yellow-yolk-feeds/yellow-yolk-feeds-bag-a.webp`, sort_order: 20, status: 'published'
  },
  {
    id: 'fallback-foot-impact', title: 'Foot Impact', slug: 'foot-impact', category: 'Public-health identity',
    summary: 'A compact identity shown across light and dark backgrounds.', role: 'Brand identity · Graphic design',
    cover_url: `${RAW}/assets/portfolio/branding/foot-impact/foot-impact-logo.webp`, sort_order: 30, status: 'published'
  }
];

export const fallbackHome = {
  id: 'fallback-home', title: 'Home', slug: 'home', seo_title: 'Brand Identity & Visual Designer | Odusina Isaac',
  seo_description: 'Brand identity, packaging, campaigns and digital design by Odusina Isaac.', status: 'published',
  sections: [
    { id: 'fh1', type: 'hero', position: 10, variant: 'editorial', content: {
      eyebrow: 'Brand Identity & Visual Designer', title: 'I make brands look impossible to ignore.',
      body: 'I help ambitious businesses turn ideas into distinctive identity systems, packaging, campaigns and digital experiences built to communicate clearly and compete confidently.',
      primary_label: 'Explore selected work ↗', primary_url: '/work', secondary_label: 'Get in touch', secondary_url: '/contact',
      media_url: `${RAW}/assets/odusina-isaac-headshot.jpg`
    }},
    { id: 'fh2', type: 'project_grid', position: 20, variant: 'editorial', content: {
      heading: 'Selected work. Specific decisions.', intro: 'Explore the brief, the artwork and the thinking behind each selected project.', limit: 6
    }},
    { id: 'fh3', type: 'rich_text', position: 30, variant: 'split', content: {
      heading: 'Design for the real world.', body: 'I’m Odusina Isaac, a graphic and brand identity designer based in Nigeria, with 7+ years across identity, packaging, campaigns and digital work. I work independently and through Zayon Creative Studios, connecting visual design with the practical demands of screens, print and production.'
    }},
    { id: 'fh4', type: 'cta', position: 40, variant: 'wine', content: {
      eyebrow: 'Let’s work together', title: 'A project. A team. A new possibility.', button_label: 'Start a conversation ↗', button_url: '/contact'
    }}
  ]
};
