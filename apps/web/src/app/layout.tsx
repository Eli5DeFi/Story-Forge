import type { Metadata } from 'next';
import { Inter, Merriweather, Cinzel } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
});

export const metadata: Metadata = {
  title: 'Story-Forge | Interactive AI Web Novel',
  description:
    'Experience AI-generated fantasy stories where you predict the outcomes. Bet on story directions, collect unique NFTs, and explore rich lore.',
  keywords: [
    'AI story',
    'web novel',
    'prediction market',
    'NFT',
    'fantasy',
    'web3',
    'interactive fiction',
  ],
  authors: [{ name: 'Story-Forge Team' }],
  openGraph: {
    title: 'Story-Forge | Interactive AI Web Novel',
    description:
      'Experience AI-generated fantasy stories where you predict the outcomes.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Story-Forge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Story-Forge | Interactive AI Web Novel',
    description:
      'Experience AI-generated fantasy stories where you predict the outcomes.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${merriweather.variable} ${cinzel.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
