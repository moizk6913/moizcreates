'use client';

import { useEffect } from 'react';

interface CaseModalProps {
  projectId: string | null;
  onClose: () => void;
}

const projectsData: Record<
  string,
  {
    tag: string;
    title: string;
    role: string;
    team: string;
    scope: string;
    market: string;
    narrative: string;
    media: Array<{
      format: '16-9' | '4-5' | '9-16' | 'grid-2';
      caption: string;
      image?: string;
      items?: Array<{ image: string }>;
    }>;
  }
> = {
  easyhaibro: {
    tag: 'FEATURED DIRECTION CREDIT',
    title: 'Easy Hai Bro',
    role: 'Art Director & Brand Visual Designer',
    team: 'Led 4 Creatives Direct with Founders',
    scope: 'Brand Identity, Shoot Direction, Commercial Content',
    market: 'Streetwear & Youth Culture',
    narrative:
      'Directed the full visual identity and commercial production for Easy Hai Bro. Managed a crew of four spanning cinematography, lighting, wardrobe, and editorial. Built an energetic visual language combining street-culture spontaneity with commercial camera discipline. Produced 35+ assets across broadcast, print, and vertical mobile channels.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Widescreen Broadcast Video • Director Cut',
        image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: '1080 × 1350 Editorial Key Art • Hard Key Lighting',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '9-16',
        caption: '1080 × 1920 Mobile Story Reel • Fast-Paced Dynamic Cut',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop',
      },
      {
        format: 'grid-2',
        caption: 'On-Set Production & Brand Architecture (1:1 Side-by-Side)',
        items: [
          { image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop' },
          { image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop' },
        ],
      },
    ],
  },
  windchasers: {
    tag: 'STRONGEST AD-LEVEL PIECE',
    title: 'Windchasers Aviation Academy',
    role: 'Art Director',
    team: 'Direct with Academy Leadership',
    scope: 'Brand Shoot Direction, Editorial Lookbook Deck',
    market: 'Aviation & Luxury Training',
    narrative:
      'Directed a two-day location shoot on airport aprons and active runways. Oversaw flight deck lighting, flight suit wardrobe grading, and comprehensive pitch deck art direction. Positioned the academy as a premier aviation institution in the GCC.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Hero Brand Still • Hard Contrast Direct Light',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: '1080 × 1350 Cockpit Instrumentation Key Art',
        image: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f4?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  kaladhar: {
    tag: 'HIGH-FASHION CAMPAIGN',
    title: 'Kaladhar Bridal Campaign',
    role: 'Art Director & Shoot Director',
    team: 'Lighting Crew, HMUA, Stylist',
    scope: 'Campaign Concept, On-Set Lighting, Editorial Color Timing',
    market: 'Heritage Luxury Bridal',
    narrative:
      'Directed an opulent heritage bridal narrative. Avoided sterile commercial lighting in favor of warm tungsten practicals, cinematic shadows, and natural skin texture. Supervised color timing to preserve rich gold bullion and velvet fabric tones.',
    media: [
      {
        format: '4-5',
        caption: '1080 × 1350 Key Visual • Warm Directional Key',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '16-9',
        caption: '1920 × 1080 Wide Cinematic Master Frame',
        image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop',
      },
    ],
  },
  ruchi: {
    tag: 'COMMERCIAL FOOD DIRECTION',
    title: 'Ruchi Fried Chicken',
    role: 'Commercial Art Director',
    team: 'Food Stylist, Macro Camera Operator',
    scope: 'Food Art Direction, Commercial Color Grade, High-Speed Capture',
    market: 'Commercial QSR',
    narrative:
      'High-octane commercial food styling and art direction. Directed high-speed probe lenses and saturated RGB rim lighting to make crispy textures pop off screens. Delivers punchy, appetite-driven imagery designed for quick consumer conversion.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Slow-Motion Capture Frame',
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '9-16',
        caption: '1080 × 1920 Social Story Frame',
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=900&auto=format&fit=crop',
      },
    ],
  },
  oxymorons: {
    tag: 'CONCEPTUAL IDENTITY',
    title: 'Oxymorons',
    role: 'Art Director & Brand Visual Designer',
    team: 'Independent Creative Direction',
    scope: 'Brand Strategy, Typographic Distortion, Kinetic Packaging',
    market: 'Experimental Contemporary',
    narrative:
      'An exercise in conflicting concepts: delicate luxury paired with industrial grit. Explores heavy condensed typography overlaid across analog textures and distorted chromatic aberration keyframes.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Typographic Architecture',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: '1080 × 1350 Editorial Print Poster',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  porsche: {
    tag: 'VISCERAL AUTOMOTIVE BROADCAST',
    title: 'Porsche Carrera Telemetry',
    role: 'Commercial Film Director & Editor',
    team: 'Pursuit Vehicle Crew & Sound Designer',
    scope: 'Broadcast Master, High-Speed Tracking, Engine Sound Design',
    market: 'Automotive & Luxury Performance',
    narrative:
      'A visceral automotive director cut sync-edited to raw exhaust acoustics and precision German asphalt telemetry. Captured with heavy pursuit tracking arms across coastal switchbacks and nighttime industrial docks.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Pursuit Arm Dynamic Tracking Frame',
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: '1080 × 1350 Cockpit Gauge Telemetry Stills',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  prada: {
    tag: 'KINETIC 3D WORLD',
    title: 'Prada Structural Deconstruct',
    role: 'Motion Director & 3D Artist',
    team: 'CGI Lighting & Motion Designers',
    scope: '3D Wireframes, Kinetic Typography, Architectural Deconstruction',
    market: 'Haute Couture & Digital Art',
    narrative:
      'A kinetic 3D wireframe exploration decomposing luxury leather goods into floating geometric architectural lines. Built around precise Swiss typographic rhythms and delicate physical gravity.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Deconstructed Leather Geometry',
        image: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '9-16',
        caption: '1080 × 1920 Vertical Kinetic Loop',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop',
      },
    ],
  },
  dior: {
    tag: 'ANAMORPHIC LUXURY CINEMA',
    title: 'Dior Midnight Nocturne',
    role: 'Director of Photography',
    team: 'Lighting Package & Colorist',
    scope: 'Anamorphic Capture, Atmospheric Practical Haze, Master Film Grade',
    market: 'Luxury Fragrance & Film',
    narrative:
      'Nocturnal perfume commercial directed under high-power tungsten fixtures with anamorphic oval bokeh and dense atmospheric haze. Emphasizes tactile skin warmth, shadow contrast, and deep nocturnal blues.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Anamorphic Master Cinema Frame',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: '1080 × 1350 Atmospheric Bottle Key Visual',
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
};

export default function CaseModal({ projectId, onClose }: CaseModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (projectId) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [projectId, onClose]);

  if (!projectId || !projectsData[projectId]) return null;

  const data = projectsData[projectId];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] bg-canvas border border-border-hairline shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col"
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-4 bg-canvas border-b border-border-hairline">
          <span className="font-mono text-xs text-muted tracking-wider">PROJECT / CASE STUDY</span>
          <button
            onClick={onClose}
            className="font-mono text-xs text-primary border border-border-medium px-3 py-1 hover:bg-primary hover:text-white transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Scroll Content */}
        <div className="p-6 md:p-10 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <span className="font-mono text-xs text-accent-red tracking-wider block mb-2">{data.tag}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight mb-3">{data.title}</h2>
            <p className="text-sm md:text-base text-secondary leading-relaxed max-w-2xl mb-6">{data.narrative}</p>

            {/* Credit Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border-hairline">
              <div>
                <span className="font-mono text-[10px] text-muted tracking-wider block mb-1">ROLE</span>
                <span className="text-xs md:text-sm font-semibold text-primary">{data.role}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-muted tracking-wider block mb-1">CREW / LEADERSHIP</span>
                <span className="text-xs md:text-sm font-semibold text-primary">{data.team}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-muted tracking-wider block mb-1">SCOPE</span>
                <span className="text-xs md:text-sm font-semibold text-primary">{data.scope}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-muted tracking-wider block mb-1">MARKET</span>
                <span className="text-xs md:text-sm font-semibold text-primary">{data.market}</span>
              </div>
            </div>
          </div>

          {/* Media Stack */}
          <div className="flex flex-col gap-8">
            {data.media.map((m, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                {/* 16:9 Landscape Video / Broadcast Frame */}
                {m.format === '16-9' && m.image && (
                  <div className="relative w-full aspect-[16/9] bg-subtle border border-border-hairline overflow-hidden">
                    <img src={m.image} alt={m.caption} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="w-11 h-11 rounded-full bg-accent-red text-white flex items-center justify-center text-sm pl-0.5">
                        ▶
                      </span>
                    </div>
                  </div>
                )}

                {/* 4:5 Portrait Poster */}
                {m.format === '4-5' && m.image && (
                  <div className="relative w-full max-w-lg mx-auto aspect-[4/5] bg-subtle border border-border-hairline overflow-hidden">
                    <img src={m.image} alt={m.caption} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}

                {/* 9:16 Vertical Reel */}
                {m.format === '9-16' && m.image && (
                  <div className="relative w-full max-w-[280px] mx-auto aspect-[9/16] max-h-[500px] bg-subtle border border-border-hairline overflow-hidden">
                    <img src={m.image} alt={m.caption} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="w-9 h-9 rounded-full bg-accent-red text-white flex items-center justify-center text-xs pl-0.5">
                        ▶
                      </span>
                    </div>
                  </div>
                )}

                {/* 1:1 Side by Side Grid */}
                {m.format === 'grid-2' && m.items && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {m.items.map((it, i) => (
                      <div key={i} className="aspect-square bg-subtle border border-border-hairline overflow-hidden">
                        <img src={it.image} alt="Setup" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center font-mono text-[11px] text-muted pt-1">
                  <span>{m.caption}</span>
                  <span className="text-accent-red uppercase tracking-wider">{m.format} SPEC</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
