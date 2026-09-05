'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CardData {
  id: string;
  idxStr: string;
  badge: string;
  title: string;
  desc: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  patternType: string;
}

const cardsData: CardData[] = [
  {
    id: 'art-direction',
    idxStr: '01 / CONCEPT',
    badge: 'LEAD',
    title: 'ART DIRECTION',
    desc: 'Concept Architecture • Creative Strategy • High-Impact Brand Worldbuilding',
    bgClass: 'bg-[#ff3300]',
    textClass: 'text-white',
    borderClass: 'border-0',
    patternType: 'architecture',
  },
  {
    id: 'brand-identity',
    idxStr: '02 / IDENTITY',
    badge: 'SYSTEM',
    title: 'BRAND IDENTITY',
    desc: 'Visual Architecture • Swiss Typography • Kinetic Style Decks',
    bgClass: 'bg-[#ede8df]',
    textClass: 'text-[#121212]',
    borderClass: 'border border-black/10',
    patternType: 'mosaic',
  },
  {
    id: 'cinematography',
    idxStr: '03 / CINEMA',
    badge: 'ON-SET',
    title: 'CINEMATOGRAPHY',
    desc: 'Shoot Direction • High-Contrast Lighting • Frame Composition',
    bgClass: 'bg-[#0055ff]',
    textClass: 'text-white',
    borderClass: 'border-0',
    patternType: 'waves',
  },
  {
    id: 'motion-graphics',
    idxStr: '04 / KINETIC',
    badge: '2D / 3D',
    title: 'MOTION GRAPHICS',
    desc: 'Distorted Typography • Title Sequences • Frame-by-Frame Rhythm',
    bgClass: 'bg-[#00e575]',
    textClass: 'text-[#080808]',
    borderClass: 'border-0',
    patternType: 'barcode',
  },
  {
    id: 'video-editing',
    idxStr: '05 / EDITORIAL',
    badge: 'POST',
    title: 'VIDEO EDITING',
    desc: 'Director Cuts • 16:9 Broadcast Masters • High-Paced 9:16 Social Reels',
    bgClass: 'bg-[#141414]',
    textClass: 'text-white',
    borderClass: 'border border-white/10',
    patternType: 'timeline',
  },
  {
    id: 'color-grading',
    idxStr: '06 / GRADE',
    badge: 'COLOR',
    title: 'COLOUR GRADING',
    desc: 'Tungsten Warmth • Film Stock Emulation • Saturated Commercial Pop',
    bgClass: 'bg-[#f59e0b]',
    textClass: 'text-[#101010]',
    borderClass: 'border-0',
    patternType: 'vectorscope',
  },
  {
    id: 'photography',
    idxStr: '07 / VISION',
    badge: 'STILLS',
    title: 'PHOTOGRAPHY',
    desc: 'Fashion Editorial • Model Staging • Analog Grain & Lighting Precision',
    bgClass: 'bg-white',
    textClass: 'text-[#0a0a0a]',
    borderClass: 'border border-black/15',
    patternType: 'viewfinder',
  },
];

const baseConfig = [
  { rot: -15, x: -270, y: 22, z: 10 },
  { rot: -10, x: -180, y: 10, z: 12 },
  { rot: -5,  x: -90,  y: 3,  z: 14 },
  { rot: 0,   x: 0,    y: 0,  z: 16 },
  { rot: 5,   x: 90,   y: 3,  z: 18 },
  { rot: 10,  x: 180,  y: 10, z: 20 },
  { rot: 15,  x: 270,  y: 22, z: 22 },
];

export default function DisciplineDeck() {
  const router = useRouter();
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    function updateScale() {
      if (typeof window === 'undefined') return;
      if (window.innerWidth < 768) {
        setScaleFactor(0.58);
      } else if (window.innerWidth < 1100) {
        setScaleFactor(0.82);
      } else {
        setScaleFactor(1);
      }
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <section id="disciplines" className="w-full py-16 md:py-24 bg-canvas border-none relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Fanned Card Deck Stage */}
        <div className="w-full min-h-[440px] md:min-h-[480px] flex items-center justify-center relative py-6">
          <div className="relative w-[220px] h-[330px] flex items-center justify-center">
            {cardsData.map((card, originalIdx) => {
              const slot = order.indexOf(originalIdx);
              const conf = baseConfig[slot] || { rot: 0, x: 0, y: 0, z: slot };
              const isHovered = hoveredIdx === originalIdx;
              const isAnyHovered = hoveredIdx !== null;
              const hoveredSlot = hoveredIdx !== null ? order.indexOf(hoveredIdx) : -1;

              // Calculate positions
              let posX = Math.round(conf.x * scaleFactor);
              let posY = Math.round(conf.y * scaleFactor);
              let rot = conf.rot;
              let z = conf.z;

              if (isHovered) {
                posY = -44;
                rot = 0;
                z = 70;
              } else if (isAnyHovered && !isHovered) {
                const offsetDirection = slot < hoveredSlot ? -20 : 20;
                posX = Math.round((conf.x + offsetDirection) * scaleFactor);
                posY = Math.round((conf.y + 8) * scaleFactor);
                rot = conf.rot + (slot < hoveredSlot ? -3 : 3);
              }

              return (
                <Link
                  href={`/canvas?discipline=${card.id}`}
                  key={card.id}
                  data-cursor="view"
                  data-cursor-text="OPEN ARCHIVE ↗"
                  onMouseEnter={() => setHoveredIdx(originalIdx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    transform: `translate(${posX}px, ${posY}px) rotate(${rot}deg) ${isHovered ? 'scale(1.08)' : 'scale(1)'}`,
                    zIndex: z,
                    transformOrigin: 'center 95%',
                  }}
                  className={`absolute w-[210px] sm:w-[225px] md:w-[240px] h-[310px] sm:h-[330px] md:h-[350px] rounded-[16px] cursor-pointer transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-none select-none touch-manipulation block ${card.borderClass}`}
                >
                  <div className={`w-full h-full rounded-[16px] p-5 flex flex-col justify-between overflow-hidden relative shadow-none ${card.bgClass} ${card.textClass}`}>
                    {/* Top Half Graphic Pattern */}
                    <div className="w-full h-[120px] flex items-center justify-center overflow-hidden">
                      {card.patternType === 'architecture' && (
                        <svg viewBox="0 0 200 120" fill="none" className="w-full h-full">
                          <line x1="10" y1="110" x2="190" y2="10" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                          <line x1="25" y1="110" x2="190" y2="25" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
                          <line x1="40" y1="110" x2="190" y2="40" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                          <line x1="55" y1="110" x2="190" y2="55" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
                          <line x1="70" y1="110" x2="190" y2="70" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                          <rect x="15" y="15" width="40" height="40" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                          <circle cx="160" cy="80" r="22" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                        </svg>
                      )}
                      {card.patternType === 'mosaic' && (
                        <svg viewBox="0 0 200 120" fill="none" className="w-full h-full">
                          <g fill="#1a1a1a" opacity="0.8">
                            <rect x="20" y="20" width="12" height="12" />
                            <rect x="36" y="20" width="12" height="12" opacity="0.3" />
                            <rect x="52" y="20" width="12" height="12" opacity="0.7" />
                            <rect x="68" y="20" width="12" height="12" opacity="0.4" />
                            <rect x="84" y="20" width="12" height="12" opacity="0.8" />
                            <rect x="100" y="20" width="12" height="12" opacity="0.2" />
                            <rect x="116" y="20" width="12" height="12" opacity="0.9" />
                            <rect x="132" y="20" width="12" height="12" opacity="0.5" />
                            <rect x="148" y="20" width="12" height="12" opacity="0.6" />
                            <rect x="20" y="36" width="12" height="12" opacity="0.5" />
                            <rect x="36" y="36" width="12" height="12" opacity="0.8" />
                            <rect x="52" y="36" width="12" height="12" opacity="0.3" />
                            <rect x="68" y="36" width="12" height="12" opacity="0.9" />
                            <rect x="84" y="36" width="12" height="12" opacity="0.4" />
                            <rect x="100" y="36" width="12" height="12" opacity="0.7" />
                            <rect x="116" y="36" width="12" height="12" opacity="0.2" />
                            <rect x="132" y="36" width="12" height="12" opacity="0.8" />
                            <rect x="148" y="36" width="12" height="12" opacity="0.4" />
                            <rect x="20" y="52" width="12" height="12" opacity="0.9" />
                            <rect x="36" y="52" width="12" height="12" opacity="0.4" />
                            <rect x="52" y="52" width="12" height="12" opacity="0.8" />
                            <rect x="68" y="52" width="12" height="12" opacity="0.2" />
                            <rect x="84" y="52" width="12" height="12" opacity="0.6" />
                            <rect x="100" y="52" width="12" height="12" opacity="0.9" />
                            <rect x="116" y="52" width="12" height="12" opacity="0.5" />
                            <rect x="132" y="52" width="12" height="12" opacity="0.3" />
                            <rect x="148" y="52" width="12" height="12" opacity="0.8" />
                          </g>
                        </svg>
                      )}
                      {card.patternType === 'waves' && (
                        <svg viewBox="0 0 200 120" fill="none" className="w-full h-full">
                          <path d="M10 30 Q50 15 100 30 T190 30" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                          <path d="M10 45 Q50 30 100 45 T190 45" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                          <path d="M10 60 Q50 45 100 60 T190 60" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                          <path d="M10 75 Q50 60 100 75 T190 75" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                          <path d="M10 90 Q50 75 100 90 T190 90" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                        </svg>
                      )}
                      {card.patternType === 'barcode' && (
                        <svg viewBox="0 0 200 120" fill="none" className="w-full h-full">
                          <g fill="#0b0b0b">
                            <rect x="20" y="20" width="3" height="60" />
                            <rect x="26" y="20" width="7" height="60" />
                            <rect x="36" y="20" width="2" height="60" />
                            <rect x="41" y="20" width="5" height="60" />
                            <rect x="49" y="20" width="9" height="60" />
                            <rect x="61" y="20" width="3" height="60" />
                            <rect x="67" y="20" width="6" height="60" />
                            <rect x="76" y="20" width="2" height="60" />
                            <rect x="81" y="20" width="8" height="60" />
                            <rect x="92" y="20" width="4" height="60" />
                            <rect x="99" y="20" width="6" height="60" />
                            <rect x="108" y="20" width="2" height="60" />
                            <rect x="113" y="20" width="7" height="60" />
                            <rect x="123" y="20" width="3" height="60" />
                            <rect x="129" y="20" width="8" height="60" />
                            <rect x="140" y="20" width="2" height="60" />
                            <rect x="145" y="20" width="6" height="60" />
                            <rect x="154" y="20" width="4" height="60" />
                            <rect x="161" y="20" width="8" height="60" />
                          </g>
                        </svg>
                      )}
                      {card.patternType === 'timeline' && (
                        <svg viewBox="0 0 200 120" fill="none" className="w-full h-full">
                          <rect x="20" y="22" width="55" height="18" rx="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                          <rect x="80" y="22" width="40" height="18" rx="3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                          <rect x="125" y="22" width="55" height="18" rx="3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                          <rect x="20" y="46" width="35" height="18" rx="3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                          <rect x="60" y="46" width="70" height="18" rx="3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                          <rect x="135" y="46" width="45" height="18" rx="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                          <rect x="20" y="70" width="80" height="18" rx="3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                          <rect x="105" y="70" width="75" height="18" rx="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                        </svg>
                      )}
                      {card.patternType === 'vectorscope' && (
                        <svg viewBox="0 0 200 120" fill="none" className="w-full h-full">
                          <circle cx="100" cy="55" r="38" stroke="#1a1a1a" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
                          <circle cx="100" cy="55" r="24" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.5" />
                          <line x1="100" y1="12" x2="100" y2="98" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.5" />
                          <line x1="57" y1="55" x2="143" y2="55" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.5" />
                          <path d="M40 85 Q70 20 100 55 T160 25" stroke="#1a1a1a" strokeWidth="2" />
                        </svg>
                      )}
                      {card.patternType === 'viewfinder' && (
                        <svg viewBox="0 0 200 120" fill="none" className="w-full h-full">
                          <rect x="25" y="15" width="150" height="90" rx="4" stroke="#111111" strokeWidth="1.5" />
                          <circle cx="100" cy="60" r="26" stroke="#111111" strokeWidth="1.5" />
                          <circle cx="100" cy="60" r="14" stroke="#111111" strokeWidth="1.2" strokeDasharray="2 2" />
                          <line x1="100" y1="30" x2="100" y2="40" stroke="#111111" strokeWidth="1.5" />
                          <line x1="100" y1="80" x2="100" y2="90" stroke="#111111" strokeWidth="1.5" />
                          <line x1="70" y1="60" x2="80" y2="60" stroke="#111111" strokeWidth="1.5" />
                          <line x1="120" y1="60" x2="130" y2="60" stroke="#111111" strokeWidth="1.5" />
                        </svg>
                      )}
                    </div>

                    {/* Bottom Half Card Content */}
                    <div className="flex flex-col gap-1 z-10">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-mono text-[10px] tracking-[-0.02em] opacity-80 uppercase font-medium">
                          {card.idxStr}
                        </span>
                        <span className="font-mono text-[9px] tracking-[-0.02em] px-2 py-0.5 rounded-full bg-black/10 uppercase font-semibold">
                          {card.badge}
                        </span>
                      </div>
                      <h3 className="font-display font-black text-lg sm:text-xl tracking-[-0.02em] uppercase leading-tight">
                        {card.title}
                      </h3>
                      <p className="font-mono text-[10px] tracking-[-0.02em] leading-snug opacity-80">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
