'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import PhotoUpload from '@/components/create/PhotoUpload';
import FabricSelector from '@/components/create/FabricSelector';
import StyleSelector from '@/components/create/StyleSelector';
import DetailCustomizer from '@/components/create/DetailCustomizer';
import GeneratePreview from '@/components/create/GeneratePreview';
import { KURTA_STYLES, type KurtaStyle } from '@/data/kurta-styles';
import { NECKLINES } from '@/data/necklines';
import { SLEEVES } from '@/data/sleeves';
import { EMBELLISHMENTS } from '@/data/embellishments';
import { compressImage } from '@/lib/utils';

type FabricTab = 'preset' | 'upload' | 'custom';

const STEPS = [
  { id: 1, label: 'Photo', title: 'Upload Photo' },
  { id: 2, label: 'Fabric', title: 'Select Fabric' },
  { id: 3, label: 'Style', title: 'Choose Style' },
  { id: 4, label: 'Details', title: 'Customize' },
  { id: 5, label: 'Generate', title: 'Generate' },
];

function CreateStudio() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);

  // Step 1 — person photo
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // Step 2 — fabric
  const [fabricTab, setFabricTab] = useState<FabricTab>('preset');
  const [fabricId, setFabricId] = useState<string | null>(null);
  const [fabricPrompt, setFabricPrompt] = useState('');
  const [fabricName, setFabricName] = useState('');
  const [fabricPhoto, setFabricPhoto] = useState<File | null>(null);
  const [fabricPhotoPreview, setFabricPhotoPreview] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [customColorName, setCustomColorName] = useState('');

  // Step 3 — style
  const [kurtaStyle, setKurtaStyle] = useState<KurtaStyle | null>(null);
  const [styleRefPhoto, setStyleRefPhoto] = useState<File | null>(null);
  const [styleRefPreview, setStyleRefPreview] = useState('');

  // Step 4 — details
  const [details, setDetails] = useState({
    necklineId: 'mandarin' as string | null,
    sleeveId: 'full' as string | null,
    embellishmentId: 'none' as string | null,
    bottomWear: 'churidar',
  });

  // Generation
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const styleId = searchParams.get('style');
    if (styleId) {
      const found = KURTA_STYLES.find((s) => s.id === styleId);
      if (found) {
        setKurtaStyle(found);
        setStep(2);
      }
    }
  }, [searchParams]);

  // Derived fabric info based on active tab
  const activeFabricPrompt =
    fabricTab === 'preset' ? fabricPrompt :
    fabricTab === 'upload' ? 'fabric from reference photo' :
    customColorName ? `${customColorName} coloured fabric` :
    customColor ? `${customColor} coloured fabric` : '';

  const activeFabricName =
    fabricTab === 'preset' ? fabricName :
    fabricTab === 'upload' ? (fabricPhoto?.name || 'Uploaded Fabric') :
    customColorName || (customColor ? 'Custom Colour' : '');

  const handleGenerate = async (quality: 'low' | 'medium' | 'high') => {
    if (!userPhoto) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const neckline = NECKLINES.find((n) => n.id === details.necklineId) || NECKLINES[0];
      const sleeve = SLEEVES.find((s) => s.id === details.sleeveId) || SLEEVES[0];
      const embellishment = EMBELLISHMENTS.find((e) => e.id === details.embellishmentId) || EMBELLISHMENTS[0];

      const selections = {
        kurtaStyle: kurtaStyle || { promptKeywords: 'classic straight kurta', name: 'Classic Kurta' },
        neckline,
        sleeve,
        embellishment,
        fabricPrompt: activeFabricPrompt || 'white cotton fabric',
        fabricName: activeFabricName || 'White Cotton',
        bottomWear: details.bottomWear,
        quality,
        hasFabricPhoto: fabricTab === 'upload' && !!fabricPhoto,
        hasStyleRefPhoto: !!styleRefPhoto,
      };

      // Compress images before upload to reduce API payload and cost
      const [compressedPerson, compressedFabric, compressedStyle] = await Promise.all([
        compressImage(userPhoto, 1024, 1536, 0.85),
        fabricTab === 'upload' && fabricPhoto ? compressImage(fabricPhoto, 512, 512, 0.80) : Promise.resolve(null),
        styleRefPhoto ? compressImage(styleRefPhoto, 768, 1024, 0.80) : Promise.resolve(null),
      ]);

      const formData = new FormData();
      formData.append('userPhoto', compressedPerson);
      formData.append('selections', JSON.stringify(selections));
      if (compressedFabric) formData.append('fabricPhoto', compressedFabric);
      if (compressedStyle) formData.append('styleRefPhoto', compressedStyle);

      const response = await fetch('/api/generate', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Generation failed');

      setResult(data.image);

      try {
        const saved = JSON.parse(localStorage.getItem('ethnicfit-generations') || '[]');
        saved.push({
          id: Date.now().toString(),
          image: data.image,
          prompt: data.prompt,
          cost: data.cost,
          timestamp: Date.now(),
          style: selections.kurtaStyle.name,
          fabric: activeFabricName,
        });
        localStorage.setItem('ethnicfit-generations', JSON.stringify(saved));
      } catch {
        // ignore storage errors
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return !!userPhoto;
    if (step === 2) {
      return (fabricTab === 'preset' && !!fabricId) ||
             (fabricTab === 'upload' && !!fabricPhoto) ||
             (fabricTab === 'custom' && !!(customColor || customColorName));
    }
    if (step === 3) return !!kurtaStyle || !!styleRefPhoto;
    return true; // steps 4 and 5 are always passable
  };

  const neckline = NECKLINES.find((n) => n.id === details.necklineId) || NECKLINES[0];
  const sleeve = SLEEVES.find((s) => s.id === details.sleeveId) || SLEEVES[0];
  const embellishment = EMBELLISHMENTS.find((e) => e.id === details.embellishmentId) || EMBELLISHMENTS[0];

  const generateSelections = {
    kurtaStyle,
    neckline,
    sleeve,
    embellishment,
    fabricPrompt: activeFabricPrompt,
    fabricName: activeFabricName,
    bottomWear: details.bottomWear,
  };

  return (
    <main>
      <Navbar />
      <div className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step Progress */}
          <div className="flex items-center justify-center mb-10 overflow-x-auto pb-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => step > s.id && setStep(s.id)}
                  className={`flex flex-col items-center gap-1 min-w-[60px] ${step > s.id ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step === s.id ? 'bg-navy text-cream' : step > s.id ? 'bg-gold text-white' : 'bg-navy/10 text-charcoal/40'
                    }`}
                  >
                    {step > s.id ? '✓' : s.id}
                  </div>
                  <span className={`text-xs font-medium ${step === s.id ? 'text-navy' : 'text-charcoal/40'}`}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-12 sm:w-20 h-px mx-1 ${step > s.id ? 'bg-gold' : 'bg-navy/10'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-cream rounded-2xl p-6 sm:p-8 border border-gold/20 min-h-[500px]"
                >
                  {step === 1 && (
                    <PhotoUpload
                      onPhotoSelected={(file, preview) => { setUserPhoto(file); setPhotoPreview(preview); }}
                      preview={photoPreview}
                    />
                  )}
                  {step === 2 && (
                    <FabricSelector
                      selected={fabricId}
                      onSelect={(id, prompt, name) => { setFabricId(id); setFabricPrompt(prompt); setFabricName(name); }}
                      fabricPhoto={fabricPhoto}
                      onFabricPhotoChange={(file, preview) => { setFabricPhoto(file); setFabricPhotoPreview(preview); }}
                      fabricPhotoPreview={fabricPhotoPreview}
                      customColor={customColor}
                      customColorName={customColorName}
                      onCustomColorChange={(color, name) => { setCustomColor(color); setCustomColorName(name); }}
                      activeTab={fabricTab}
                      onTabChange={(tab) => setFabricTab(tab)}
                    />
                  )}
                  {step === 3 && (
                    <StyleSelector
                      selected={kurtaStyle?.id || null}
                      onSelect={setKurtaStyle}
                      styleRefPhoto={styleRefPhoto}
                      onStyleRefPhotoChange={(file, preview) => { setStyleRefPhoto(file); setStyleRefPreview(preview); }}
                      styleRefPreview={styleRefPreview}
                    />
                  )}
                  {step === 4 && (
                    <DetailCustomizer
                      selections={details}
                      onChange={(key, value) => setDetails((prev) => ({ ...prev, [key]: value }))}
                    />
                  )}
                  {step === 5 && (
                    <GeneratePreview
                      selections={generateSelections}
                      userPhoto={userPhoto}
                      onGenerate={handleGenerate}
                      result={result}
                      isLoading={isLoading}
                      error={error}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="px-6 py-3 border border-navy/20 text-navy rounded-xl hover:bg-navy/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium"
                >
                  ← Back
                </button>

                {step < 5 && (
                  <div className="flex items-center gap-3">
                    {/* Skip button for optional step 4 */}
                    {step === 4 && (
                      <button
                        onClick={() => setStep(5)}
                        className="px-5 py-3 text-charcoal/50 hover:text-navy text-sm transition-colors"
                      >
                        Skip Details →
                      </button>
                    )}
                    <button
                      onClick={() => setStep((s) => Math.min(5, s + 1))}
                      disabled={!canGoNext()}
                      className="px-6 py-3 bg-navy text-cream rounded-xl hover:bg-navy/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium border border-gold/20"
                    >
                      Continue →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Preview */}
            <div className="glass rounded-2xl p-6 sticky top-24 h-fit">
              <h3 className="font-playfair text-lg font-bold text-navy mb-4">Your Selections</h3>
              <div className="space-y-3 text-sm">
                <SidebarRow icon="📸" label="Photo" value={userPhoto?.name || 'Not uploaded'} />
                <SidebarRow
                  icon="🎨"
                  label="Fabric"
                  value={activeFabricName || 'Not selected'}
                  badge={fabricTab === 'upload' && fabricPhoto ? 'Uploaded' : fabricTab === 'custom' && customColor ? 'Custom' : undefined}
                />
                <SidebarRow
                  icon={kurtaStyle?.icon || '👘'}
                  label="Style"
                  value={styleRefPhoto ? 'From reference photo' : (kurtaStyle?.name || 'Not selected')}
                  badge={styleRefPhoto ? 'Reference' : undefined}
                />
                <SidebarRow icon="✨" label="Details" value={`${neckline.name} · ${sleeve.name}`} />

                {photoPreview && (
                  <div className="mt-4 pt-4 border-t border-gold/20">
                    <p className="text-xs text-charcoal/50 font-cormorant mb-2">Your Photo</p>
                    <img src={photoPreview} alt="Your photo" className="w-full rounded-xl object-cover max-h-48" />
                  </div>
                )}

                {(fabricPhotoPreview || styleRefPreview) && (
                  <div className="pt-3 border-t border-gold/10 space-y-2">
                    {fabricPhotoPreview && (
                      <div>
                        <p className="text-xs text-charcoal/50 font-cormorant mb-1">Fabric Reference</p>
                        <img src={fabricPhotoPreview} alt="Fabric ref" className="w-full rounded-lg object-cover max-h-24" />
                      </div>
                    )}
                    {styleRefPreview && (
                      <div>
                        <p className="text-xs text-charcoal/50 font-cormorant mb-1">Style Reference</p>
                        <img src={styleRefPreview} alt="Style ref" className="w-full rounded-lg object-cover max-h-24" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function SidebarRow({ icon, label, value, badge }: { icon: string; label: string; value: string; badge?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-5 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-charcoal/50 font-cormorant">{label}</div>
        <div className="flex items-center gap-2">
          <div className="text-navy font-medium text-sm truncate">{value}</div>
          {badge && (
            <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded bg-gold/15 text-gold border border-gold/20">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-navy font-playfair text-2xl">Loading...</div>
      </div>
    }>
      <CreateStudio />
    </Suspense>
  );
}
