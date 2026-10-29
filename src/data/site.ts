// Everything global about the site lives here.
// Items marked TODO are placeholders waiting for real content.

export const site = {
  name: 'Avijeet Singh',
  title: 'Experience designer',
  city: 'Mumbai, India',
  email: 'creatives.avijeet@gmail.com',
  instagram: 'https://instagram.com/avijeettsingh',
  linkedin: '', // TODO: LinkedIn URL
  behance: '', // TODO: Behance URL, if any
  resume: '', // TODO: path to résumé PDF, e.g. /avijeet-singh-resume.pdf
  version: 'Layer stack 0.1',
};

export type DisciplineKey = 'ux' | 'brand' | 'visual' | 'film' | 'photo';

export const disciplines: Record<DisciplineKey, { name: string; short: string; color: string; blurb: string }> = {
  ux: {
    name: 'UI/UX and product',
    short: 'UI/UX',
    color: '#6A5AE0',
    blurb: 'Research, flows and interfaces for digital products.',
  },
  brand: {
    name: 'Brand design',
    short: 'Brand',
    color: '#D9900C',
    blurb: 'Identities and the systems that keep them consistent.',
  },
  visual: {
    name: 'Visual design',
    short: 'Visual',
    color: '#D2448A',
    blurb: 'Art direction, campaigns, renders and layouts.',
  },
  film: {
    name: 'Film and edit',
    short: 'Film',
    color: '#119C85',
    blurb: 'Shooting, editing and grading stories for brands and events.',
  },
  photo: {
    name: 'Photography',
    short: 'Photo',
    color: '#76862A',
    blurb: 'Events, products, people and places.',
  },
};

export const disciplineOrder: DisciplineKey[] = ['ux', 'brand', 'visual', 'film', 'photo'];

// From the résumé, newest first
export const experience = [
  { year: '2026', client: 'Ai+ Smartphone', role: 'Brand and visual design', slug: 'aiplus-brand' },
  { year: '2025', client: 'Nike', role: 'Video producer, Afterdark Tour', slug: 'nike-afterdark' },
  { year: '2025', client: 'Valorant', role: 'Video producer, Bunker event', slug: 'valorant-bunker' },
  { year: '2025', client: 'Project Tête-à-Tête', role: 'Retail experience design', slug: 'tete-a-tete' },
  { year: '2025', client: 'Freakins', role: 'Campaign video producer', slug: 'freakins' },
  { year: '2025', client: 'Hatsu', role: 'Product experience designer', slug: 'hatsu' },
  { year: '2024', client: 'Sunburn Festival', role: 'Visual experience designer', slug: 'sunburn' },
];

export const credits = [
  { name: 'Nike', d: 'film' },
  { name: 'Valorant', d: 'film' },
  { name: 'Ai+ Smartphone', d: 'brand' },
  { name: 'Sunburn Festival', d: 'film' },
  { name: 'Freakins', d: 'film' },
  { name: 'Hatsu', d: 'visual' },
  { name: 'Project Tête-à-Tête', d: 'visual' },
] as const;

// TODO: confirm this list. Résumé tools plus ones mentioned while planning.
export const tools: Record<string, string[]> = {
  'Product and interface': ['Figma', 'Framer', 'Figma Make', 'Google Stitch'],
  'Visual and brand': ['Photoshop', 'InDesign', 'Midjourney', 'Adobe Firefly'],
  'Film and motion': ['DaVinci Resolve', 'Premiere Pro', 'Higgsfield'],
  '3D and product': ['Fusion 360'],
};
