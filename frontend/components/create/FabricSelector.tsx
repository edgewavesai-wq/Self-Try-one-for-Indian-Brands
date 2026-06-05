'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FABRIC_PRESETS } from '@/data/fabrics';
import { cn } from '@/lib/utils';
import { Upload, Plus, X } from 'lucide-react';

interface CustomFabric {
  id: string;
  name: string;
  color: string;
  prompt: string;
  category: string;
}

interface Props {
  selected: string | null;
  onSelect: (id: string, prompt: string, name: string) => void;
  fabricPhotoPreview: string;
  onFabricPhotoChange: (file: File | null, preview: string) => void;
}

export default function FabricSelector({ selected, onSelect, fabricPhotoPreview, onFabricPhotoChange }: Props) {
  const [mode, setMode] = useState<'upload' | 'preset'>(fabricPhotoPreview ? 'upload' : 'preset');
  const [customFabrics, setCustomFabrics] = useState<CustomFabric[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newColor, setNewColor] = useState('#FF9999');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Custom');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const allFabrics = [...FABRIC_PRESETS, ...customFabrics];
  const categories = Array.from(new Set(allFabrics.map((f) => f.category)));

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      onFabricPhotoChange(file, preview);
      onSelect('fabric-photo', 'custom fabric from uploaded reference photo', file.name.replace(/\.[^.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    onFabricPhotoChange(null, '');
    onSelect('', '', '');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handlePresetSelect = (id: string, prompt: string, name: string) => {
    onSelect(id, prompt, name);
    onFabricPhotoChange(null, ''); // clear any uploaded fabric photo
  };

  const addCustomFabric = () => {
    if (!newName.trim()) return;
    const id = `custom-${Date.now()}`;
    const fab: CustomFabric = {
      id,
      name: newName.trim(),
      color: newColor,
      prompt: `${newName.trim().toLowerCase()} fabric, ${newColor} colour, smooth texture`,
      category: newCategory.trim() || 'Custom',
    };
    setCustomFabrics((prev) => [...prev, fab]);
    handlePresetSelect(fab.id, fab.prompt, fab.name);
    setNewName('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-3xl font-bold text-navy mb-2">Select Fabric</h2>
        <p className="text-charcoal/60 text-sm">Upload a fabric photo or choose from our curated collection</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-navy/5 rounded-xl w-fit">
        {(['upload', 'preset'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              mode === m ? 'bg-navy text-cream shadow-sm' : 'text-charcoal/60 hover:text-navy'
            )}
          >
            {m === 'upload' ? '📸 Upload Photo' : '🎨 Choose Preset'}
          </button>
        ))}
      </div>

      {/* ── Upload mode ── */}
      {mode === 'upload' && (
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {fabricPhotoPreview ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-gold group">
              <img src={fabricPhotoPreview} alt="Fabric reference" className="w-full h-52 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <span className="text-white text-sm font-medium">✓ Fabric reference selected — AI will match colour &amp; texture</span>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-1.5 bg-gold text-white text-xs rounded-lg font-medium hover:bg-gold/90 transition-all"
                >
                  Change
                </button>
                <button
                  onClick={clearPhoto}
                  className="w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all"
                >
                  <X size={13} />
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
                'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
                dragOver ? 'border-gold bg-gold/5' : 'border-gold/30 hover:border-gold/60 hover:bg-gold/3'
              )}
            >
              <Upload className="w-10 h-10 text-gold/50 mx-auto mb-3" />
              <p className="font-medium text-navy mb-1">Drop your fabric photo here</p>
              <p className="text-charcoal/50 text-sm">or click to browse · JPG, PNG, WEBP</p>
              <p className="text-charcoal/40 text-xs mt-3">AI will extract colour and texture from your photo</p>
            </div>
          )}
        </div>
      )}

      {/* ── Preset mode ── */}
      {mode === 'preset' && (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="font-cormorant text-lg font-semibold text-gold mb-3">{cat}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {allFabrics
                  .filter((f) => f.category === cat)
                  .map((fabric) => (
                    <motion.button
                      key={fabric.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handlePresetSelect(fabric.id, fabric.prompt, fabric.name)}
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

          {/* Add Custom Colour */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gold/30 hover:border-gold/60 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-all">
                <Plus size={18} className="text-gold" />
              </div>
              <span className="text-sm text-charcoal/60 font-medium group-hover:text-charcoal/80">
                Add Custom Fabric Colour
              </span>
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl border-2 border-gold/30 bg-gold/5 space-y-4"
            >
              <h4 className="font-cormorant text-base font-semibold text-navy">New Custom Fabric</h4>
              <div className="flex gap-3 flex-wrap items-end">
                <div>
                  <label className="text-xs text-charcoal/60 block mb-1.5">Colour</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-gold/20 p-0.5"
                    />
                    <span className="text-xs text-charcoal/50 font-mono">{newColor}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs text-charcoal/60 block mb-1.5">Fabric Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomFabric()}
                    placeholder="e.g. Rose Silk"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gold/20 bg-cream/80 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="w-28">
                  <label className="text-xs text-charcoal/60 block mb-1.5">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Custom"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gold/20 bg-cream/80 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addCustomFabric}
                  disabled={!newName.trim()}
                  className="px-4 py-2 bg-navy text-cream text-sm rounded-lg font-medium disabled:opacity-40 hover:bg-navy/90 transition-all"
                >
                  Add Fabric
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gold/20 text-charcoal/60 text-sm rounded-lg hover:border-gold/50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
