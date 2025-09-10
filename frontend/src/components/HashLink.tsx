"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface HashLinkProps extends React.PropsWithChildren<{}> {
  href: string;
  className?: string;
  ariaCurrent?: "page" | undefined;
  onNavigate?: () => void;
}

/**
 * HashLink ensures smooth cross-route navigation to in-page anchors.
 * - Prevents default navigation to control scroll timing
 * - Navigates to base path without auto-scroll, then scrolls to the target id
 */
export function HashLink({ href, className, ariaCurrent, children, onNavigate }: HashLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href.includes('#')) return; // let Link handle it
    const [base, section] = href.split('#');
    const basePath = base || '/';
    const targetId = section;

    // If navigating to a different route, control the scroll to guarantee landing on the section
    if (pathname !== basePath) {
      e.preventDefault();
      router.push(basePath + (targetId ? `#${targetId}` : ''), { scroll: false });

      // Try scrolling ASAP after navigation paints
      let attempts = 0;
      const maxAttempts = 40; // ~40 frames
      const tick = () => {
        attempts += 1;
        const el = targetId ? document.getElementById(targetId) : null;
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' });
          if (onNavigate) onNavigate();
          return;
        }
        if (attempts < maxAttempts) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return;
    }

    // Same-route: prevent default and do precise scroll with CSS scroll-mt
    e.preventDefault();

    // Scroll using scrollIntoView; offset handled by CSS scroll-mt on sections
    const scrollToTarget = () => {
      if (!targetId) return false;
      const el = document.getElementById(targetId);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
      if (onNavigate) onNavigate();
      return true;
    };

    // If we're not on the base path, navigate without auto scroll
    if (pathname !== basePath) {
      router.push(basePath + (targetId ? `#${targetId}` : ''), { scroll: false });

      // Try scrolling ASAP after navigation paints
      let attempts = 0;
      const maxAttempts = 30;
      const tick = () => {
        attempts += 1;
        if (scrollToTarget() || attempts >= maxAttempts) return;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return;
    }

    // Try scrolling to the target with retries (DOM may render asynchronously)
    const maxAttempts = 20;
    let attempts = 0;

    const tryScroll = () => scrollToTarget();

    // First immediate attempt
    if (tryScroll()) return;

    // Retry a few times with short delays
    const timer = setInterval(() => {
      attempts += 1;
      if (tryScroll() || attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, 100);
  };

  // Use Link for proper prefetch and accessibility
  return (
    <Link
      href={href}
      className={className}
      aria-current={ariaCurrent}
      // We control scroll manually for same-route and cross-route cases above
      scroll={false}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
