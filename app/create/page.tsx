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
  { id: 1, label: 'Photo', title: 'Upload Photo' },
  { id: 2, label: 'Fabric', title: 'Select Fabric' },
  { id: 3, label: 'Style', title: 'Choose Style' },
  { id: 4, label: 'Details', title: 'Customize' },
  { id: 5, label: 'Generate', title: 'Generate' },
];

function CreateStudio() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [fabricId, setFabricId] = useState<string | null>(null);
  const [fabricPrompt, setFabricPrompt] = useState('');
  const [fabricName, setFabricName] = useState('');
  const [kurtaStyle, setKurtaStyle] = useState<KurtaStyle | null>(null);
  const [details, setDetails] = useState({
    necklineId: 'mandarin' as string | null,
    sleeveId: 'full' as string | null,
    embellishmentId: 'none' as string | null,
    bottomWear: 'churidar',
  });
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

  const handleGenerate = async (quality: 'low' | 'medium' | 'high') => {
    if (!userPhoto || !kurtaStyle) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const neckline = NECKLINES.find((n) => n.id === details.necklineId) || NECKLINES[0];
      const sleeve = SLEEVES.find((s) => s.id === details.sleeveId) || SLEEVES[0];
      const embellishment = EMBELLISHMENTS.find((e) => e.id === details.embellishmentId) || EMBELLISHMENTS[0];

      const selections = {
        kurtaStyle,
        neckline,
        sleeve,
        embellishment,
        fabricPrompt: fabricPrompt || 'white cotton fabric',
        fabricName: fabricName || 'White Cotton',
        bottomWear: details.bottomWear,
        quality,
      };

      const formData = new FormData();
      formData.append('userPhoto', userPhoto);
      formData.append('selections', JSON.stringify(selections));

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setResult(data.image);

      // Save to local storage gallery
      try {
        const saved = JSON.parse(localStorage.getItem('ethnicfit-generations') || '[]');
        saved.push({
          id: Date.now().toString(),
          image: data.image,
          prompt: data.prompt,
          cost: data.cost,
          timestamp: Date.now(),
          style: kurtaStyle.name,
          fabric: fabricName,
        });
        localStorage.setItem('ethnicfit-generations', JSON.stringify(saved));
      } catch {
        // ignore storage errors
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return !!userPhoto;
    if (step === 2) return !!fabricId;
    if (step === 3) return !!kurtaStyle;
    return true;
  };

  const neckline = NECKLINES.find((n) => n.id === details.necklineId) || NECKLINES[0];
  const sleeve = SLEEVES.find((s) => s.id === details.sleeveId) || SLEEVES[0];
  const embellishment = EMBELLISHMENTS.find((e) => e.id === details.embellishmentId) || EMBELLISHMENTS[0];

  const generateSelections = {
    kurtaStyle,
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
                    />
                  )}
                  {step === 3 && (
                    <StyleSelector
                      selected={kurtaStyle?.id || null}
                      onSelect={setKurtaStyle}
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
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="px-6 py-3 border border-navy/20 text-navy rounded-xl hover:bg-navy/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium"
                >
                  ← Back
                </button>
                {step < 5 && (
                  <button
                    onClick={() => setStep((s) => Math.min(5, s + 1))}
                    disabled={!canGoNext()}
                    className="px-6 py-3 bg-navy text-cream rounded-xl hover:bg-navy/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium border border-gold/20"
                  >
                    Continue →
                  </button>
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
                    <div className="text-navy font-medium">{fabricName || 'Not selected'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 text-center">{kurtaStyle?.icon || '👘'}</span>
                  <div>
                    <div className="text-xs text-charcoal/50 font-cormorant">Style</div>
                    <div className="text-navy font-medium">{kurtaStyle?.name || 'Not selected'}</div>
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
                    <div className="text-xs text-charcoal/50 font-cormorant mb-2">Your Photo Preview</div>
                    <img
                      src={photoPreview}
                      alt="Your photo"
                      className="w-full rounded-xl object-cover max-h-48"
                    />
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-navy font-playfair text-2xl">Loading...</div></div>}>
      <CreateStudio />
    </Suspense>
  );
}
