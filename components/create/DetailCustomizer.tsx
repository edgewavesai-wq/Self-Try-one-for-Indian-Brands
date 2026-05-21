'use client';
import { NECKLINES } from '@/data/necklines';
import { SLEEVES } from '@/data/sleeves';
import { EMBELLISHMENTS } from '@/data/embellishments';
import { cn } from '@/lib/utils';

interface Selections {
  necklineId: string | null;
  sleeveId: string | null;
  embellishmentId: string | null;
  bottomWear: string;
}

interface Props {
  selections: Selections;
  onChange: (key: keyof Selections, value: string) => void;
}

const bottomWearOptions = [
  { id: 'churidar', label: 'Churidar' },
  { id: 'pajama', label: 'Pajama' },
  { id: 'jeans', label: 'Jeans' },
  { id: 'trousers', label: 'Trousers' },
  { id: 'dhoti', label: 'Dhoti' },
];

function OptionGrid<T extends { id: string; name: string; icon?: string }>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: T[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="font-cormorant text-lg font-semibold text-gold mb-3">{label}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs transition-all',
              selected === opt.id
                ? 'border-gold bg-gold/5 shadow-sm'
                : 'border-gold/20 hover:border-gold/50 bg-cream'
            )}
          >
            {opt.icon && <span className="text-xl">{opt.icon}</span>}
            <span className="text-center text-charcoal/80 font-medium leading-tight">{opt.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DetailCustomizer({ selections, onChange }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="font-playfair text-3xl font-bold text-navy">Customize Details</h2>
          <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold text-xs font-medium border border-gold/30">
            Optional
          </span>
        </div>
        <p className="text-charcoal/60 text-sm">Fine-tune the neckline, sleeves, and embellishments — or skip to generate</p>
      </div>

      <OptionGrid
        label="Neckline"
        options={NECKLINES}
        selected={selections.necklineId}
        onSelect={(id) => onChange('necklineId', id)}
      />

      <OptionGrid
        label="Sleeve Length"
        options={SLEEVES}
        selected={selections.sleeveId}
        onSelect={(id) => onChange('sleeveId', id)}
      />

      <OptionGrid
        label="Embellishment"
        options={EMBELLISHMENTS}
        selected={selections.embellishmentId}
        onSelect={(id) => onChange('embellishmentId', id)}
      />

      <div>
        <h3 className="font-cormorant text-lg font-semibold text-gold mb-3">Bottom Wear</h3>
        <div className="flex flex-wrap gap-2">
          {bottomWearOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChange('bottomWear', opt.id)}
              className={cn(
                'px-4 py-2 rounded-lg border-2 text-sm transition-all',
                selections.bottomWear === opt.id
                  ? 'border-gold bg-gold/5 font-semibold text-navy'
                  : 'border-gold/20 hover:border-gold/50 text-charcoal/70'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
