"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HashLink } from '@/components/common/HashLink';
import { usePathname } from 'next/navigation';
import { useActiveSection } from '@/hooks/useActiveSection';

export default function FooterV2() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const [hash, setHash] = useState<string>("");
  const activeSection = useActiveSection(["hero", "skills", "projects"]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateHash = () => setHash(window.location.hash || "");
      updateHash();
      window.addEventListener('hashchange', updateHash);
      return () => window.removeEventListener('hashchange', updateHash);
    }
  }, []);

  const quickLinks = [
    {
      href: '/#hero', label: '홈', icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      href: '/#skills', label: '기술 스택', icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      href: '/#projects', label: '프로젝트', icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      href: '/resume', label: '이력서', icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      href: '/career-detail', label: '경력기술서', icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  const isActive = (href: string) => {
    if (href.includes('#')) {
      const [base, section] = href.split('#');
      const sectionHash = `#${section}`;
      if (pathname === (base || '/')) {
        if (activeSection) {
          return activeSection === section;
        }
      }
      if (section === 'hero') {
        return pathname === (base || '/') && (hash === '' || hash === '#hero');
      }
      return pathname === (base || '/') && hash === sectionHash;
    }
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <footer className="py-12 border-t transition-colors w-full" style={{ background: 'var(--v2-bg-up)', borderColor: 'var(--v2-line)', color: 'var(--v2-t-hi)' }}>
      <div style={{ maxWidth: 'var(--v2-max)', margin: '0 auto', padding: '0 var(--v2-pad)' }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold" style={{ color: 'var(--v2-t-hi)' }}>Portfolio</h3>
          <p style={{ color: 'var(--v2-t-sub)' }}>
            데이터 엔지니어로서의 성장 과정과 프로젝트들을 공유하는 개인 포트폴리오입니다.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold" style={{ color: 'var(--v2-t-hi)' }}>빠른 링크</h4>
          <div className="md:hidden overflow-x-auto">
            <div className="flex space-x-4 pb-2">
              {quickLinks.map(({ href, label, icon }) => (
                href.includes('#') ? (
                  <HashLink
                    key={href}
                    href={href}
                    className="flex flex-col items-center min-w-[80px] p-2 rounded-lg transition-colors"
                  >
                    <span className="mb-1 transition-colors" style={{ color: isActive(href) ? 'var(--v2-accent)' : 'var(--v2-t-sub)' }}>
                      {icon}
                    </span>
                    <span className={`text-sm text-center ${isActive(href) ? 'underline underline-offset-4 decoration-2' : ''}`} style={{ color: isActive(href) ? 'var(--v2-accent)' : 'var(--v2-t-body)' }}>{label}</span>
                  </HashLink>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    className="flex flex-col items-center min-w-[80px] p-2 rounded-lg transition-colors"
                  >
                    <span className="mb-1 transition-colors" style={{ color: isActive(href) ? 'var(--v2-accent)' : 'var(--v2-t-sub)' }}>
                      {icon}
                    </span>
                    <span className={`text-sm text-center ${isActive(href) ? 'underline underline-offset-4 decoration-2' : ''}`} style={{ color: isActive(href) ? 'var(--v2-accent)' : 'var(--v2-t-body)' }}>{label}</span>
                  </Link>
                )
              ))}
            </div>
          </div>
          <ul className="hidden md:block space-y-2">
            {quickLinks.map(({ href, label, icon }) => (
              <li key={href}>
                {href.includes('#') ? (
                  <HashLink
                    href={href}
                    className="flex items-center space-x-2 transition-colors"
                    style={{ color: isActive(href) ? 'var(--v2-accent)' : 'var(--v2-t-sub)' }}
                  >
                    <span>{icon}</span>
                    <span className={isActive(href) ? 'underline underline-offset-4 decoration-2 font-bold' : ''}>{label}</span>
                  </HashLink>
                ) : (
                  <Link
                    href={href}
                    className="flex items-center space-x-2 transition-colors"
                    style={{ color: isActive(href) ? 'var(--v2-accent)' : 'var(--v2-t-sub)' }}
                  >
                    <span>{icon}</span>
                    <span className={isActive(href) ? 'underline underline-offset-4 decoration-2 font-bold' : ''}>{label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold" style={{ color: 'var(--v2-t-hi)' }}>연락처</h4>
          <div className="space-y-2" style={{ color: 'var(--v2-t-sub)' }}>
            <p className="flex items-center space-x-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>daniel.han.developer@gmail.com</span>
            </p>
            <p className="flex items-center space-x-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>서울, 대한민국</span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t mt-8 pt-8 text-center transition-colors" style={{ borderColor: 'var(--v2-line)', color: 'var(--v2-t-sub)' }}>
        <p>&copy; {currentYear} Portfolio. All rights reserved.</p>
      </div>
    </footer>
  );
}
