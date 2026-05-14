'use client';
import { motion } from 'framer-motion';
import { KURTA_STYLES, type KurtaStyle } from '@/data/kurta-styles';
import { cn } from '@/lib/utils';

interface Props {
  selected: string | null;
  onSelect: (style: KurtaStyle) => void;
}

const CATEGORIES = ['classic', 'modern', 'fusion', 'wedding'] as const;

export default function StyleSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-3xl font-bold text-navy mb-2">Select Kurta Style</h2>
        <p className="text-charcoal/60 text-sm">Pick your preferred silhouette from 18 styles</p>
      </div>

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
