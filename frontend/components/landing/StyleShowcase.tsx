'use client';
import { motion } from 'framer-motion';
import { KURTA_STYLES } from '@/data/kurta-styles';
import Link from 'next/link';

export default function StyleShowcase() {
  const featured = KURTA_STYLES.slice(0, 6);

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-playfair text-4xl font-bold text-navy text-center mb-4">Explore Styles</h2>
        <p className="text-center text-charcoal/60 mb-12">From classic kurtas to modern fusion wear</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {featured.map((style, i) => (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="bg-cream rounded-2xl p-6 border border-gold/20 hover:border-gold/50 transition-all cursor-pointer group"
            >
              <div className="text-3xl mb-3">{style.icon}</div>
              <div className="text-xs font-cormorant uppercase tracking-wider text-gold mb-1">{style.category}</div>
              <h3 className="font-playfair text-lg font-bold text-navy mb-1">{style.name}</h3>
              <p className="font-sans text-xs text-charcoal/60">{style.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/styles"
            className="inline-block border border-navy text-navy px-6 py-3 rounded-xl hover:bg-navy hover:text-cream transition-all font-medium"
          >
            View All 18 Styles →
          </Link>
        </div>
      </div>
    </section>
  );
}
