'use client';
import { motion } from 'framer-motion';
import { FABRIC_PRESETS } from '@/data/fabrics';
import { cn } from '@/lib/utils';

interface Props {
  selected: string | null;
  onSelect: (id: string, prompt: string, name: string) => void;
}

export default function FabricSelector({ selected, onSelect }: Props) {
  const categories = Array.from(new Set(FABRIC_PRESETS.map((f) => f.category)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-3xl font-bold text-navy mb-2">Select Fabric</h2>
        <p className="text-charcoal/60 text-sm">Choose the fabric for your kurta</p>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="font-cormorant text-lg font-semibold text-gold mb-3">{cat}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {FABRIC_PRESETS.filter((f) => f.category === cat).map((fabric) => (
              <motion.button
                key={fabric.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(fabric.id, fabric.prompt, fabric.name)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                  selected === fabric.id
                    ? 'border-gold shadow-md shadow-gold/20'
                    : 'border-transparent hover:border-gold/40'
                )}
              >
                <div
                  className="w-12 h-12 rounded-lg border border-black/10"
                  style={{ backgroundColor: fabric.color }}
                />
                <span className="text-xs text-center text-charcoal/80 font-medium leading-tight">
                  {fabric.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
