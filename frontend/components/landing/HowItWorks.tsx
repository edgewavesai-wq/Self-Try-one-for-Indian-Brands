'use client';
import { motion } from 'framer-motion';

const steps = [
  { step: '01', icon: '📸', title: 'Upload Your Photo', desc: 'Share a clear full-body or upper-body photo of yourself' },
  { step: '02', icon: '🎨', title: 'Choose Style & Fabric', desc: 'Pick from 18 kurta styles, 12 fabrics, and customize every detail' },
  { step: '03', icon: '✨', title: 'AI Generates Your Look', desc: 'See yourself wearing the kurta in a photorealistic fashion photo' },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-navy/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-playfair text-4xl font-bold text-navy text-center mb-4">How It Works</h2>
        <p className="text-center text-charcoal/60 mb-16 max-w-2xl mx-auto">Three simple steps to see your perfect ethnic look</p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ step, icon, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="bg-cream rounded-2xl p-8 border border-gold/20 relative"
            >
              <div className="font-cormorant text-6xl font-bold text-gold/20 absolute top-4 right-6">{step}</div>
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="font-playfair text-xl font-bold text-navy mb-2">{title}</h3>
              <p className="font-sans text-sm text-charcoal/70">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
