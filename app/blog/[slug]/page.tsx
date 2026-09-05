'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CustomCursor from '@/components/CustomCursor';
import { BlogPost, getRelatedPosts } from '@/lib/blogData';
import { getStoredBlogPosts } from '@/lib/contentStore';

export default function BlogPostReaderPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const all = getStoredBlogPosts();
    const found = all.find((p) => p.slug === slug);
    if (found) {
      setPost(found);
      setRelated(all.filter((p) => p.slug !== slug).slice(0, 2));
    }
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center">
        <span className="font-mono text-xs text-muted tracking-widest uppercase animate-pulse">
          LOADING ESSAY...
        </span>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-4xl font-black uppercase mb-3">ESSAY NOT FOUND</h1>
        <p className="font-mono text-xs text-secondary mb-6">The requested journal entry could not be located in the archive.</p>
        <Link
          href="/blog"
          className="px-6 py-2.5 bg-primary text-white rounded-full font-mono text-xs font-bold uppercase tracking-wider"
        >
          ← RETURN TO JOURNAL
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas text-primary select-none selection:bg-accent-red selection:text-white pb-24">
      <CustomCursor />

      {/* Reader Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-5 md:px-12 bg-canvas/90 backdrop-blur-md border-b border-border-hairline flex justify-between items-center">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 font-mono text-xs text-secondary hover:text-accent-red transition-colors"
          data-cursor="view"
          data-cursor-text="BACK ↗"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span className="font-bold uppercase tracking-wider">ALL ARTICLES</span>
        </Link>

        <div className="flex items-center gap-5 font-mono text-xs">
          <Link
            href="/"
            className="text-primary hover:text-accent-red font-bold transition-colors uppercase tracking-widest"
          >
            PORTFOLIO ↗
          </Link>
          <Link
            href="/canvas"
            className="hidden sm:inline-block text-secondary hover:text-accent-red transition-colors tracking-widest uppercase"
          >
            CANVAS ↗
          </Link>
        </div>
      </header>

      {/* Article Content Container */}
      <article className="max-w-4xl mx-auto px-6 md:px-10 pt-32">
        {/* Category & Date Metadata */}
        <div className="flex items-center gap-3 font-mono text-[11px] sm:text-xs text-muted tracking-widest uppercase mb-4">
          <span className="px-2.5 py-1 bg-subtle text-primary rounded-full font-bold">
            {post.category}
          </span>
          <span>•</span>
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.readTime}</span>
        </div>

        {/* Headline & Subtitle */}
        <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl tracking-[-0.03em] leading-[0.95] text-primary uppercase mb-6">
          {post.title}
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl font-medium text-secondary leading-relaxed border-b border-black/10 pb-8 mb-10">
          {post.subtitle}
        </p>

        {/* Cover Image */}
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/5 mb-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Technical Specs Callout (If Available) */}
        {post.specs && (
          <div className="bg-[#f7f6f3] border-l-2 border-accent-red p-6 sm:p-8 rounded-r-xl mb-12 font-mono text-xs">
            <span className="font-bold text-accent-red tracking-widest uppercase block mb-4">
              TECHNICAL ON-SET SPECIFICATIONS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {post.specs.camera && (
                <div>
                  <span className="text-muted block text-[10px] uppercase mb-0.5">CAMERA &amp; OPTICS</span>
                  <span className="text-primary font-medium">{post.specs.camera}</span>
                </div>
              )}
              {post.specs.lighting && (
                <div>
                  <span className="text-muted block text-[10px] uppercase mb-0.5">LIGHTING PACKAGE</span>
                  <span className="text-primary font-medium">{post.specs.lighting}</span>
                </div>
              )}
              {post.specs.aspectRatio && (
                <div>
                  <span className="text-muted block text-[10px] uppercase mb-0.5">FRAME CADENCE</span>
                  <span className="text-primary font-medium">{post.specs.aspectRatio}</span>
                </div>
              )}
              {post.specs.deliverables && (
                <div>
                  <span className="text-muted block text-[10px] uppercase mb-0.5">DELIVERABLES</span>
                  <span className="text-primary font-medium">{post.specs.deliverables.join(' • ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Body Paragraphs */}
        <div className="flex flex-col gap-6 text-base sm:text-lg md:text-xl text-primary leading-[1.75] mb-16">
          {post.content.map((paragraph, idx) => (
            <p
              key={idx}
              className={idx === 0 ? 'first-letter:text-5xl first-letter:font-display first-letter:font-black first-letter:mr-2 first-letter:float-left first-letter:text-accent-red' : ''}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Author Bio Card */}
        <div className="border-y border-black/10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center overflow-hidden p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain filter invert" />
            </div>
            <div>
              <span className="font-display font-bold text-base text-primary uppercase block">
                {post.author.name}
              </span>
              <span className="font-mono text-xs text-secondary">
                {post.author.role} • Dubai / Worldwide
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="px-5 py-2.5 bg-primary text-white hover:bg-accent-red rounded-full font-mono text-xs font-bold tracking-wider uppercase transition-colors"
          >
            VIEW PORTFOLIO ↗
          </Link>
        </div>

        {/* Related Articles Strip */}
        {related.length > 0 && (
          <div>
            <h3 className="font-mono text-xs font-bold text-muted tracking-widest uppercase mb-6">
              ADDITIONAL ARCHIVAL ESSAYS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group block p-5 bg-subtle border border-border-hairline rounded-xl hover:-translate-y-1 transition-transform"
                >
                  <span className="font-mono text-[10px] text-accent-red uppercase tracking-wider block mb-1">
                    {rel.category}
                  </span>
                  <h4 className="font-display font-bold text-base text-primary group-hover:text-accent-red transition-colors mb-2">
                    {rel.title}
                  </h4>
                  <span className="font-mono text-[10px] text-muted">{rel.readTime} →</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
