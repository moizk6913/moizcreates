'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  visible?: boolean;
}

export default function Header({ visible = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const logoClicksRef = useRef<number>(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Secret keyboard shortcut: Ctrl+Shift+A -> /admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        router.push('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, [router]);

  // Triple-click logo secretly opens Studio Desk (/admin)
  const handleLogoClick = (e: React.MouseEvent) => {
    logoClicksRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (logoClicksRef.current >= 3) {
      e.preventDefault();
      logoClicksRef.current = 0;
      router.push('/admin');
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      logoClicksRef.current = 0;
    }, 900);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 md:px-14 py-5 sm:py-6 flex items-center justify-between pointer-events-none transition-all duration-700 ease-out bg-white/75 backdrop-blur-md border-none ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        {/* LEFT NAV LINKS (Desktop: WORK, PLAYGROUND) */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12 pointer-events-auto flex-1 justify-start">
          <Link
            href="/#work"
            className="font-display font-black text-sm uppercase tracking-widest text-black hover:text-[#e60000] transition-colors"
          >
            WORK
          </Link>
          <Link
            href="/canvas"
            className="font-display font-black text-sm uppercase tracking-widest text-black hover:text-[#e60000] transition-colors"
          >
            PLAYGROUND
          </Link>
        </div>

        {/* DEAD-CENTER BRAND MONOGRAM LOGO */}
        <div className="pointer-events-auto flex justify-center items-center">
          <Link
            href="#top"
            onClick={handleLogoClick}
            className="transition-transform duration-300 hover:scale-110 group block"
            aria-label="Moiz Khan Home"
            title="Moiz Khan • Art Director"
          >
            <Image
              src="/assets/logo.png"
              alt="Moiz Khan Logo"
              width={28}
              height={28}
              className="h-6 sm:h-7 w-auto object-contain transition-all group-hover:brightness-125"
              priority
            />
          </Link>
        </div>

        {/* RIGHT NAV LINKS (Desktop: ARCHIVE, ABOUT, CONTACT) */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12 pointer-events-auto flex-1 justify-end">
          <Link
            href="/canvas"
            className="font-display font-black text-sm uppercase tracking-widest text-black hover:text-[#e60000] transition-colors"
          >
            ARCHIVE
          </Link>
          <Link
            href="/about"
            className="font-display font-black text-sm uppercase tracking-widest text-black hover:text-[#e60000] transition-colors"
          >
            ABOUT
          </Link>
          <Link
            href="/#contact"
            className="font-display font-black text-sm uppercase tracking-widest text-black hover:text-[#e60000] transition-colors"
          >
            CONTACT
          </Link>
        </div>

        {/* MOBILE HAMBURGER BUTTON (Mobile / Tablet only) */}
        <div className="md:hidden pointer-events-auto flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full flex flex-col items-center justify-center gap-1.5 bg-black text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <span
              className={`w-4 h-0.5 bg-white transition-transform ${
                mobileMenuOpen ? 'rotate-45 translate-y-1' : ''
              }`}
            />
            <span
              className={`w-4 h-0.5 bg-white transition-transform ${
                mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
              }`}
            />
          </button>
        </div>
      </header>

      {/* MOBILE FULLSCREEN / SLIDE-DOWN DRAWER */}
      {mobileMenuOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-40 bg-white flex flex-col justify-between p-8 pt-28 animate-fadeIn md:hidden"
        >
          <nav className="flex flex-col gap-6">
            {[
              { label: 'WORK', href: '/#work' },
              { label: 'PLAYGROUND', href: '/canvas' },
              { label: 'ARCHIVE', href: '/canvas' },
              { label: 'ABOUT', href: '/about' },
              { label: 'CONTACT', href: '/#contact' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-display font-black text-3xl sm:text-4xl text-black hover:text-[#e60000] uppercase tracking-wider transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-xs font-mono text-neutral-400">→</span>
              </Link>
            ))}
          </nav>

          <div className="pt-8  flex flex-col gap-2 font-mono text-xs text-neutral-500">
            <span>MOIZ KHAN • ART DIRECTOR</span>
            <span className="text-[#e60000]">HIREMOIZ.WORKS@GMAIL.COM</span>
          </div>
        </div>
      )}
    </>
  );
}
