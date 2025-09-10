"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Globally ensures that whenever the URL hash changes (including cross-route navigations),
 * the page scrolls to the corresponding element id while respecting CSS scroll-mt.
 */
export default function HashScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const scrollToHash = (hash: string | null) => {
      if (!hash) return false;
      const id = hash.replace('#','');
      if (!id) return false;
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
      return true;
    };

    // Initial try (in case this mounts after navigation)
    if (window.location.hash) {
      let attempts = 0;
      const maxAttempts = 90; // ~1.5s at 60fps
      const tick = () => {
        attempts += 1;
        if (scrollToHash(window.location.hash)) return;
        if (attempts < maxAttempts) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    const onHashChange = () => {
      let attempts = 0;
      const maxAttempts = 90;
      const tick = () => {
        attempts += 1;
        if (scrollToHash(window.location.hash)) return;
        if (attempts < maxAttempts) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // React to pathname changes as well (App Router transitions)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.hash) return;
    let attempts = 0;
    const maxAttempts = 90;
    const tick = () => {
      attempts += 1;
      const ok = document.readyState === 'complete' || document.readyState === 'interactive';
      if (ok && window.location.hash && document.getElementById(window.location.hash.replace('#',''))) {
        const el = document.getElementById(window.location.hash.replace('#',''))!;
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
      }
      if (attempts < maxAttempts) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [pathname]);

  return null;
}
