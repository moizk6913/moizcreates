export interface ArchiveFile {
  id: string;
  code: string;
  name: string;
  discipline: string;
  year: string;
  role: string;
  x: number;
  y: number;
  rot: number;
  img: string;
  aspect: string;
  colorTag: string;
  variant?: string;
  desc: string;
  deliverables: string[];
  photos?: string[];
  photoCount?: number;
  stickers?: any;
  isComingSoon?: boolean;
  videoUrl?: string;
  client?: string;
}

export const DEFAULT_DISCIPLINE_FOLDERS: ArchiveFile[] = [
  {
    id: 'art-direction',
    code: '01 / DIRECTION',
    name: 'Art Direction',
    discipline: 'Art Direction • Concept Architecture',
    year: '2026',
    role: 'Lead Art Director',
    x: -270,
    y: -170,
    rot: -2,
    img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[16/10]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'amber-moov',
    desc: 'Concept architecture, high-impact creative direction, and commercial worldbuilding. Full campaign assets and pitch deliverables.',
    deliverables: ['Creative Direction', 'Shoot Concepts', 'Visual Architecture', 'Brand Worldbuilding'],
    photos: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    ],
    photoCount: 28,
    stickers: {
      stamp: { flag: '🇦🇪', countryCode: 'DXB', bgColor: '#ffffff' },
      sticker: { type: 'airplane', name: 'Directorial' },
    },
    isComingSoon: false,
  },
  {
    id: 'brand-identity',
    code: '02 / IDENTITY',
    name: 'Brand Identity',
    discipline: 'Brand Identity • Visual Systems',
    year: '2026',
    role: 'Creative Director',
    x: 270,
    y: -190,
    rot: 3,
    img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'cobalt-modern',
    desc: 'Visual architecture, kinetic identity decks, and comprehensive brand guidelines. Full identity systems and packaging design.',
    deliverables: ['Visual Identity', 'Typography Systems', 'Guidelines Deck', 'Packaging Design'],
    photos: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop',
    ],
    photoCount: 42,
    stickers: {
      stamp: { flag: '🇯🇵', countryCode: 'TYO', bgColor: '#ffffff' },
      sticker: { type: 'torii', name: 'Identity Deck' },
    },
    isComingSoon: false,
  },
  {
    id: 'cinematography',
    code: '03 / CINEMA',
    name: 'Cinematography',
    discipline: 'Cinematography • Shoot Direction',
    year: '2026',
    role: 'Director of Photography',
    x: -480,
    y: 70,
    rot: 4,
    img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[16/9]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'cinema-slate',
    desc: 'High-contrast commercial lighting direction, frame composition, and on-set technical direction. 35mm anamorphic stills and reels.',
    deliverables: ['On-Set Direction', 'Lighting Setups', 'Camera Movement', 'Master Reels'],
    photos: [
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop&q=80',
    ],
    photoCount: 36,
    stickers: {
      stamp: { flag: '🇫🇷', countryCode: 'PAR', bgColor: '#ffffff' },
      sticker: { type: 'camera', name: '35mm Stills' },
    },
    isComingSoon: false,
  },
  {
    id: 'motion-graphics',
    code: '04 / KINETIC',
    name: 'Motion Graphics',
    discipline: 'Motion Graphics • 2D / 3D',
    year: '2026',
    role: 'Motion Director',
    x: 0,
    y: 0,
    rot: 0,
    img: '/assets/bento/bento_chrome_3d_cutout.png',
    aspect: 'aspect-[16/9]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'neon-violet',
    desc: 'Distorted typography, kinetic title sequences, and frame-by-frame rhythmic pacing. Experimental 3D reels and iridescent forms.',
    deliverables: ['Kinetic Titles', '3D Motion', 'Broadcast Packages', 'Social Loops'],
    photos: [
      '/assets/bento/bento_chrome_3d_cutout.png',
      '/assets/bento/bento_sphere_3d_cutout.png',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1000&auto=format&fit=crop&q=80',
    ],
    photoCount: 19,
    stickers: {
      stamp: { flag: '🇨🇭', countryCode: 'ZRH', bgColor: '#ffffff' },
      sticker: { type: 'diamond', name: 'Motion Deck' },
    },
    isComingSoon: false,
  },
  {
    id: 'video-editing',
    code: '05 / EDITORIAL',
    name: 'Video Editing',
    discipline: 'Video Editing • Commercial & Social Reels (9:16)',
    year: '2026',
    role: 'Lead Video Editor',
    x: 480,
    y: 80,
    rot: -3,
    img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[9/16]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'terracotta-cut',
    desc: 'High-paced vertical social reels (9:16), director cuts, and 16:9 commercial broadcast masters. Timeline cuts and multi-format masters.',
    deliverables: ['9:16 Social Ads', 'Director Cuts', 'Sound Rescoring', 'Multi-Format Masters'],
    photos: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80',
    ],
    photoCount: 31,
    stickers: {
      stamp: { flag: '🇬🇧', countryCode: 'LDN', bgColor: '#ffffff' },
      sticker: { type: 'film', name: 'Editorial' },
    },
    isComingSoon: false,
  },
  {
    id: 'color-grading',
    code: '06 / GRADE',
    name: 'Colour Grading',
    discipline: 'Colour Grading • Film Stock Emulation',
    year: '2026',
    role: 'Colorist & Finisher',
    x: -250,
    y: 240,
    rot: -2,
    img: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[16/9]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'forest-emerald',
    desc: 'Tungsten warmth, analogue 35mm film stock emulation, and saturated commercial pop. Color grading passes and mastered look LUTs.',
    deliverables: ['Film Emulation', 'Tungsten Grading', 'Commercial Finish', 'Look LUTs'],
    photos: [
      'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=600&auto=format&fit=crop&q=80',
    ],
    photoCount: 22,
    stickers: {
      stamp: { flag: '🇩🇪', countryCode: 'STR', bgColor: '#ffffff' },
      sticker: { type: 'flame', name: 'Tungsten' },
    },
    isComingSoon: false,
  },
  {
    id: 'photography',
    code: '07 / VISION',
    name: 'Photography',
    discipline: 'Photography • Stills & Editorial Lookbook',
    year: '2026',
    role: 'Lead Photographer',
    x: 250,
    y: 230,
    rot: 3,
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'frosted-photostyle',
    desc: 'Fashion editorial, model staging, analogue grain, and lighting precision. High-resolution lookbook stills and portrait lookbooks.',
    deliverables: ['Editorial Stills', 'Model Staging', 'Analogue Grain', 'Lookbook Spreads'],
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&auto=format&fit=crop&q=80',
    ],
    photoCount: 48,
    stickers: {
      stamp: { flag: '🇮🇹', countryCode: 'MIL', bgColor: '#ffffff' },
      sticker: { type: 'lemon', name: 'Lookbook' },
    },
    isComingSoon: false,
  },
];
