export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: 'LIGHTING & ON-SET' | 'TYPOGRAPHY' | 'MOTION & EDITORIAL' | 'CASE STUDY';
  coverImage: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  content: string[];
  specs?: {
    camera?: string;
    lighting?: string;
    aspectRatio?: string;
    deliverables?: string[];
  };
  relatedSlug?: string;
}

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    slug: 'tungsten-vs-strobe-aviation',
    title: 'Tungsten vs. Strobe: Lighting Technicals for High-Altitude Aviation',
    subtitle: 'Why commercial aviation lookbooks fail when lit with flat digital strobes, and how continuous tungsten builds authentic flight deck tension.',
    excerpt: 'On the tarmac at 05:00, ambient light changes by a stop every seven minutes. Here is the technical breakdown of how we held high-contrast aircraft metal without losing the dark instrumentation of the cockpit.',
    date: 'AUGUST 28, 2026',
    readTime: '6 MIN READ',
    category: 'LIGHTING & ON-SET',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
    author: {
      name: 'Moiz Khan',
      role: 'Art Director & Brand Visual Designer',
      avatar: '/assets/logo.png',
    },
    specs: {
      camera: 'ARRI Alexa Mini LF • Cooke Anamorphic /i Full Frame Plus',
      lighting: '2x ARRI SkyPanel S60-C (Chimeras), 4x Astera Titan Tubes, 1.2K HMI Par',
      aspectRatio: '16:9 Cinema & 4:5 Lookbook Deck',
      deliverables: ['Lookbook Treatment', 'Flight Deck Lighting Scheme', 'Print Master'],
    },
    content: [
      'Commercial aviation looks artificial the moment you light an aircraft cabin like a retail apparel studio. High-altitude cockpits are spaces of tactile metal, matte switches, and deep shadow pools. When directing the Windchasers Aviation campaign, our primary rule on set was simple: no indiscriminate fill light.',
      'We scheduled the hero runway setups during civil twilight. The flight deck glass acts as a polarizing mirror; if your key light is positioned perpendicular to the fuselage, you wash out the pilot\'s reflection against the horizon. Instead, we rigged continuous tungsten fixtures low across the instrument panel, skimming up into the flight suit collar.',
      'This deliberate chiaroscuro gave the trainees an air of quiet technical authority rather than commercial cheerfulness. You can see the tactile weave of the Nomex fabric, the amber glow of HUD panels, and the cold blue predawn tarmac through the windshield.',
      'When directing cinematographers, precision in foot-candles and beam angle beats subjective descriptors every time. Knowing exactly where the highlight falls on aircraft aluminum turns a standard catalog shoot into a museum-grade visual deck.',
    ],
    relatedSlug: 'color-timing-heritage-luxury',
  },
  {
    slug: 'swiss-typography-streetwear',
    title: 'Subversive Swiss Typography in Contemporary Streetwear Direction',
    subtitle: 'Breaking the grid while honoring Josef Müller-Brockmann: visual systems for modern youth brands.',
    excerpt: 'How we adapted rigid modernist typography into a kinetic, high-impact retail identity for Easy Hai Bro, balancing editorial restraint with raw street energy.',
    date: 'AUGUST 14, 2026',
    readTime: '5 MIN READ',
    category: 'TYPOGRAPHY',
    coverImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
    author: {
      name: 'Moiz Khan',
      role: 'Art Director & Brand Visual Designer',
      avatar: '/assets/logo.png',
    },
    specs: {
      camera: 'Leica M11 • Summilux-M 35mm f/1.4 ASPH',
      aspectRatio: '1:1 Box & 9:16 Social Dynamic',
      deliverables: ['Kinetic Style Guide', 'Logotype Architecture', 'Packaging Suite'],
    },
    content: [
      'Streetwear design often defaults to chaos—random distress, misplaced noise, and illegible layering. But the most memorable subcultural brands (from Raf Simons to early Supreme) earned their longevity through rigorous typographic discipline.',
      'When engineering the Easy Hai Bro identity, we started with a clinical Swiss architectural grid. Every masthead, label specification, and hangtag follows strict baseline alignment. Then, and only then, did we introduce controlled distortion.',
      'We subjected the typographic glyphs to physical optical abuse: scanning prints while moving the paper manually across the flatbed glass, printing onto thermal receipts, and re-digitizing analog xeroxes. The resulting letterforms carry visceral warmth because their imperfections are mechanical, not digital filters.',
      'The tension between surgical Swiss layouts and raw, tactile street energy is where contemporary brand desire lives.',
    ],
    relatedSlug: '9-16-kinetic-rhythm',
  },
  {
    slug: '9-16-kinetic-rhythm',
    title: 'The 9:16 Kinetic Rhythm: Directing Commercial Stills into Velocity Cuts',
    subtitle: 'Vertical video shouldn\'t be an afterthought cropped from 16:9. It demands its own frame cadence.',
    excerpt: 'A director\'s manifesto on pacing, spatial framing, and sonic sync for luxury fashion and youth lifestyle reels.',
    date: 'JULY 22, 2026',
    readTime: '4 MIN READ',
    category: 'MOTION & EDITORIAL',
    coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    author: {
      name: 'Moiz Khan',
      role: 'Art Director & Brand Visual Designer',
      avatar: '/assets/logo.png',
    },
    specs: {
      aspectRatio: '9:16 Vertical Native (1080x1920)',
      deliverables: ['Social Reel Campaign', 'Audio Rescoring', 'Velocity Motion Master'],
    },
    content: [
      'For decades, art directors treated vertical video as an unwanted chore: take the finished 16:9 master, center-crop the action, and ship it. That approach always feels amputated.',
      'Directing natively in 9:16 requires rethinking eye tracking. In widescreen, the viewer\'s eyes scan laterally; in vertical, attention drops like a plumb line from center-top to center-bottom. Your subject\'s eyeline, product placement, and headline typography must orchestrate a vertical cascade.',
      'Pacing must also be rhythmic. We build editorial cuts around the " percussive breath\—three rapid visual cuts (4 to 6 frames each) followed by a lingering 1.5-second hero still. This creates sensory contrast: momentum followed by impact.',
 'When your motion editor and cinematographer share that vocabulary on set, you don\'t waste hours fixing awkward crops in post-production.',
 ],
 relatedSlug: 'swiss-typography-streetwear',
 },
 {
 slug: 'color-timing-heritage-luxury',
 title: 'Color Timing Architecture: Preserving Fabric Texture in Heritage Luxury',
 subtitle: 'Why extreme digital saturation destroys handloom textiles, and how film-stock LUTs restore tactile depth.',
 excerpt: 'Inside the Kaladhar bridal campaign: balancing opulent gold bullion, raw silk, and natural skin tones under cinematic tungsten.',
 date: 'JUNE 30, 2026',
 readTime: '7 MIN READ',
 category: 'CASE STUDY',
 coverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
 author: {
 name: 'Moiz Khan',
 role: 'Art Director & Brand Visual Designer',
 avatar: '/assets/logo.png',
 },
 specs: {
 camera: 'RED V-Raptor 8K VV • Zeiss Master Primes',
 lighting: 'Mole-Richardson 2K Tungsten Juniors & 4x4 Silk Diffusers',
 aspectRatio: '4:5 Editorial & 16:9 Master',
 deliverables: ['Color Bible', 'ACES Color Pipeline', 'Editorial Print Grade'],
 },
 content: [
 'Heritage luxury textile campaigns are often ruined by overly aggressive digital color grading. In an attempt to make wedding silks \pop\, colorists blast saturation across the entire spectrum, turning antique 24-karat gold zardozi into garish neon yellow.',
 'Gold has weight, patina, and shadow. For Kaladhar, we built an ACES color management pipeline that pinned the highlights strictly within Kodak 5219 film stock parameters. The highlights roll off gently with warmth, rather than clipping into harsh digital white.',
 'Skin tones were prioritized as the anchor of credibility. If the model\'s complexion looks waxen or overly smoothed, the luxury garment loses all authenticity. By lighting with broad, warm tungsten practicals and using soft diffusion frames, we preserved pore texture and genuine human warmth.',
 'A true luxury director doesn\'t shout with saturated noise; they build a palette of profound, tactile restraint.',
 ],
 relatedSlug: 'tungsten-vs-strobe-aviation',
 },
];

export function getAllPosts(): BlogPost[] {
 return INITIAL_BLOG_POSTS;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
 return INITIAL_BLOG_POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(currentSlug: string): BlogPost[] {
 return INITIAL_BLOG_POSTS.filter((p) => p.slug !== currentSlug).slice(0, 2);
}
