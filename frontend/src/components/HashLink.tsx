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

    const scrollToTarget = () => {
      if (!targetId) return false;
      const el = document.getElementById(targetId);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
      if (onNavigate) onNavigate();
      return true;
    };

    // Same-route: prevent default and scroll immediately with retries
    if (pathname === basePath) {
      e.preventDefault();

      // Update the URL hash without causing a full scroll
      const url = basePath + (targetId ? `#${targetId}` : '');
      router.push(url, { scroll: false });

      // Retry until the element is present (hydration/paint timing)
      let attempts = 0;
      const maxAttempts = 40;
      const tick = () => {
        attempts += 1;
        if (scrollToTarget() || attempts >= maxAttempts) return;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return;
    }

    // Cross-route: navigate then scroll after paint
    e.preventDefault();
    router.push(basePath + (targetId ? `#${targetId}` : ''), { scroll: false });

    let attempts = 0;
    const maxAttempts = 60;
    const tick = () => {
      attempts += 1;
      if (scrollToTarget() || attempts >= maxAttempts) return;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  return (
    <Link href={href} className={className} aria-current={ariaCurrent} scroll={false} onClick={handleClick}>
      {children}
    </Link>
  );
}
