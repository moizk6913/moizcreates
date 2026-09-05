'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import CustomCursor from '@/components/CustomCursor';
import { getStoredCanvasFiles } from '@/lib/contentStore';
import ArchiveFolderCard, { FolderStickerData } from '@/components/ArchiveFolderCard';

interface ArchiveFile {
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
  desc: string;
  deliverables: string[];
  photos?: string[];
  photoCount?: number;
  stickers?: FolderStickerData;
}

const ARCHIVE_FILES: ArchiveFile[] = [
  {
    id: 'windchasers',
    code: 'FILE_01.DIR',
    name: 'Windchasers Aviation Academy',
    discipline: 'Art Direction • Lookbook',
    year: '2026',
    role: 'Lead Art Director',
    x: -280,
    y: -210,
    rot: -2,
    img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f4?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 83,
    stickers: {
      stamp: { flag: '🇦🇪', countryCode: 'DXB', bgColor: '#ffffff' },
      sticker: { type: 'airplane', name: 'Aviation Wings' },
    },
    aspect: 'aspect-[16/10]',
    colorTag: 'bg-[#ff3300]',
    desc: 'High-altitude commercial lookbook and flight deck shoot direction capturing the technical precision of modern aviation trainees.',
    deliverables: ['Lookbook Concept', 'Location Scouting', 'Flight Deck Lighting', 'Broadcast Master'],
  },
  {
    id: 'easyhaibro',
    code: 'FILE_02.ID',
    name: 'Easy Hai Bro',
    discipline: 'Brand Identity • Strategy',
    year: '2026',
    role: 'Creative Director',
    x: 250,
    y: -260,
    rot: 3,
    img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 68,
    stickers: {
      stamp: { flag: '🇯🇵', countryCode: 'TYO', bgColor: '#ffffff' },
      sticker: { type: 'torii', name: 'Tokyo Shrine' },
    },
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#ff3300]',
    desc: 'Complete brand worldbuilding, punchy lifestyle shoot direction, and kinetic style system for a Gen-Z retail phenomenon.',
    deliverables: ['Visual Identity', 'Typography System', 'Commercial Campaign', 'Packaging Design'],
  },
  {
    id: 'kaladhar',
    code: 'FILE_03.LUX',
    name: 'Kaladhar Heritage Bridal',
    discipline: 'Lighting Direction • Styling',
    year: '2025',
    role: 'Director of Visuals',
    x: -580,
    y: 90,
    rot: 4,
    img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 62,
    stickers: {
      stamp: { flag: '🇮🇹', countryCode: 'MIL', bgColor: '#ffffff' },
      sticker: { type: 'lemon', name: 'Italian Lemon' },
    },
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#f59e0b]',
    desc: 'Regal bridal campaign capturing museum-grade handloom textiles through warm cinematic tungsten chiaroscuro.',
    deliverables: ['Set Design', 'Chiaroscuro Lighting', 'Model Staging', 'Editorial Lookbook'],
  },
  {
    id: 'ruchi',
    code: 'FILE_04.COM',
    name: 'Ruchi Fried Chicken',
    discipline: 'Commercial Shoot • Food Art',
    year: '2025',
    role: 'Art Director',
    x: 170,
    y: 230,
    rot: -3,
    img: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 45,
    stickers: {
      stamp: { flag: '🇺🇸', countryCode: 'NYC', bgColor: '#ffffff' },
      sticker: { type: 'flame', name: 'Kinetic Heat' },
    },
    aspect: 'aspect-[16/10]',
    colorTag: 'bg-[#00e575]',
    desc: 'High-speed culinary shoot direction combining vibrant color contrast with tactile macro slow-motion textures.',
    deliverables: ['Food Styling Direction', 'Tabletop Macro Stills', 'Color Grading', 'Social Motion Assets'],
  },
  {
    id: 'oxymorons',
    code: 'FILE_05.EXP',
    name: 'Oxymorons Collective',
    discipline: 'Visual Identity • Architecture',
    year: '2025',
    role: 'Brand Architect',
    x: 560,
    y: 50,
    rot: -2,
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 74,
    stickers: {
      stamp: { flag: '🇨🇭', countryCode: 'ZRH', bgColor: '#ffffff' },
      sticker: { type: 'diamond', name: 'Precision Gem' },
    },
    aspect: 'aspect-[16/11]',
    colorTag: 'bg-[#0055ff]',
    desc: 'Brutalist Swiss identity system built on architectural grid structures and monochromatic typographic contrast.',
    deliverables: ['Grid Framework', 'Custom Glyphs', 'Brand Book', 'Digital Architecture'],
  },
  {
    id: 'balenciaga-tokyo',
    code: 'FILE_06.FWD',
    name: 'Neo-Tokyo Runway Concept',
    discipline: 'Cinematography • Stage Direction',
    year: '2026',
    role: 'Art Director',
    x: -760,
    y: -310,
    rot: 2,
    img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 92,
    stickers: {
      stamp: { flag: '🇯🇵', countryCode: 'JPN', bgColor: '#ffffff' },
      sticker: { type: 'torii', name: 'Neo Tokyo' },
    },
    aspect: 'aspect-[3/4]',
    colorTag: 'bg-[#141414]',
    desc: 'Experimental cyber-dystopian runway showcase utilizing monolithic neon fixtures and wide-angle anamorphic lenses.',
    deliverables: ['Stage Architecture', 'Anamorphic Framing', 'Runway Master Film', 'Lighting Design'],
  },
  {
    id: 'vogue-arabia',
    code: 'FILE_07.EDT',
    name: 'Vogue Monolith Editorial',
    discipline: 'Fashion Editorial • Stills',
    year: '2025',
    role: 'Creative Director',
    x: -130,
    y: 480,
    rot: 1.5,
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 64,
    stickers: {
      stamp: { flag: '🇫🇷', countryCode: 'PAR', bgColor: '#ffffff' },
      sticker: { type: 'eiffel', name: 'Paris Couture' },
    },
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#ff3300]',
    desc: 'High-contrast studio shoot exploring sculptural silhouettes, stark light falloff, and contemporary couture drape.',
    deliverables: ['Editorial Curation', 'Model Direction', 'Analog Grain Grade', 'Cover Layout'],
  },
  {
    id: 'porsche-sound',
    code: 'FILE_08.FLM',
    name: 'Porsche 911 Soundscape',
    discipline: 'Video Editing • Sound Design',
    year: '2026',
    role: 'Editor & Colorist',
    x: 680,
    y: -380,
    rot: -2.5,
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 88,
    stickers: {
      stamp: { flag: '🇩🇪', countryCode: 'STR', bgColor: '#ffffff' },
      sticker: { type: 'car', name: 'Porsche GT3' },
    },
    aspect: 'aspect-[16/9]',
    colorTag: 'bg-[#f59e0b]',
    desc: 'Visceral automotive director cut sync-edited to raw exhaust acoustics and precision German asphalt telemetry.',
    deliverables: ['Director Cut 16:9', 'Exhaust Sound Design', 'Film Stock Emulation', 'Social Cutdowns'],
  },
  {
    id: 'prada-wireframe',
    code: 'FILE_09.KNT',
    name: 'Prada Structural Deconstruct',
    discipline: 'Motion Graphics • 3D',
    year: '2025',
    role: 'Motion Director',
    x: -420,
    y: -580,
    rot: -3.5,
    img: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 56,
    stickers: {
      stamp: { flag: '🇮🇹', countryCode: 'ITA', bgColor: '#ffffff' },
      sticker: { type: 'lemon', name: 'Italian Fashion' },
    },
    aspect: 'aspect-[1/1]',
    colorTag: 'bg-[#0055ff]',
    desc: 'Kinetic 3D wireframe exploration decomposing luxury leather goods into floating geometric architectural lines.',
    deliverables: ['3D Wireframes', 'Rhythm Title Sequences', 'Loop Animations', 'Interactive Display'],
  },
  {
    id: 'nike-kinetic',
    code: 'FILE_10.SPO',
    name: 'Nike Hyperspeed Broadcast',
    discipline: 'Motion Graphics • Title Rhythm',
    year: '2026',
    role: 'Art Director',
    x: 400,
    y: 540,
    rot: 3,
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 112,
    stickers: {
      stamp: { flag: '🇺🇸', countryCode: 'PDX', bgColor: '#ffffff' },
      sticker: { type: 'sneaker', name: 'Velocity Sneaker' },
    },
    aspect: 'aspect-[16/9]',
    colorTag: 'bg-[#ff3300]',
    desc: 'Distorted typography, frame-by-frame rhythm cuts, and high-frequency audio visualizers for athletic performance gear.',
    deliverables: ['Title Sequences', 'Broadcast Motion Kit', 'Sound Sync', '9:16 Vertical Masters'],
  },
  {
    id: 'chanel-macro',
    code: 'FILE_11.WAT',
    name: 'Chanel Haute Horlogerie',
    discipline: 'Photography • Viewfinder',
    year: '2025',
    role: 'Lead Photographer',
    x: -840,
    y: 210,
    rot: -4,
    img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 48,
    stickers: {
      stamp: { flag: '🇨🇭', countryCode: 'GVA', bgColor: '#ffffff' },
      sticker: { type: 'diamond', name: 'Sapphire Jewel' },
    },
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#141414]',
    desc: 'Ultra-macro tourbillon watch photography highlighting polished titanium gears, sapphire crystals, and reflection control.',
    deliverables: ['Macro Studio Lighting', 'Reflection Baffles', 'Focus Stacking Retouch', 'Print Catalog'],
  },
  {
    id: 'acne-analogue',
    code: 'FILE_12.GRN',
    name: 'Acne Studios Stockholm Archive',
    discipline: 'Colour Grading • 35mm',
    year: '2025',
    role: 'Colorist & Stills',
    x: -320,
    y: 710,
    rot: 2,
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 79,
    stickers: {
      stamp: { flag: '🇳🇱', countryCode: 'AMS', bgColor: '#ffffff' },
      sticker: { type: 'tulip', name: 'Dutch Tulip' },
    },
    aspect: 'aspect-[3/4]',
    colorTag: 'bg-[#ede8df]',
    desc: 'Nordic daylight lookbook shot on expired 35mm film stock, scanned at 8K and balanced for rich earthy pastel palettes.',
    deliverables: ['Film Scanning & Dust Clean', 'Kodak 5219 Emulation', 'Lookbook Binding', 'Web Campaign'],
  },
  {
    id: 'apple-emblem',
    code: 'FILE_13.SYS',
    name: 'Studio Monolith Emblem',
    discipline: 'Brand System • Swiss Deck',
    year: '2026',
    role: 'Design Lead',
    x: 820,
    y: 170,
    rot: -2,
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 52,
    stickers: {
      stamp: { flag: '🇺🇸', countryCode: 'SFO', bgColor: '#ffffff' },
      sticker: { type: 'camera', name: 'Analog Rangefinder' },
    },
    aspect: 'aspect-[1/1]',
    colorTag: 'bg-[#00e575]',
    desc: 'Kinetic design deck and identity handbook articulating grid rhythm, variable typography metrics, and brand motion rules.',
    deliverables: ['Brand Guidelines Book', 'Motion Principles', 'Component Library', 'Investor Deck'],
  },
  {
    id: 'dior-tungsten',
    code: 'FILE_14.TNG',
    name: 'Dior Midnight Nocturne',
    discipline: 'Cinematography • Film Grade',
    year: '2025',
    role: 'Director of Photography',
    x: 110,
    y: -650,
    rot: 3.5,
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 84,
    stickers: {
      stamp: { flag: '🇫🇷', countryCode: 'FR', bgColor: '#ffffff' },
      sticker: { type: 'eiffel', name: 'Nocturne Paris' },
    },
    aspect: 'aspect-[16/10]',
    colorTag: 'bg-[#f59e0b]',
    desc: 'Nocturnal perfume campaign directed under high-power tungsten fixtures with anamorphic oval bokeh and atmospheric haze.',
    deliverables: ['Anamorphic Package', 'Haze Atmospheric Control', 'Commercial Film Master', 'Print Billboards'],
  },
  {
    id: 'supreme-underground',
    code: 'FILE_15.TYP',
    name: 'Underground Type Distort',
    discipline: 'Motion Graphics • Experimental',
    year: '2026',
    role: 'Motion Designer',
    x: -620,
    y: -720,
    rot: 1.8,
    img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 136,
    stickers: {
      stamp: { flag: '🇬🇧', countryCode: 'LDN', bgColor: '#ffffff' },
      sticker: { type: 'flame', name: 'Raw Heat' },
    },
    aspect: 'aspect-[16/11]',
    colorTag: 'bg-[#ff3300]',
    desc: 'Subversive typographic kinetic posters exploring analog CRT screen glitches, photocopier streaks, and raw grain.',
    deliverables: ['Kinetic Posters', 'CRT Distortion Loops', 'Vinyl Record Sleeve', 'Sticker Packs'],
  },
  {
    id: 'saint-laurent-cut',
    code: 'FILE_16.EDT',
    name: 'Saint Laurent Winter Cut',
    discipline: 'Video Editing • Director Cut',
    year: '2025',
    role: 'Lead Video Editor',
    x: 750,
    y: 630,
    rot: -3,
    img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    ],
    photoCount: 67,
    stickers: {
      stamp: { flag: '🇫🇷', countryCode: 'PAR', bgColor: '#ffffff' },
      sticker: { type: 'film', name: '35mm Negative' },
    },
    aspect: 'aspect-[3/4]',
    colorTag: 'bg-[#141414]',
    desc: 'Rapid-fire Parisian winter fashion director cut pairing stark black-and-white silhouettes with brutalist industrial beats.',
    deliverables: ['Director Cut 4K', 'Sound Rescoring', 'Multi-Aspect Ratios', 'Color Negative Pass'],
  },
];

export default function InfiniteCanvasPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [allFiles, setAllFiles] = useState<ArchiveFile[]>(ARCHIVE_FILES);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedFile, setSelectedFile] = useState<ArchiveFile | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const custom = getStoredCanvasFiles();
    if (custom && custom.length > 0) {
      setAllFiles([...custom, ...ARCHIVE_FILES]);
    }
  }, []);

  // Gesture tracking references
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef(1);

  // Mobile viewport detection and initial scale adjustment
  useEffect(() => {
    // Lock document scroll so dragging canvas does not trigger page bounce/scroll
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedFile(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On mobile screens, initialize with comfortable overview scale
      if (mobile) {
        setZoom(0.75);
      } else {
        setZoom(1.0);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // --- UNIFIED POINTER & TOUCH GESTURE HANDLING ---

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only capture primary button (mouse left or single touch)
    if (e.button !== 0) return;
    
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };

    // Capture pointer so drag persists even if finger moves fast or leaves viewport
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // Fallback safe
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Movement threshold to differentiate between a tap and a drag
    if (Math.hypot(deltaX, deltaY) > 6) {
      hasMovedRef.current = true;
    }

    setPan({
      x: panStartRef.current.x + deltaX,
      y: panStartRef.current.y + deltaY,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Fallback safe
    }
  };

  // --- TWO-FINGER PINCH-TO-ZOOM FOR MOBILE TOUCH ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      initialZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / initialPinchDistRef.current;
      const newZoom = Math.min(Math.max(initialZoomRef.current * scale, 0.4), 1.8);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    initialPinchDistRef.current = null;
  };

  // --- DESKTOP WHEEL ZOOM ---
  const handleWheel = (e: React.WheelEvent) => {
    // Zoom on pinch trackpad or Ctrl + Wheel
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
      setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 1.8));
    } else {
      // Scroll to pan
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8,
      }));
    }
  };

  const handleFileClick = (file: ArchiveFile) => {
    // If the user was dragging/panning the canvas, don't open the modal
    if (hasMovedRef.current) return;
    setSelectedFile(file);
  };

  return (
    <main
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className="relative w-screen h-screen overflow-hidden bg-[#faf9f6] select-none touch-none"
      style={{ touchAction: 'none' }}
      data-cursor="drag"
    >
      {/* Luxury Custom Fluid Cursor (Auto-disabled on mobile) */}
      <CustomCursor />

      {/* Limitless Dotted Grid Infinite Canvas (Fine subtle architectural dots) */}
      <div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{
          backgroundImage: 'radial-gradient(#dcdad2 0.9px, transparent 0.9px)',
          backgroundSize: `${(isMobile ? 22 : 28) * zoom}px ${(isMobile ? 22 : 28) * zoom}px`,
          backgroundPosition: `${pan.x % ((isMobile ? 22 : 28) * zoom)}px ${pan.y % ((isMobile ? 22 : 28) * zoom)}px`,
        }}
      />

      {/* Floating Minimalist Back Button Only */}
      <header className="fixed top-0 left-0 z-50 p-4 sm:p-6 md:p-8 pointer-events-none">
        <Link
          href="/"
          className="group pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-[10px] font-mono text-[11px] sm:text-xs text-primary hover:text-accent-red active:scale-95 transition-all shadow-none border-0"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span className="font-bold">BACK TO PORTFOLIO</span>
        </Link>
      </header>

      {/* Limitless World Stage (Pans & Zooms smoothly with gestures) */}
      <div
        className="absolute top-1/2 left-1/2 will-change-transform transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Archival Frosted-Glass 3D Folders (Images 1, 3, 4, 5 Reference) */}
        {allFiles.map((file) => (
          <div
            key={file.id}
            data-cursor="view"
            data-cursor-text="OPEN ↗"
            style={{
              left: `${file.x}px`,
              top: `${file.y}px`,
              transform: `translate(-50%, -50%) rotate(${file.rot}deg)`,
            }}
            className="absolute transition-transform duration-300 hover:z-50 select-none touch-manipulation"
          >
            <ArchiveFolderCard
              id={file.id}
              code={file.code}
              name={file.name}
              discipline={file.discipline}
              year={file.year}
              role={file.role}
              photos={file.photos && file.photos.length > 0 ? file.photos : [file.img]}
              photoCount={file.photoCount || 68}
              stickers={file.stickers}
              colorTag={file.colorTag}
              onClick={() => handleFileClick(file)}
            />
          </div>
        ))}
      </div>

      {/* Project Detail Lightbox Modal (Apple Folder Gallery Drawer - Image 5 style) */}
      {selectedFile && (
        <div
          onClick={() => setSelectedFile(null)}
          className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-[#faf9f6] rounded-[10px] overflow-hidden shadow-2xl border border-black/10 flex flex-col max-h-[92vh]"
          >
            {/* Folder Header with Back Arrow Button (Image 5 exact style) */}
            <div className="px-5 py-4 sm:px-7 sm:py-5 bg-white/80 backdrop-blur-md border-b border-black/[0.06] flex justify-between items-center z-20 flex-shrink-0">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Image 5 Top-Left Back Button */}
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="w-10 h-10 rounded-[10px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-black/5 hover:bg-black hover:text-white active:scale-90 text-primary flex items-center justify-center text-lg font-bold transition-all"
                  title="Back to Archive"
                >
                  ←
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-2xl font-display font-black tracking-tight text-primary leading-tight">
                      {selectedFile.name}
                    </h2>
                    <span className="hidden sm:inline-block font-mono text-[10px] px-2.5 py-0.5 rounded-[10px] bg-black/5 text-secondary font-semibold">
                      {selectedFile.photoCount || 68} photos
                    </span>
                  </div>
                  <p className="font-mono text-[10px] sm:text-xs text-secondary mt-0.5">
                    {selectedFile.code} • {selectedFile.discipline} • {selectedFile.year}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="w-9 h-9 rounded-[10px] bg-black/5 hover:bg-black/10 active:scale-90 text-secondary flex items-center justify-center font-mono text-xs transition-all"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Folder Content Gallery (Scrollable collection of campaign photos & stills) */}
            <div className="p-5 sm:p-7 md:p-8 overflow-y-auto space-y-6">
              
              {/* Photo Grid Collection (White-Bordered Editorial Prints) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {(selectedFile.photos && selectedFile.photos.length > 0 ? selectedFile.photos : [selectedFile.img]).map((photoUrl, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-[10px] bg-white p-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.06)] border border-black/[0.04] transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <div className="relative w-full aspect-[4/3] rounded-[10px] overflow-hidden bg-black/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoUrl}
                        alt={`${selectedFile.name} still ${idx + 1}`}
                        className="w-full h-full object-cover block"
                        loading="lazy"
                      />
                    </div>
                    <div className="mt-2 px-1 flex justify-between items-center font-mono text-[9px] text-muted">
                      <span>PLATE // 0{idx + 1}</span>
                      <span className="text-accent-red font-semibold">35MM SCAN</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Directorial Narrative & Deliverables */}
              <div className="bg-white rounded-[10px] p-5 sm:p-6 border border-black/[0.06] shadow-sm space-y-4">
                <div>
                  <span className="font-mono text-[10px] sm:text-xs text-accent-red font-bold uppercase tracking-wider block mb-1">
                    Director Narrative &amp; Approach
                  </span>
                  <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                    {selectedFile.desc}
                  </p>
                </div>

                <div className="border-t border-black/5 pt-4">
                  <span className="font-mono text-[10px] sm:text-xs font-bold text-primary uppercase block mb-2">
                    Scope of Deliverables:
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedFile.deliverables.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#f5f4f0] border border-black/5 rounded-[10px] font-mono text-[10px] sm:text-xs text-secondary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Folder Footer */}
            <div className="px-6 py-3.5 bg-white/80 border-t border-black/[0.06] flex justify-between items-center text-xs font-mono text-secondary flex-shrink-0">
              <span className="text-[10px] sm:text-xs">{selectedFile.role}</span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="font-bold text-accent-red hover:underline text-xs p-1"
              >
                CLOSE FOLDER [✕]
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
