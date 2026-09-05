'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CustomCursor from '@/components/CustomCursor';
import { BlogPost } from '@/lib/blogData';
import { getStoredBlogPosts } from '@/lib/contentStore';

const CATEGORIES = ['ALL', 'LIGHTING & ON-SET', 'TYPOGRAPHY', 'MOTION & EDITORIAL', 'CASE STUDY'] as const;

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  useEffect(() => {
    setPosts(getStoredBlogPosts());
  }, []);

  const filteredPosts = activeCategory === 'ALL'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <main className="min-h-screen bg-canvas text-primary select-none selection:bg-accent-red selection:text-white">
      <CustomCursor />

      {/* Standalone Editorial Header with Prominent Backlink to Main Portfolio */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 bg-canvas/90 backdrop-blur-md border-b border-border-hairline flex justify-between items-center">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 font-mono text-xs text-primary hover:text-accent-red transition-colors"
          data-cursor="view"
          data-cursor-text="HOME ↗"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span className="font-bold tracking-wider uppercase">MOIZ KHAN • PORTFOLIO</span>
        </Link>

        <div className="flex items-center gap-6 font-mono text-xs tracking-widest">
          <Link
            href="/canvas"
            className="text-secondary hover:text-accent-red transition-colors"
          >
            ARCHIVE ↗
          </Link>
        </div>
      </header>

      {/* Main Publication Canvas Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24">
        {/* Editorial Publication Masthead */}
        <div className="border-b border-black/10 pb-10 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-red inline-block" />
            <span className="font-mono text-xs text-muted tracking-widest uppercase">
              DIRECTOR'S NOTEBOOK • VOL. 2026
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-[-0.03em] uppercase leading-[0.85] text-primary mb-4">
            THE JOURNAL
          </h1>

          <p className="font-mono text-xs sm:text-sm text-secondary max-w-2xl leading-relaxed">
            Technical breakdowns on commercial lighting, Swiss typographic systems, kinetic motion cadences, and director-level brand architecture.
          </p>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-12 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-mono text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all uppercase tracking-wider ${
                activeCategory === cat
                  ? 'bg-primary text-white font-bold'
                  : 'bg-subtle text-secondary hover:bg-black/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Article Hero Spotlight */}
        {featuredPost && (
          <article className="mb-20">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#f8f7f5] rounded-2xl p-6 sm:p-8 md:p-10 transition-transform duration-300 hover:scale-[1.01]"
              data-cursor="view"
              data-cursor-text="READ ↗"
            >
              <div className="lg:col-span-7 relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="eager"
                />
                <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full font-mono text-[10px] text-white tracking-widest uppercase">
                  {featuredPost.category}
                </span>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between h-full py-2">
                <div>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-muted tracking-wider mb-3">
                    <span>{featuredPost.date}</span>
                    <span>•</span>
                    <span>{featuredPost.readTime}</span>
                  </div>

                  <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight text-primary group-hover:text-accent-red transition-colors mb-3">
                    {featuredPost.title}
                  </h2>

                  <p className="text-sm md:text-base text-secondary leading-relaxed line-clamp-3 mb-6">
                    {featuredPost.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-black/10">
                  <span className="font-mono text-xs font-bold text-primary group-hover:text-accent-red transition-colors">
                    READ ESSAY →
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    BY {featuredPost.author.name.toUpperCase()}
                  </span>
                </div>
              </div>
            </Link>
          </article>
        )}

        {/* Chronological Grid of Additional Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {remainingPosts.map((post) => (
            <article key={post.slug} className="flex flex-col">
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full bg-[#fbfaf8] border border-border-hairline rounded-xl overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1.5"
                data-cursor="view"
                data-cursor-text="OPEN ↗"
              >
                <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-black/5 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded font-mono text-[9px] text-white tracking-wider uppercase">
                    {post.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px] text-muted tracking-wider mb-2">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                <h3 className="font-display font-bold text-lg sm:text-xl tracking-tight text-primary group-hover:text-accent-red transition-colors leading-snug mb-2">
                  {post.title}
                </h3>

                <p className="font-mono text-xs text-secondary leading-relaxed line-clamp-2 mt-auto pt-2 border-t border-border-hairline">
                  {post.excerpt}
                </p>

                <div className="mt-3 flex items-center justify-between text-[10px] font-mono font-bold text-accent-red pt-1">
                  <span>READ ARCHIVE</span>
                  <span>↗</span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Back to Top / Return to Portfolio CTA Banner */}
        <div className="mt-24 p-8 sm:p-12 bg-primary text-white rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="font-mono text-xs text-accent-red tracking-widest uppercase block mb-1">
              DIRECTOR ARCHIVE
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight">
              Ready to explore the active directed work?
            </h3>
            <p className="font-mono text-xs text-white/70 mt-1 max-w-md">
              Step directly into Moiz Khan's interactive limitless constellation and project cases.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/"
              className="px-6 py-3 bg-white text-primary hover:bg-accent-red hover:text-white rounded-full font-mono text-xs font-bold tracking-wider transition-colors uppercase"
            >
              ← RETURN TO PORTFOLIO
            </Link>
            <Link
              href="/canvas"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-mono text-xs font-bold tracking-wider transition-colors uppercase"
            >
              LIMITLESS ARCHIVE ↗
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
