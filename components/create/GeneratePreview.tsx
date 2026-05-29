'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCostEstimate } from '@/lib/prompt-builder';

interface SelectionSummary {
  kurtaStyle?: { name: string } | null;
  fabricName?: string;
  neckline?: { name: string } | null;
  sleeve?: { name: string } | null;
  embellishment?: { name: string } | null;
  bottomWear?: string;
}

interface Props {
  selections: SelectionSummary;
  userPhoto: File | null;
  onGenerate: (quality: 'low' | 'medium' | 'high') => Promise<void>;
  result: string | null;
  isLoading: boolean;
  error: string | null;
}

export default function GeneratePreview({
  selections,
  userPhoto,
  onGenerate,
  result,
  isLoading,
  error,
}: Props) {
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('low');

  const summary = [
    { label: 'Style', value: selections.kurtaStyle?.name },
    { label: 'Fabric', value: selections.fabricName },
    { label: 'Neckline', value: selections.neckline?.name },
    { label: 'Sleeves', value: selections.sleeve?.name },
    { label: 'Embellishment', value: selections.embellishment?.name },
    { label: 'Bottom Wear', value: selections.bottomWear || 'Churidar' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-3xl font-bold text-navy mb-2">Generate Your Look</h2>
        <p className="text-charcoal/60 text-sm">Review your selections and generate the AI try-on</p>
      </div>

      {/* Summary */}
      <div className="bg-navy/5 rounded-2xl p-5 space-y-2">
        {summary.map(({ label, value }) => value && (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-charcoal/50 font-cormorant">{label}</span>
            <span className="text-navy font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* Quality Selector */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-cormorant text-lg font-semibold text-gold">Quality</h3>
          <span className="text-xs text-charcoal/40">High uses portrait size · Low/Med use square</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { q: 'low', size: '1024×1024', badge: 'Best Value' },
              { q: 'medium', size: '1024×1024', badge: null },
              { q: 'high', size: '1024×1536', badge: 'Portrait' },
            ] as const
          ).map(({ q, size, badge }) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`p-3 rounded-xl border-2 text-sm transition-all relative ${
                quality === q ? 'border-gold bg-gold/5 font-semibold' : 'border-gold/20 hover:border-gold/40'
              }`}
            >
              {badge && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-gold text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  {badge}
                </span>
              )}
              <div className="font-medium capitalize mt-1">{q}</div>
              <div className="text-xs text-charcoal/50 mt-0.5">~${getCostEstimate(q).toFixed(3)}</div>
              <div className="text-[10px] text-charcoal/30 mt-0.5">{size}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      {!result && (
        <button
          onClick={() => onGenerate(quality)}
          disabled={isLoading || !userPhoto}
          className="w-full bg-navy text-cream py-4 rounded-xl font-bold text-lg hover:bg-navy/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gold/30"
        >
          {isLoading ? '✨ Generating...' : `Generate ${quality.charAt(0).toUpperCase() + quality.slice(1)} Preview`}
        </button>
      )}

      {/* Loading Animation */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            <div className="text-center">
              <p className="font-playfair text-lg font-bold text-navy">Creating your look...</p>
              <p className="text-sm text-charcoal/60 mt-1">This may take 15–30 seconds</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => onGenerate(quality)}
            className="mt-2 text-xs text-red-500 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl overflow-hidden border border-gold/20">
              <img src={result} alt="Generated kurta" className="w-full" />
            </div>
            <div className="flex gap-3">
              <a
                href={result}
                download="ethnicfit-kurta.png"
                className="flex-1 text-center bg-navy text-cream py-3 rounded-xl font-medium hover:bg-navy/90 transition-colors"
              >
                ↓ Download
              </a>
              <button
                onClick={() => onGenerate(quality)}
                className="flex-1 border border-gold text-gold py-3 rounded-xl font-medium hover:bg-gold/10 transition-colors"
              >
                ↺ Regenerate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
