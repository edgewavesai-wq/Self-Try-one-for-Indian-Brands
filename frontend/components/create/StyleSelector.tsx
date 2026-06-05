'use client';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { KURTA_STYLES, type KurtaStyle } from '@/data/kurta-styles';
import { cn } from '@/lib/utils';
import { Upload, X } from 'lucide-react';

interface Props {
  selected: string | null;
  onSelect: (style: KurtaStyle) => void;
  styleRefPreview: string;
  onStyleRefChange: (file: File | null, preview: string) => void;
}

const CATEGORIES = ['classic', 'modern', 'fusion', 'wedding'] as const;

export default function StyleSelector({ selected, onSelect, styleRefPreview, onStyleRefChange }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => onStyleRefChange(file, reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearRef = () => {
    onStyleRefChange(null, '');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-3xl font-bold text-navy mb-2">Select Kurta Style</h2>
        <p className="text-charcoal/60 text-sm">Upload a reference photo or pick from 18 styles below</p>
      </div>

      {/* ── Reference Photo Upload ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-cormorant text-lg font-semibold text-gold">Reference Style Photo</h3>
          <span className="text-xs text-charcoal/40 bg-navy/5 px-2 py-0.5 rounded-full font-sans">Optional</span>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {styleRefPreview ? (
          <div className="relative rounded-xl overflow-hidden border-2 border-gold/60 group">
            <img src={styleRefPreview} alt="Style reference" className="w-full h-44 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent flex items-end p-3">
              <span className="text-white text-xs font-medium">
                ✓ AI will match this style's silhouette and design elements
              </span>
            </div>
            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => fileRef.current?.click()}
                className="px-2.5 py-1 bg-gold text-white text-xs rounded-md font-medium hover:bg-gold/90"
              >
                Change
              </button>
              <button
                onClick={clearRef}
                className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all"
              >
                <X size={11} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => fileRef.current?.click()}
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all',
              dragOver ? 'border-gold bg-gold/5' : 'border-gold/30 hover:border-gold/60 hover:bg-gold/3'
            )}
          >
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Upload size={20} className="text-gold" />
            </div>
            <div>
              <p className="text-navy text-sm font-medium">Upload a kurta photo for style reference</p>
              <p className="text-charcoal/50 text-xs mt-0.5">
                AI will extract the silhouette, cut and design elements from your photo
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gold/20" />
        <span className="text-xs text-charcoal/40 font-cormorant">or choose a preset style</span>
        <div className="flex-1 h-px bg-gold/20" />
      </div>

      {/* ── Style grid ── */}
      {CATEGORIES.map((cat) => (
        <div key={cat}>
          <h3 className="font-cormorant text-lg font-semibold text-gold mb-3 capitalize">{cat} Styles</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {KURTA_STYLES.filter((s) => s.category === cat).map((style) => (
              <motion.button
                key={style.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(style)}
                className={cn(
                  'text-left p-4 rounded-xl border-2 transition-all',
                  selected === style.id
                    ? 'border-gold bg-gold/5 shadow-md'
                    : 'border-gold/20 hover:border-gold/50 bg-cream'
                )}
              >
                <div className="text-2xl mb-2">{style.icon}</div>
                <div className="font-playfair text-sm font-bold text-navy">{style.name}</div>
                <div className="font-sans text-xs text-charcoal/60 mt-1 leading-tight">{style.description}</div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
