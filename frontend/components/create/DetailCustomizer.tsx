'use client';
import { NECKLINES } from '@/data/necklines';
import { SLEEVES } from '@/data/sleeves';
import { EMBELLISHMENTS } from '@/data/embellishments';
import { cn } from '@/lib/utils';

interface Selections {
  necklineId: string | null;
  sleeveId: string | null;
  embellishmentId: string | null;
  bottomWear: string | null;
}

interface Props {
  selections: Selections;
  onChange: (key: keyof Selections, value: string | null) => void;
}

const bottomWearOptions = [
  { id: null, label: 'No Preference' },
  { id: 'churidar', label: 'Churidar' },
  { id: 'pajama', label: 'Pajama' },
  { id: 'jeans', label: 'Jeans' },
  { id: 'trousers', label: 'Trousers' },
  { id: 'dhoti', label: 'Dhoti' },
];

const NONE_OPTION = { id: null, name: 'No Preference', icon: '—' };

function OptionGrid<T extends { id: string; name: string; icon?: string }>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: T[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const allOptions = [NONE_OPTION, ...options] as Array<{ id: string | null; name: string; icon?: string }>;

  return (
    <div>
      <h3 className="font-cormorant text-lg font-semibold text-gold mb-3">{label}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {allOptions.map((opt) => {
          const isSelected = selected === opt.id;
          const isNone = opt.id === null;
          return (
            <button
              key={opt.id ?? '__none__'}
              onClick={() => onSelect(opt.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs transition-all',
                isSelected
                  ? isNone
                    ? 'border-navy/40 bg-navy/5 shadow-sm'
                    : 'border-gold bg-gold/5 shadow-sm'
                  : 'border-gold/20 hover:border-gold/50 bg-cream'
              )}
            >
              <span className={cn('text-xl', isNone && 'text-charcoal/30 font-light text-base')}>{opt.icon}</span>
              <span className={cn(
                'text-center font-medium leading-tight',
                isNone ? 'text-charcoal/40' : 'text-charcoal/80'
              )}>
                {opt.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DetailCustomizer({ selections, onChange }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-playfair text-3xl font-bold text-navy mb-2">Customize Details</h2>
        <p className="text-charcoal/60 text-sm">Fine-tune the neckline, sleeves, and embellishments</p>
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
          {bottomWearOptions.map((opt) => {
            const isSelected = selections.bottomWear === opt.id;
            const isNone = opt.id === null;
            return (
              <button
                key={opt.id ?? '__none__'}
                onClick={() => onChange('bottomWear', opt.id)}
                className={cn(
                  'px-4 py-2 rounded-lg border-2 text-sm transition-all',
                  isSelected
                    ? isNone
                      ? 'border-navy/40 bg-navy/5 font-semibold text-charcoal/50'
                      : 'border-gold bg-gold/5 font-semibold text-navy'
                    : 'border-gold/20 hover:border-gold/50 text-charcoal/70'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
