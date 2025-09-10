"use client";

import { useEffect } from "react";

export default function ScrollToHashOnLoad() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.replace('#','');
    if (!hash) return;

    const getHeaderOffset = () => {
      const headerEl = document.querySelector('header');
      const rect = headerEl?.getBoundingClientRect();
      return rect ? Math.ceil(rect.height) : 64;
    };

    const tryScroll = () => {
      const el = document.getElementById(hash);
      if (!el) return false;
      const headerOffset = getHeaderOffset();
      const y = Math.max(0, window.scrollY + el.getBoundingClientRect().top - headerOffset - 8);
      window.scrollTo({ top: y, behavior: 'auto' });
      return true;
    };

    // First frame
    if (tryScroll()) return;

    // Retry a bit while DOM paints
    let attempts = 0;
    const maxAttempts = 30;
    const timer = setInterval(() => {
      attempts += 1;
      if (tryScroll() || attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, 100);

    return () => {
      // cleanup if navigating away fast
    };
  }, []);

  return null;
}
