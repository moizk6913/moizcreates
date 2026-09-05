'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  visible?: boolean;
}

export default function Header({ visible = true }: HeaderProps) {
  const [worldTime, setWorldTime] = useState('DUBAI 12:00 PM GST');
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const worldCities = [
      { city: 'DUBAI', zone: 'Asia/Dubai', code: 'GST' },
      { city: 'NEW YORK', zone: 'America/New_York', code: 'EDT' },
      { city: 'LONDON', zone: 'Europe/London', code: 'BST' },
      { city: 'MUMBAI', zone: 'Asia/Kolkata', code: 'IST' },
      { city: 'TOKYO', zone: 'Asia/Tokyo', code: 'JST' },
    ];

    let currentIdx = 0;

    const getTime = (cityObj: typeof worldCities[0]) => {
      try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          timeZone: cityObj.zone,
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        };
        const str = new Intl.DateTimeFormat('en-US', options).format(now);
        return `${cityObj.city} ${str} ${cityObj.code}`;
      } catch {
        return `${cityObj.city} 12:00 PM ${cityObj.code}`;
      }
    };

    const updateDisplay = () => {
      setWorldTime(getTime(worldCities[currentIdx]));
    };

    updateDisplay();
    const liveInterval = setInterval(updateDisplay, 1000);

    const cycleInterval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        currentIdx = (currentIdx + 1) % worldCities.length;
        updateDisplay();
        setIsFading(false);
      }, 250);
    }, 3000);

    return () => {
      clearInterval(liveInterval);
      clearInterval(cycleInterval);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 flex justify-between items-center pointer-events-none transition-opacity duration-700 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Geometric Logo Only */}
      <Link href="#top" className="pointer-events-auto transition-transform hover:scale-105" aria-label="Home">
        <Image
          src="/assets/logo.png"
          alt="Art Director Logo"
          width={24}
          height={24}
          className="h-6 w-auto object-contain"
          priority
        />
      </Link>

      <div className="flex items-center gap-8 pointer-events-auto">
        <div 
          className={`hidden sm:block font-mono text-xs text-muted tracking-wider transition-opacity duration-300 ${
            isFading ? 'opacity-30' : 'opacity-100'
          }`}
        >
          {worldTime}
        </div>

        <nav className="flex items-center gap-6" aria-label="Main Navigation">
          <Link href="/canvas" className="font-mono text-xs tracking-widest text-secondary hover:text-accent-red transition-colors">
            ARCHIVE ↗
          </Link>
          <Link href="/about" className="font-mono text-xs tracking-widest text-secondary hover:text-accent-red transition-colors">
            ABOUT ↗
          </Link>
          <Link href="/#contact" className="font-mono text-xs tracking-widest text-secondary hover:text-primary transition-colors">
            CONTACT
          </Link>
        </nav>
      </div>
    </header>
  );
}
