'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { submitContactInquiry } from '@/lib/contentStore';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [indiaTime, setIndiaTime] = useState('');
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryService, setInquiryService] = useState('Commercial Campaign');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryHp, setInquiryHp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const email = 'hiremoiz.work@gmail.com';

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(now);
        setIndiaTime(formatted);
      } catch {
        setIndiaTime('');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setInquiryStatus(null);

    try {
      const res = await submitContactInquiry({
        name: inquiryName,
        email: inquiryEmail,
        service: inquiryService,
        message: inquiryMessage,
        _hp: inquiryHp,
      });

      if (res.success) {
        setInquiryStatus({ success: true, message: '✓ Inquiry received. The studio will review your project within 24 hours.' });
        setInquiryName('');
        setInquiryEmail('');
        setInquiryMessage('');
        setTimeout(() => {
          setIsInquiryModalOpen(false);
          setInquiryStatus(null);
        }, 3000);
      } else {
        setInquiryStatus({ success: false, message: res.error || 'Failed to transmit inquiry.' });
      }
    } catch {
      setInquiryStatus({ success: false, message: 'Transmission error. Please email directly.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer
      id="contact"
      style={{ paddingTop: 'var(--footer-top, 56px)' }}
      className="w-full pb-0 bg-white relative select-none border-none flex flex-col justify-between overflow-x-hidden"
    >
      {/* MAIN ARTBOARD CONTAINER (Exact layout from user screenshot) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px] flex-1 flex flex-col justify-between relative z-10 space-y-8 sm:space-y-10 md:space-y-12">
        
        {/* TOP ROW: ICON / MONOGRAM (Scaled 30% smaller) */}
        <div className="flex items-center justify-start">
          <Link
            href="#top"
            className="group block transition-transform duration-300 hover:scale-105"
            aria-label="Moiz Khan Logo"
          >
            <Image
              src="/assets/logo.png"
              alt="Moiz Khan"
              width={34}
              height={34}
              className="h-[22px] sm:h-[25px] md:h-7 w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity"
              priority
            />
          </Link>
        </div>

        {/* MID-BODY: THE 3 EDITORIAL BLOCKS */}
        <div className="w-full flex flex-col space-y-6 sm:space-y-8">
          
          {/* Row 1: BUSINESS INQUIRIES (Left) & STUDIO DIRECTORY (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Block 1: BUSINESS INQUIRIES */}
            <div className="md:col-span-5 lg:col-span-5 space-y-2">
              <span className="font-britti font-medium text-xs sm:text-sm tracking-wider text-black uppercase block">
                BUSINESS INQUIRIES
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="font-britti font-medium text-xs sm:text-sm md:text-[15px] text-black hover:text-neutral-500 uppercase tracking-wider transition-colors block text-left group cursor-pointer"
                    title="Click to copy email address"
                  >
                    <span className="group-hover:underline underline-offset-4">
                      {email}
                    </span>
                    {copied && (
                      <span className="ml-2 text-[10px] font-britti font-normal text-white normal-case bg-black px-2 py-0.5 rounded-full inline-block">
                        ✓ Copied
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInquiryModalOpen(true)}
                    className="px-3 py-1 rounded-full bg-black/5 hover:bg-black hover:text-white transition-all text-[11px] font-mono font-bold uppercase tracking-wider text-black cursor-pointer"
                    title="Open online inquiry form"
                  >
                    Inquire Online ↗
                  </button>
                </div>
                <p className="font-britti font-normal text-[11px] sm:text-xs text-neutral-500 uppercase tracking-wide">
                  COMMISSIONS &amp; CAMPAIGNS
                </p>
              </div>
            </div>

            {/* Block 2: STUDIO DIRECTORY */}
            <div className="md:col-start-7 md:col-span-6 lg:col-start-8 lg:col-span-5 space-y-2">
              <span className="font-britti font-medium text-xs sm:text-sm tracking-wider text-black uppercase block">
                STUDIO DIRECTORY
              </span>
              <div className="space-y-1">
                <nav className="flex flex-wrap items-center gap-x-5 sm:gap-x-6 gap-y-1 font-britti font-medium text-xs sm:text-sm uppercase tracking-wider text-black">
                  <Link href="/#work" className="hover:text-neutral-500 transition-colors">
                    WORK
                  </Link>
                  <Link href="/canvas?view=playground" className="hover:text-neutral-500 transition-colors">
                    PLAYGROUND
                  </Link>
                  <Link href="/canvas?view=archive" className="hover:text-neutral-500 transition-colors">
                    ARCHIVE
                  </Link>
                </nav>
                <p className="font-britti font-normal text-[11px] sm:text-xs text-neutral-500 uppercase tracking-wide">
                  NAVIGATE PORTFOLIO
                </p>
              </div>
            </div>

          </div>

          {/* Row 2: DIRECT CHANNELS (Centered horizontally) */}
          <div className="w-full flex flex-col items-center text-center space-y-2 pt-1 sm:pt-2">
            <span className="font-britti font-medium text-xs sm:text-sm tracking-wider text-black uppercase block">
              DIRECT CHANNELS
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2 font-britti font-medium text-xs sm:text-sm uppercase tracking-wider text-black">
              <a
                href="https://www.instagram.com/moizcreates_/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-500 transition-colors flex items-center gap-1 group"
              >
                <span>INSTAGRAM</span>
                <span className="text-[11px] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
              <a
                href="https://www.linkedin.com/in/moizcreates/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-500 transition-colors flex items-center gap-1 group"
              >
                <span>LINKEDIN</span>
                <span className="text-[11px] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
              <a
                href="mailto:hiremoiz.work@gmail.com"
                className="hover:text-neutral-500 transition-colors flex items-center gap-1 group"
              >
                <span>EMAIL</span>
                <span className="text-[11px] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
            </div>
          </div>

        </div>

        {/* HORIZON METADATA ROW */}
        <div className="w-full flex items-center justify-between pt-6 sm:pt-8 pb-1 border-none text-xs sm:text-sm font-britti font-normal text-neutral-600">
          {/* Left: Location */}
          <div className="text-left font-normal text-neutral-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 inline-block" />
            <span>Hyderabad, India</span>
          </div>

          {/* Center: Legal */}
          <div className="text-center font-normal text-neutral-500 hidden sm:block">
            All rights reserved // 2026
          </div>

          {/* Right: Time (IST) */}
          <div className="text-right text-neutral-600 font-normal flex items-center gap-1.5">
            <span>Time (IST)</span>
            {indiaTime && (
              <span className="font-mono text-black font-semibold">
                [{indiaTime}]
              </span>
            )}
          </div>
        </div>

      </div>

      {/* MONUMENTAL WORDMARK — 100% EDGE-TO-EDGE FLUSH TO SCREEN BORDERS */}
      <div className="w-full overflow-hidden select-none leading-none pt-2 sm:pt-4 pb-0">
        <svg
          viewBox="0 0 10607 1410"
          className="w-full h-auto block select-none overflow-visible"
        >
          <text
            x="-96"
            y="1370"
            textLength="10703"
            lengthAdjust="spacing"
            fontFamily="'Britti Sans', sans-serif"
            fontWeight="700"
            fontSize="2048"
            fill="#000"
            className="hover:fill-neutral-800 transition-colors duration-500 cursor-default"
          >
            MOIZ KHAN
          </text>
        </svg>
      </div>

      {/* DIRECT INQUIRY EDITORIAL POPUP MODAL */}
      {isInquiryModalOpen && (
        <div
          onClick={() => setIsInquiryModalOpen(false)}
          className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 selection:bg-black selection:text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Directorial Inquiry"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-[36px] p-6 sm:p-8 shadow-2xl flex flex-col space-y-5 relative"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-black inline-block" />
                  <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-neutral-500">
                    MOIZ KHAN // DIRECT TRANSMISSION
                  </span>
                </div>
                <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-neutral-900 leading-tight">
                  Directorial Inquiry
                </h3>
                <p className="font-sans text-xs text-neutral-500 mt-1">
                  Commissions, multi-format campaigns, and creative direction.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsInquiryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-black hover:text-white flex items-center justify-center text-xs font-bold transition cursor-pointer"
                aria-label="Close Inquiry Modal"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleInquirySubmit} className="flex flex-col space-y-3.5">
              {/* Anti-spam honeypot (hidden from human users) */}
              <input
                type="text"
                name="_hp"
                value={inquiryHp}
                onChange={(e) => setInquiryHp(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                style={{ display: 'none' }}
                aria-hidden="true"
              />

              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jean-Luc Godard"
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-black font-sans"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Direct Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="director@studio.com"
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-black font-sans"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Scope of Direction
                </label>
                <select
                  value={inquiryService}
                  onChange={(e) => setInquiryService(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-black font-sans bg-white"
                >
                  <option value="Commercial Campaign">Commercial Campaign &amp; Direction</option>
                  <option value="Art Direction">Art Direction &amp; Concept Architecture</option>
                  <option value="Cinematography">Cinematography &amp; Shoot Direction</option>
                  <option value="Motion Graphics">Motion Graphics &amp; Visual Effects</option>
                  <option value="Brand Identity">Brand Identity &amp; Packaging</option>
                  <option value="Editorial Lookbook">Editorial Lookbook &amp; Photography</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Project Brief &amp; Timeline *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Outline the project scope, locations, target dates, or campaign goals..."
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-black font-sans leading-relaxed"
                />
              </div>

              {inquiryStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono font-semibold ${
                    inquiryStatus.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                  }`}
                >
                  {inquiryStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full bg-black text-white hover:bg-neutral-800 font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md mt-1"
              >
                {isSubmitting ? 'Transmitting to Studio...' : 'Transmit Inquiry →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
