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

const STEPS = [
  { id: 1, label: 'Photo', title: 'Upload Photo', optional: false },
  { id: 2, label: 'Fabric', title: 'Select Fabric', optional: false },
  { id: 3, label: 'Style', title: 'Choose Style', optional: false },
  { id: 4, label: 'Details', title: 'Customize', optional: true },
  { id: 5, label: 'Generate', title: 'Generate', optional: false },
];

/** Fallback style used when the user provides only a reference photo */
const REFERENCE_STYLE: KurtaStyle = {
  id: 'reference',
  name: 'Reference Style',
  category: 'classic',
  description: 'Matched from uploaded reference photo',
  promptKeywords: 'classic straight kurta silhouette',
  icon: '📷',
};

function CreateStudio() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);

  // Step 1
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  // Step 2 — fabric
  const [fabricId, setFabricId] = useState<string | null>(null);
  const [fabricPrompt, setFabricPrompt] = useState('');
  const [fabricName, setFabricName] = useState('');
  const [fabricPhoto, setFabricPhoto] = useState<File | null>(null);
  const [fabricPhotoPreview, setFabricPhotoPreview] = useState('');

  // Step 3 — style
  const [kurtaStyle, setKurtaStyle] = useState<KurtaStyle | null>(null);
  const [styleRefPhoto, setStyleRefPhoto] = useState<File | null>(null);
  const [styleRefPreview, setStyleRefPreview] = useState('');

  // Step 4 — details (all optional, null = no preference / skip)
  const [details, setDetails] = useState({
    necklineId: null as string | null,
    sleeveId: null as string | null,
    embellishmentId: null as string | null,
    bottomWear: null as string | null,
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

  // ── Handlers ──────────────────────────────────────────────

  const handleFabricPhotoChange = (file: File | null, preview: string) => {
    setFabricPhoto(file);
    setFabricPhotoPreview(preview);
    if (!file) {
      // If photo cleared but no preset selected, reset fabricId
      setFabricId((prev) => (prev === 'fabric-photo' ? null : prev));
    }
  };

  const handleStyleRefChange = (file: File | null, preview: string) => {
    setStyleRefPhoto(file);
    setStyleRefPreview(preview);
  };

  const handleGenerate = async (quality: 'low' | 'medium' | 'high') => {
    if (!userPhoto) return;
    const effectiveStyle = kurtaStyle || (styleRefPhoto ? REFERENCE_STYLE : null);
    if (!effectiveStyle) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const neckline = NECKLINES.find((n) => n.id === details.necklineId)
        ?? { id: 'none', name: 'No Preference', prompt: 'standard neckline suited to the style' };
      const sleeve = SLEEVES.find((s) => s.id === details.sleeveId)
        ?? { id: 'none', name: 'No Preference', prompt: 'appropriate sleeve length for the style' };
      const embellishment = EMBELLISHMENTS.find((e) => e.id === details.embellishmentId)
        ?? { id: 'none', name: 'No Preference', prompt: 'plain minimal kurta, no embellishments' };

      const selections = {
        kurtaStyle: effectiveStyle,
        neckline,
        sleeve,
        embellishment,
        fabricPrompt: fabricPrompt || 'white cotton fabric',
        fabricName: fabricName || 'White Cotton',
        bottomWear: details.bottomWear ?? undefined,
        quality,
      };

      const fd = new FormData();
      fd.append('userPhoto', userPhoto);
      fd.append('selections', JSON.stringify(selections));
      if (fabricPhoto) fd.append('fabricPhoto', fabricPhoto);
      if (styleRefPhoto) fd.append('styleRefPhoto', styleRefPhoto);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/generate`, { method: 'POST', body: fd });
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
          style: effectiveStyle.name,
          fabric: fabricName,
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
    if (step === 2) return !!(fabricId && fabricId !== '');
    if (step === 3) return !!(kurtaStyle || styleRefPhoto);
    return true; // step 4 is optional — always allow continuing
  };

  // ── Sidebar data ─────────────────────────────────────────

  const neckline = NECKLINES.find((n) => n.id === details.necklineId)
    ?? { id: 'none', name: 'No Preference', prompt: '' };
  const sleeve = SLEEVES.find((s) => s.id === details.sleeveId)
    ?? { id: 'none', name: 'No Preference', prompt: '' };
  const embellishment = EMBELLISHMENTS.find((e) => e.id === details.embellishmentId)
    ?? { id: 'none', name: 'No Preference', prompt: '' };
  const effectiveStyle = kurtaStyle || (styleRefPhoto ? REFERENCE_STYLE : null);

  const generateSelections = {
    kurtaStyle: effectiveStyle,
    neckline,
    sleeve,
    embellishment,
    fabricPrompt,
    fabricName,
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
                      step === s.id
                        ? 'bg-navy text-cream'
                        : step > s.id
                        ? 'bg-gold text-white'
                        : 'bg-navy/10 text-charcoal/40'
                    }`}
                  >
                    {step > s.id ? '✓' : s.id}
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={`text-xs font-medium ${step === s.id ? 'text-navy' : 'text-charcoal/40'}`}>
                      {s.label}
                    </span>
                    {s.optional && (
                      <span className="text-[10px] text-charcoal/30 leading-none">optional</span>
                    )}
                  </div>
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
                      onPhotoSelected={(file, preview) => {
                        setUserPhoto(file);
                        setPhotoPreview(preview);
                      }}
                      preview={photoPreview}
                    />
                  )}
                  {step === 2 && (
                    <FabricSelector
                      selected={fabricId}
                      onSelect={(id, prompt, name) => {
                        setFabricId(id);
                        setFabricPrompt(prompt);
                        setFabricName(name);
                      }}
                      fabricPhotoPreview={fabricPhotoPreview}
                      onFabricPhotoChange={handleFabricPhotoChange}
                    />
                  )}
                  {step === 3 && (
                    <StyleSelector
                      selected={kurtaStyle?.id || null}
                      onSelect={setKurtaStyle}
                      styleRefPreview={styleRefPreview}
                      onStyleRefChange={handleStyleRefChange}
                    />
                  )}
                  {step === 4 && (
                    <DetailCustomizer
                      selections={details}
                      onChange={(key, value) => setDetails((prev) => ({ ...prev, [key]: value ?? null }))}
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
                    {/* Skip button — only on the optional Details step */}
                    {step === 4 && (
                      <button
                        onClick={() => setStep(5)}
                        className="px-5 py-3 text-charcoal/50 hover:text-navy text-sm font-medium transition-all underline underline-offset-2"
                      >
                        Skip →
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
                <div className="flex items-start gap-3">
                  <span className="w-5 text-center">📸</span>
                  <div>
                    <div className="text-xs text-charcoal/50 font-cormorant">Photo</div>
                    <div className="text-navy font-medium">{userPhoto ? userPhoto.name : 'Not uploaded'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 text-center">🎨</span>
                  <div>
                    <div className="text-xs text-charcoal/50 font-cormorant">Fabric</div>
                    <div className="text-navy font-medium">
                      {fabricName || 'Not selected'}
                      {fabricPhotoPreview && (
                        <span className="ml-1 text-xs text-gold">(photo)</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 text-center">{effectiveStyle?.icon || '👘'}</span>
                  <div>
                    <div className="text-xs text-charcoal/50 font-cormorant">Style</div>
                    <div className="text-navy font-medium">
                      {effectiveStyle?.name || 'Not selected'}
                      {styleRefPreview && !kurtaStyle && (
                        <span className="ml-1 text-xs text-gold">(ref photo)</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 text-center">✨</span>
                  <div>
                    <div className="text-xs text-charcoal/50 font-cormorant">Details</div>
                    <div className="text-navy font-medium">
                      {neckline.name} · {sleeve.name}
                    </div>
                  </div>
                </div>

                {photoPreview && (
                  <div className="mt-4 pt-4 border-t border-gold/20">
                    <div className="text-xs text-charcoal/50 font-cormorant mb-2">Your Photo</div>
                    <img src={photoPreview} alt="Your photo" className="w-full rounded-xl object-cover max-h-48" />
                  </div>
                )}
                {fabricPhotoPreview && (
                  <div className="pt-3">
                    <div className="text-xs text-charcoal/50 font-cormorant mb-2">Fabric Reference</div>
                    <img src={fabricPhotoPreview} alt="Fabric" className="w-full rounded-xl object-cover max-h-24" />
                  </div>
                )}
                {styleRefPreview && (
                  <div className="pt-3">
                    <div className="text-xs text-charcoal/50 font-cormorant mb-2">Style Reference</div>
                    <img src={styleRefPreview} alt="Style reference" className="w-full rounded-xl object-cover max-h-24" />
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
