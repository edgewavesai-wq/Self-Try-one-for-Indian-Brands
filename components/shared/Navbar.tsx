'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧵</span>
            <span className="font-playfair text-xl font-bold text-navy">EthnicFit AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { href: '/', label: 'Home' },
              { href: '/create', label: 'Design Studio' },
              { href: '/gallery', label: 'Gallery' },
              { href: '/styles', label: 'Style Guide' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'font-sans text-sm font-medium transition-colors hover:text-gold',
                  pathname === href ? 'text-gold' : 'text-charcoal'
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          <Link
            href="/create"
            className="bg-navy text-cream px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors border border-gold/30"
          >
            Try Now →
          </Link>
        </div>
      </div>
    </nav>
  );
}
