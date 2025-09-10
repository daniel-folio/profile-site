"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HashLink } from '@/components/HashLink';
import { usePathname } from 'next/navigation';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useTheme } from 'next-themes';

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.95-4.243l-1.59-1.59M4.5 12H2.25m1.59-4.95l1.59 1.59" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25c0 5.385 4.365 9.75 9.75 9.75 2.572 0 4.92-.99 6.697-2.648z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
      onClick={toggleTheme}
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon className="w-5 h-5 text-yellow-400" />
      ) : (
        <MoonIcon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [hash, setHash] = useState<string>("");
  const activeSection = useActiveSection(["hero", "skills", "projects"]);

  useEffect(() => {
    // 초기 해시 설정 및 변경 감지
    if (typeof window !== 'undefined') {
      const updateHash = () => setHash(window.location.hash || "");
      updateHash();
      window.addEventListener('hashchange', updateHash);
      return () => window.removeEventListener('hashchange', updateHash);
    }
  }, []);

  const navLinks = [
    { href: '/#hero', label: '홈' },
    { href: '/#skills', label: '기술 스택' },
    { href: '/#projects', label: '프로젝트' },
    { href: '/resume', label: '이력서' },
    { href: '/career-detail', label: '경력기술서' },
  ];

  const isActive = (href: string) => {
    const currentHash = typeof window !== 'undefined' ? (window.location.hash || '') : hash;
    // 해시(#)가 포함된 섹션 링크 처리
    if (href.includes('#')) {
      const [base, section] = href.split('#');
      const sectionHash = `#${section}`;
      // 홈 경로에서는 현재 뷰포트 섹션(activeSection)을 우선으로 사용
      if (pathname === (base || '/')) {
        if (activeSection) {
          return activeSection === section;
        }
        // 해시가 없고 activeSection도 없으면 hero를 기본 활성으로 처리
        if (!currentHash) {
          return section === 'hero';
        }
        // 해시가 있으면 해시 기준으로 처리
        return currentHash === sectionHash;
      }
      // 홈이 아닌 경우에는 섹션 링크는 비활성 처리
      return false;
    }
    // 상세 경로를 포함하는 경우 startsWith로 처리 (예: /career-detail/[id])
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Portfolio
          </Link>

          {/* Desktop Navigation & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-6">
            <nav>
              <ul className="flex items-center space-x-6">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    {href.includes('#') ? (
                      <HashLink
                        href={href}
                        className={`transition-colors inline-block pb-0.5 ${
                          isActive(href)
                            ? 'text-base font-extrabold text-slate-900 dark:text-slate-100 border-b-2 border-primary-gradient-start'
                            : 'text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-gradient-start dark:hover:text-primary-gradient-start'
                        }`}
                        ariaCurrent={isActive(href) ? 'page' : undefined}
                      >
                        {label}
                      </HashLink>
                    ) : (
                      <Link
                        href={href}
                        className={`transition-colors inline-block pb-0.5 ${
                          isActive(href)
                            ? 'text-base font-extrabold text-slate-900 dark:text-slate-100 border-b-2 border-primary-gradient-start'
                            : 'text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-gradient-start dark:hover:text-primary-gradient-start'
                        }`}
                        aria-current={isActive(href) ? 'page' : undefined}
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button
              className="p-2 ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="메뉴 열기"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 dark:border-gray-800/50 py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map(({ href, label }) => (
                href.includes('#') ? (
                  <HashLink
                    key={href}
                    href={href}
                    className={`transition-colors inline-block pb-0.5 ${
                      isActive(href)
                        ? 'text-lg font-extrabold text-gray-900 dark:text-white border-b-2 border-primary-gradient-start'
                        : 'text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-gradient-start dark:hover:text-primary-gradient-start'
                    }`}
                    ariaCurrent={isActive(href) ? 'page' : undefined}
                    onNavigate={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </HashLink>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    className={`transition-colors inline-block pb-0.5 ${
                      isActive(href)
                        ? 'text-lg font-extrabold text-gray-900 dark:text-white border-b-2 border-primary-gradient-start'
                        : 'text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-gradient-start dark:hover:text-primary-gradient-start'
                    }`}
                    aria-current={isActive(href) ? 'page' : undefined}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                )
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 