"use client";

import { useEffect } from "react";

export default function ScrollToHashOnLoad() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.replace('#','');
    if (!hash) return;

    const tryScroll = () => {
      const el = document.getElementById(hash);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
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
