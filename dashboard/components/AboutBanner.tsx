'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Info, X } from 'lucide-react';

export function AboutBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setDismissed(localStorage.getItem('canar:about-banner-dismissed') === '1');
    }
  }, []);

  if (!mounted || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('canar:about-banner-dismissed', '1');
    }
  };

  return (
    <div className="bg-canar-blue/10 border border-canar-blue/30 rounded-lg px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <Info className="size-4 text-canar-blue shrink-0" />
        <span className="text-zinc-700">
          New here? This is a real fuel monitoring system from Sudan, rebuilt with modern tech.{' '}
          <Link href="/about" className="text-canar-blue font-medium hover:underline whitespace-nowrap">
            Read the story →
          </Link>
        </span>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="shrink-0 text-zinc-400 hover:text-zinc-700 transition-colors p-1 -m-1"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
