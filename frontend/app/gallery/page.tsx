'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Link from 'next/link';

interface Generation {
  id: string;
  image: string;
  prompt: string;
  cost: number;
  timestamp: number;
  style?: string;
  fabric?: string;
}

export default function GalleryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ethnicfit-generations') || '[]');
      setGenerations(saved.reverse());
    } catch {
      setGenerations([]);
    }
  }, []);

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-playfair text-5xl font-bold text-navy mb-4">Your Gallery</h1>
            <p className="font-sans text-charcoal/60">All your AI-generated kurta try-ons</p>
          </div>

          {generations.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-6">🧵</div>
              <h2 className="font-playfair text-2xl font-bold text-navy mb-3">No generations yet</h2>
              <p className="text-charcoal/60 mb-8">Start by designing your first kurta look</p>
              <Link
                href="/create"
                className="bg-navy text-cream px-8 py-3 rounded-xl font-medium hover:bg-navy/90 transition-colors"
              >
                Design Your Kurta →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {generations.map((gen) => (
                <div key={gen.id} className="bg-cream rounded-2xl overflow-hidden border border-gold/20 hover:border-gold/50 transition-all hover:shadow-lg">
                  <div className="aspect-[2/3] bg-navy/5 relative">
                    <img
                      src={gen.image}
                      alt="Generated kurta"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-charcoal/50">{new Date(gen.timestamp).toLocaleDateString()}</span>
                      <span className="text-xs text-gold font-medium">${gen.cost?.toFixed(3)}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <a
                        href={gen.image}
                        download={`ethnicfit-${gen.id}.png`}
                        className="flex-1 text-center bg-navy text-cream text-xs py-2 rounded-lg hover:bg-navy/90 transition-colors"
                      >
                        Download
                      </a>
                      <Link
                        href="/create"
                        className="flex-1 text-center border border-gold text-gold text-xs py-2 rounded-lg hover:bg-gold/10 transition-colors"
                      >
                        Remix
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
