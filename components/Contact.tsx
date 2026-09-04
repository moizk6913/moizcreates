'use client';

import { useState } from 'react';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('moiz@moizkhan.com').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <section id="contact" className="w-full py-24 md:py-32 bg-canvas border-b border-border-hairline">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          
          <div>
            <span className="font-mono text-xs text-accent-red tracking-wider block mb-2">03 / INITIATE</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary mb-3">
              Direct Contact<span className="text-accent-red">.</span>
            </h2>
            <p className="text-sm md:text-base text-secondary leading-relaxed max-w-md">
              Available for Director / Content Lead roles in Dubai and select brand commissions worldwide.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 flex-wrap">
              <a
                href="mailto:moiz@moizkhan.com"
                className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-primary hover:text-accent-red transition-colors"
              >
                moiz@moizkhan.com
              </a>
              <button
                onClick={handleCopy}
                className="font-mono text-xs font-semibold px-3 py-1.5 bg-subtle border border-border-medium hover:bg-primary hover:text-white transition-colors"
              >
                {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>

            <div className="flex gap-6 pt-4 border-t border-border-hairline">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-secondary hover:text-accent-red transition-colors"
              >
                LinkedIn ↗
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-secondary hover:text-accent-red transition-colors"
              >
                Instagram ↗
              </a>
              <a
                href="#top"
                className="font-mono text-xs text-secondary hover:text-accent-red transition-colors ml-auto"
              >
                Back to Top ↑
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
