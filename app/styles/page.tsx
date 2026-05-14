'use client';
import { motion } from 'framer-motion';
import { KURTA_STYLES } from '@/data/kurta-styles';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Link from 'next/link';

const categories = ['classic', 'modern', 'fusion', 'wedding'] as const;
const categoryColors = {
  classic: 'bg-navy/10 text-navy border-navy/20',
  modern: 'bg-gold/10 text-amber-700 border-gold/30',
  fusion: 'bg-emerald/10 text-emerald-800 border-emerald/20',
  wedding: 'bg-burgundy/10 text-burgundy border-burgundy/20',
};

export default function StylesPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-playfair text-5xl font-bold text-navy mb-4">Style Guide</h1>
            <p className="font-sans text-charcoal/60 text-lg max-w-2xl mx-auto">
              Explore all 18 kurta styles across Classic, Modern, Fusion, and Wedding categories
            </p>
          </div>

          {categories.map((cat) => (
            <div key={cat} className="mb-14">
              <h2 className="font-playfair text-3xl font-bold text-navy mb-6 capitalize border-b border-gold/20 pb-3">
                {cat} Styles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {KURTA_STYLES.filter((s) => s.category === cat).map((style, i) => (
                  <motion.div
                    key={style.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    viewport={{ once: true }}
                    className="bg-cream rounded-2xl p-6 border border-gold/20 hover:border-gold/50 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-3">{style.icon}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-cormorant uppercase tracking-wider ${categoryColors[cat]}`}>
                      {cat}
                    </span>
                    <h3 className="font-playfair text-lg font-bold text-navy mt-2 mb-1">{style.name}</h3>
                    <p className="font-sans text-sm text-charcoal/70 mb-4">{style.description}</p>
                    <Link
                      href={`/create?style=${style.id}`}
                      className="text-xs text-gold hover:text-navy font-medium transition-colors"
                    >
                      Try this style →
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
