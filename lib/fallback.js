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
  },
  {
    id: 'fallback-sparkles', title: 'Sparkles Packaging', slug: 'sparkles-packaging', category: 'Logo study',
    summary: 'An expressive symbol for a packaging business.', role: 'Brand identity · Graphic design',
    cover_url: `${RAW}/assets/portfolio/branding/sparkles-packaging/sparkles-logo-c.webp`, sort_order: 40, status: 'published'
  },
  {
    id: 'fallback-foot-web', title: 'Foot Impact website', slug: 'foot-impact-web', category: 'Digital / Public health',
    summary: 'Bringing a public-health identity into a live web presence.', role: 'Web design · Implementation',
    cover_url: `${RAW}/assets/portfolio/branding/foot-impact/foot-impact-logo.webp`, sort_order: 50, status: 'published'
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

const fallbackWork = {
  id: 'fallback-work', title: 'Work', slug: 'work', seo_title: 'Selected work | Odusina Isaac',
  seo_description: 'Explore identity, packaging, campaign and web projects.', status: 'published',
  sections: [
    { id:'fw1', type:'rich_text', position:10, variant:'intro', content:{heading:'Work with context.', body:'A focused collection of design work, with clear scope and a closer look at each application.'}},
    { id:'fw2', type:'project_grid', position:20, variant:'editorial', content:{heading:'Selected projects', intro:'Identity, packaging, campaigns and digital work presented with context.', limit:12}},
    { id:'fw3', type:'cta', position:30, variant:'wine', content:{eyebrow:'Let’s work together', title:'A project. A team. A new possibility.', button_label:'Start a conversation ↗', button_url:'/contact'}}
  ]
};

const fallbackAbout = {
  id:'fallback-about', title:'About', slug:'about', seo_title:'About | Odusina Isaac',
  seo_description:'Meet Odusina Isaac, graphic and brand identity designer.', status:'published',
  sections:[
    {id:'fa1',type:'hero',position:10,variant:'editorial',content:{eyebrow:'About the designer',title:'Thoughtful design. Practical experience.',body:'Based in Nigeria. Working with businesses, organisations and creative teams.',media_url:`${RAW}/assets/odusina-isaac-headshot.jpg`,primary_label:'Experience & skills',primary_url:'/experience',secondary_label:'Get in touch',secondary_url:'/contact'}},
    {id:'fa2',type:'rich_text',position:20,variant:'split',content:{heading:'About my practice',body:'I’m Odusina Isaac, a graphic and web designer with more than seven years of experience. My practice spans brand identity, packaging, promotional communication and WordPress websites.\n\nThrough independent projects and Zayon Creative Studios, I work across digital and physical formats. My production experience informs how I think about layout, materials, legibility and handoff.\n\nI also contribute design support to public-health initiatives, including Foot Impact.'}},
    {id:'fa3',type:'rich_text',position:30,variant:'process',content:{heading:'How I work',body:'Understand\nClarify the audience, message, deliverables and practical constraints.\n\nDesign\nDevelop the visual direction and refine its hierarchy, typography and application.\n\nDeliver\nPrepare the work for the screen, print format or production setting where it will be used.'}},
    {id:'fa4',type:'cta',position:40,variant:'wine',content:{eyebrow:'Let’s work together',title:'A project. A team. A new possibility.',button_label:'Start a conversation ↗',button_url:'/contact'}}
  ]
};

const fallbackExperience = {
  id:'fallback-experience',title:'Experience',slug:'experience',seo_title:'Experience & skills | Odusina Isaac',
  seo_description:'Professional profile, capabilities and tools for hiring teams.',status:'published',
  sections:[
    {id:'fe1',type:'rich_text',position:10,variant:'intro',content:{heading:'Experience & skills.',body:'Odusina Isaac Imoleayo · Graphic Designer & Brand Identity Designer'}},
    {id:'fe2',type:'rich_text',position:20,variant:'reading',content:{heading:'Professional profile',body:'Designer with 7+ years of experience across brand identity, packaging, campaigns, production artwork and web design. Based in Nigeria, working independently and through Zayon Creative Studios.\n\nAreas of contribution\nBrand identity: logos, visual assets and applications.\nPackaging and print: labels, sacks, promotional material and production artwork.\nCampaigns: social graphics, promotional layouts and email artwork.\nWeb: WordPress websites and interface design.\n\nTools\nPhotoshop, CorelDRAW, Figma, Canva, WordPress, Premiere Pro and CapCut.\n\nSelected project experience\nWingate Exotic Hotel: promotional design.\nYellow Yolk Feeds: packaging design.\nFoot Impact: identity and public-health design support.\nSparkles Packaging: identity design.\n\nEducation\nDiploma in Computer Science, Kwara State Polytechnic, 2016.\nBSc Computer Science, National Open University of Nigeria, in view.\n\nOpportunities\nAvailable to discuss design roles, project engagements and creative collaborations.'}},
    {id:'fe3',type:'cta',position:30,variant:'wine',content:{eyebrow:'Professional opportunities',title:'Discuss a role or project.',button_label:'Get in touch ↗',button_url:'/contact'}}
  ]
};

const fallbackContact = {
  id:'fallback-contact',title:'Contact',slug:'contact',seo_title:'Contact | Odusina Isaac',
  seo_description:'Discuss a design project or professional opportunity with Odusina Isaac.',status:'published',
  sections:[
    {id:'fc1',type:'hero',position:10,variant:'editorial',content:{eyebrow:'Contact',title:'Let’s talk about what comes next.',body:'For design projects, team opportunities and creative collaborations.',primary_label:'Connect on LinkedIn ↗',primary_url:'https://www.linkedin.com/in/odusina-isaac/',secondary_label:'X / Twitter ↗',secondary_url:'https://x.com/isaacodusina'}},
    {id:'fc2',type:'rich_text',position:20,variant:'split',content:{heading:'Two ways to start',body:'Commission a project\nTell me about your business, the deliverables you need, your intended timeline and any production requirements.\n\nDiscuss a role\nShare the role, team, working arrangement and the type of design challenges you need help with.\n\nNigeria · Working globally'}}
  ]
};

export const fallbackPages = {
  home: fallbackHome,
  work: fallbackWork,
  about: fallbackAbout,
  experience: fallbackExperience,
  contact: fallbackContact
};
