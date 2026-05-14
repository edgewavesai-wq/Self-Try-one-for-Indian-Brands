'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="min-h-screen paisley-bg flex items-center justify-center px-4 pt-20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block bg-gold/10 border border-gold/30 text-gold text-sm font-cormorant px-4 py-1 rounded-full mb-6">
            ✨ AI-Powered Virtual Try-On
          </span>

          <h1 className="font-playfair text-5xl md:text-7xl font-bold text-navy leading-tight mb-6">
            Wear Your Dream<br />
            <span className="text-gold">Kurta</span> Before You Buy
          </h1>

          <p className="font-sans text-lg text-charcoal/70 max-w-2xl mx-auto mb-10">
            Upload your photo, choose your fabric &amp; style, and see yourself wearing a photorealistic custom kurta — powered by GPT Image AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="bg-navy text-cream px-8 py-4 rounded-xl text-lg font-semibold hover:bg-navy/90 transition-all border border-gold/30 shadow-lg shadow-navy/20"
            >
              Design Your Kurta →
            </Link>
            <Link
              href="/styles"
              className="bg-cream text-navy px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gold/10 transition-all border border-navy/20"
            >
              Browse Styles
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 grid grid-cols-3 gap-6 text-center"
        >
          {[
            { num: '18+', label: 'Kurta Styles' },
            { num: '12', label: 'Fabric Choices' },
            { num: '<60s', label: 'Generation Time' },
          ].map(({ num, label }) => (
            <div key={label} className="glass rounded-2xl p-6">
              <div className="font-playfair text-3xl font-bold text-gold">{num}</div>
              <div className="font-sans text-sm text-charcoal/70 mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
