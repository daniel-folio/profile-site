"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Observe sections on the homepage and return the id of the section
 * currently most in view. Works for ids: hero, skills, projects (extensible).
 */
export function useActiveSection(sectionIds: string[] = ["hero", "skills", "projects"]) {
  const [active, setActive] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 홈이 아닐 때는 옵저버를 붙일 필요가 없음
    if (pathname !== "/") {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let retries = 0;
    const maxRetries = 20; // ~2s if interval is 100ms

    let elements: HTMLElement[] = [];

    const collectElements = () => {
      elements = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => !!el);
      return elements;
    };

    const init = () => {
      const elements = collectElements();

      if (elements.length === 0) {
        if (retries < maxRetries) {
          retries += 1;
          setTimeout(init, 100);
        }
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

          if (visible.length > 0) {
            const id = (visible[0].target as HTMLElement).id;
            setActive(id);
          } else {
            const byTop = entries
              .slice()
              .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
            const id = (byTop[0]?.target as HTMLElement | undefined)?.id;
            if (id) setActive(id);
          }
        },
        {
          // 더 이른 시점에 섹션을 활성으로 인식하고, 고정 헤더(약 64px)를 고려
          threshold: [0.15, 0.3, 0.6],
          rootMargin: "-64px 0px -55% 0px",
        }
      );

      elements.forEach((el) => observer!.observe(el));

      // 초기 active 계산 (스크롤 최상단 시 hero 선택)
      const firstVisible = elements.find((el) => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        return rect.top < vh * 0.65 && rect.bottom > vh * 0.2;
      });
      if (firstVisible) setActive(firstVisible.id);
    };

    // 초기 상태: 해시가 있으면 해시 우선, 없으면 첫 섹션(예: 'hero')
    const currentHash = (window.location.hash || "#").replace('#','');
    if (currentHash) {
      setActive(currentHash);
    } else if (!active && sectionIds.length > 0) {
      setActive(sectionIds[0]);
    }

    init();

    // 정밀 스크롤 폴백: 뷰포트 상단에서 25% 지점과 각 섹션의 top 거리 비교
    const updateByScrollPosition = () => {
      if (!elements.length) collectElements();
      if (!elements.length) return;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const targetY = vh * 0.25; // 상단에서 25% 지점
      let bestId: string | null = null;
      let bestDist = Number.POSITIVE_INFINITY;
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - targetY);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = el.id;
        }
      }
      if (bestId) setActive(bestId);
    };

    const onScroll = () => updateByScrollPosition();
    const onResize = () => updateByScrollPosition();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const onHash = () => setActive((window.location.hash || "#").replace('#','') || sectionIds[0] || null);
    window.addEventListener("hashchange", onHash);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("hashchange", onHash);
      if (observer) observer.disconnect();
    };
  }, [sectionIds.join("|"), pathname]);

  return active;
}
