import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Mono, DM_Mono } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Art Director & Brand Visual Designer',
  description: 'Art Director & Brand Visual Designer. Commercial campaigns, shoot direction, visual systems. Dubai / Worldwide.',
  icons: {
    icon: [
      { url: '/assets/logo.png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} ${dmMono.variable} ${spaceMono.variable}`}>
      <body className="font-sans bg-canvas text-primary selection:bg-accent-red selection:text-white">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
