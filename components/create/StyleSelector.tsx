'use client';
import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { KURTA_STYLES, type KurtaStyle } from '@/data/kurta-styles';
import { cn } from '@/lib/utils';

interface Props {
  selected: string | null;
  onSelect: (style: KurtaStyle) => void;
  styleRefPhoto: File | null;
  onStyleRefPhotoChange: (file: File | null, preview: string) => void;
  styleRefPreview: string;
}

const CATEGORIES = ['classic', 'modern', 'fusion', 'wedding'] as const;

function StyleRefUpload({
  styleRefPhoto,
  preview,
  onChange,
}: {
  styleRefPhoto: File | null;
  preview: string;
  onChange: (file: File | null, preview: string) => void;
}) {
  const [error, setError] = useState('');

  const onDrop = useCallback(
    (accepted: File[], rejected: unknown[]) => {
      setError('');
      if ((rejected as unknown[]).length > 0) {
        setError('Please upload a JPG, PNG, or WebP image under 5MB.');
        return;
      }
      const file = accepted[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      onChange(file, url);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all',
        preview ? 'border-gold/50 bg-gold/5' : isDragActive ? 'border-gold bg-gold/5' : 'border-gold/30 hover:border-gold/60',
      )}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className="flex items-center gap-4">
          <img src={preview} alt="Style reference" className="w-20 h-24 object-cover rounded-xl border border-gold/20" />
          <div className="flex-1">
            <p className="text-sm font-medium text-navy">{styleRefPhoto?.name}</p>
            <p className="text-xs text-charcoal/50 mt-1">AI will replicate this kurta style on you</p>
            <button
              onClick={(e) => { e.stopPropagation(); onChange(null, ''); }}
              className="mt-2 text-xs text-red-400 underline"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="text-3xl">👘</div>
          <div>
            <p className="font-medium text-navy text-sm">
              {isDragActive ? 'Drop your style reference' : 'Upload a kurta style photo (optional)'}
            </p>
            <p className="text-xs text-charcoal/50 mt-0.5">The AI will replicate that exact style on your photo</p>
          </div>
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}

export default function StyleSelector({ selected, onSelect, styleRefPhoto, onStyleRefPhotoChange, styleRefPreview }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-3xl font-bold text-navy mb-2">Select Kurta Style</h2>
        <p className="text-charcoal/60 text-sm">Upload a reference photo or pick from 18 preset styles</p>
      </div>

      {/* Style reference upload — shown above presets */}
      <div className="space-y-2">
        <p className="text-xs text-charcoal/50 font-cormorant font-semibold uppercase tracking-wide">
          From Reference Photo
        </p>
        <StyleRefUpload
          styleRefPhoto={styleRefPhoto}
          preview={styleRefPreview}
          onChange={(file, preview) => {
            onStyleRefPhotoChange(file, preview);
          }}
        />
        {styleRefPhoto && (
          <p className="text-xs text-emerald-600 font-medium">
            ✓ Style reference uploaded — you can still pick a preset below as a backup description
          </p>
        )}
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-gold/20" />
        <span className="text-xs text-charcoal/40 font-cormorant">or choose a preset style</span>
        <div className="flex-1 h-px bg-gold/20" />
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
                    : 'border-gold/20 hover:border-gold/50 bg-cream',
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
