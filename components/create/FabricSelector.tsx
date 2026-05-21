'use client';
import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FABRIC_PRESETS } from '@/data/fabrics';
import { cn } from '@/lib/utils';

type Tab = 'preset' | 'upload' | 'custom';

interface Props {
  selected: string | null;
  onSelect: (id: string, prompt: string, name: string) => void;
  fabricPhoto: File | null;
  onFabricPhotoChange: (file: File | null, preview: string) => void;
  fabricPhotoPreview: string;
  customColor: string;
  customColorName: string;
  onCustomColorChange: (color: string, name: string) => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'preset', label: 'Browse Presets', icon: '🎨' },
  { id: 'upload', label: 'Upload Fabric', icon: '📷' },
  { id: 'custom', label: 'Custom Colour', icon: '🖌️' },
];

function FabricUpload({
  fabricPhoto,
  preview,
  onChange,
}: {
  fabricPhoto: File | null;
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
    <div className="space-y-4">
      <p className="text-sm text-charcoal/60">
        Upload a photo of real fabric — the AI will replicate its exact texture, weave, and colour.
      </p>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
          isDragActive ? 'border-gold bg-gold/5' : 'border-gold/30 hover:border-gold/60 hover:bg-gold/5',
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="flex flex-col items-center gap-3">
            <img src={preview} alt="Fabric preview" className="max-h-40 rounded-xl object-contain" />
            <p className="text-xs text-charcoal/50">Click or drag to replace</p>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-3">🧵</div>
            <p className="font-playfair font-bold text-navy mb-1">
              {isDragActive ? 'Drop fabric photo' : 'Drag & drop fabric photo'}
            </p>
            <p className="text-xs text-charcoal/50">JPG, PNG, WebP · max 5MB</p>
          </div>
        )}
      </div>
      {fabricPhoto && (
        <button
          onClick={() => onChange(null, '')}
          className="text-xs text-red-400 underline"
        >
          Remove fabric photo
        </button>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

function CustomColour({
  color,
  name,
  onChange,
}: {
  color: string;
  name: string;
  onChange: (color: string, name: string) => void;
}) {
  const QUICK_COLORS = [
    { hex: '#FFFFFF', label: 'White' },
    { hex: '#000000', label: 'Black' },
    { hex: '#1B3A6B', label: 'Royal Blue' },
    { hex: '#800020', label: 'Burgundy' },
    { hex: '#2E7D5B', label: 'Emerald' },
    { hex: '#CFB53B', label: 'Antique Gold' },
    { hex: '#F5E6D3', label: 'Beige' },
    { hex: '#8B1A1A', label: 'Maroon' },
    { hex: '#4A235A', label: 'Deep Purple' },
    { hex: '#E67E22', label: 'Saffron' },
    { hex: '#1A5276', label: 'Navy' },
    { hex: '#D4AC0D', label: 'Mustard' },
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm text-charcoal/60">
        Pick a colour and optionally describe the fabric type — or choose from quick-select swatches.
      </p>

      {/* Quick colours */}
      <div>
        <p className="text-xs text-charcoal/50 font-cormorant mb-2">Quick select</p>
        <div className="grid grid-cols-6 gap-2">
          {QUICK_COLORS.map((c) => (
            <button
              key={c.hex}
              title={c.label}
              onClick={() => onChange(c.hex, name || c.label)}
              className={cn(
                'w-9 h-9 rounded-lg border-2 transition-all',
                color === c.hex ? 'border-gold scale-110 shadow-md' : 'border-transparent hover:border-gold/50',
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Colour picker */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-charcoal/50 font-cormorant mb-1">Custom colour</p>
          <input
            type="color"
            value={color || '#FFFFFF'}
            onChange={(e) => onChange(e.target.value, name)}
            className="w-12 h-12 rounded-lg border border-gold/30 cursor-pointer"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs text-charcoal/50 font-cormorant mb-1">Fabric name / description</p>
          <input
            type="text"
            value={name}
            onChange={(e) => onChange(color || '#FFFFFF', e.target.value)}
            placeholder="e.g. Silk, Linen, Cotton Blend…"
            className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-cream text-sm text-navy focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {(color || name) && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-gold/20 bg-gold/5">
          <div className="w-8 h-8 rounded-lg border border-black/10" style={{ backgroundColor: color || '#FFFFFF' }} />
          <span className="text-sm text-navy font-medium">{name || 'Custom colour selected'}</span>
        </div>
      )}
    </div>
  );
}

export default function FabricSelector({
  selected,
  onSelect,
  fabricPhoto,
  onFabricPhotoChange,
  fabricPhotoPreview,
  customColor,
  customColorName,
  onCustomColorChange,
  activeTab,
  onTabChange,
}: Props) {
  const categories = Array.from(new Set(FABRIC_PRESETS.map((f) => f.category)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-3xl font-bold text-navy mb-2">Select Fabric</h2>
        <p className="text-charcoal/60 text-sm">Choose from presets, upload a real fabric photo, or pick a custom colour</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-navy/5 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all',
              activeTab === tab.id
                ? 'bg-navy text-cream shadow-sm'
                : 'text-charcoal/60 hover:text-navy',
            )}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Preset tab */}
      {activeTab === 'preset' && (
        <div className="space-y-5">
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
                        : 'border-transparent hover:border-gold/40',
                    )}
                  >
                    <div className="w-12 h-12 rounded-lg border border-black/10" style={{ backgroundColor: fabric.color }} />
                    <span className="text-xs text-center text-charcoal/80 font-medium leading-tight">{fabric.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload tab */}
      {activeTab === 'upload' && (
        <FabricUpload fabricPhoto={fabricPhoto} preview={fabricPhotoPreview} onChange={onFabricPhotoChange} />
      )}

      {/* Custom colour tab */}
      {activeTab === 'custom' && (
        <CustomColour color={customColor} name={customColorName} onChange={onCustomColorChange} />
      )}
    </div>
  );
}
