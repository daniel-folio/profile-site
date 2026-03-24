'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HashLink } from '@/components/common/HashLink';
import { usePathname } from 'next/navigation';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useTheme } from 'next-themes';

export default function HeaderV2() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const [hash, setHash] = useState<string>('');
    const activeSection = useActiveSection(['hero', 'skills', 'projects']);
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const updateHash = () => setHash(window.location.hash || '');
            updateHash();
            window.addEventListener('hashchange', updateHash);
            return () => window.removeEventListener('hashchange', updateHash);
        }
    }, []);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/#skills', label: 'Skills' },
        { href: '/#projects', label: 'Project' },
        { href: '/resume', label: 'Resume' },
        { href: '/career-detail', label: 'Career' },
    ];

    const isActive = (href: string) => {
        const currentHash = typeof window !== 'undefined' ? (window.location.hash || '') : hash;
        if (href.includes('#')) {
            const [base, section] = href.split('#');
            const sectionHash = `#${section}`;
            if (pathname === (base || '/')) {
                if (activeSection) return activeSection === section;
                if (!currentHash) return section === 'hero';
                return currentHash === sectionHash;
            }
            return false;
        }
        if (href === '/') return pathname === '/';
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

    return (
        <header
            className="fixed top-0 left-0 right-0 z-[500] h-[62px] border-b transition-all"
            style={{
                borderColor: 'var(--v2-line)',
                background: resolvedTheme === 'dark'
                    ? 'rgba(14, 14, 12, .9)'
                    : 'rgba(245, 243, 238, .93)',
                backdropFilter: 'blur(20px)',
            }}
        >
            <div className="h-full flex items-center justify-between" style={{ maxWidth: 'var(--v2-header-max)', margin: '0 auto', padding: '0 var(--v2-pad)' }}>
                {/* 로고 */}
                <Link
                    href="/"
                    className="text-[15px] font-semibold tracking-tight transition-colors"
                    style={{ color: 'var(--v2-t-hi)', letterSpacing: '-0.02em' }}
                >
                    Han DaeSung<span style={{ color: 'var(--v2-accent)', fontStyle: 'normal' }}>.</span>
                </Link>

                {/* 데스크톱 네비게이션 */}
                <div className="hidden md:flex items-center">
                    <ul className="flex list-none">
                        {navLinks.map(({ href, label }) => (
                            <li key={href}>
                                {href.includes('#') ? (
                                    <HashLink
                                        href={href}
                                        className="flex items-center h-[62px] px-4 text-[12px] uppercase tracking-[0.1em] transition-colors"
                                        style={{
                                            color: isActive(href) ? 'var(--v2-accent)' : 'var(--v2-t-sub)',
                                            fontWeight: isActive(href) ? 700 : 500,
                                        }}
                                    >
                                        {label}
                                    </HashLink>
                                ) : (
                                    <Link
                                        href={href}
                                        className="flex items-center h-[62px] px-4 text-[12px] uppercase tracking-[0.1em] transition-colors"
                                        style={{
                                            color: isActive(href) ? 'var(--v2-accent)' : 'var(--v2-t-sub)',
                                            fontWeight: isActive(href) ? 700 : 500,
                                        }}
                                    >
                                        {label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* 테마 토글 */}
                    {mounted && (
                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 ml-2 rounded-full border flex items-center justify-center transition-colors"
                            style={{
                                borderColor: 'var(--v2-line)',
                                color: 'var(--v2-t-sub)',
                            }}
                            aria-label="테마 전환"
                        >
                            {resolvedTheme === 'dark' ? (
                                <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            ) : (
                                <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="4.2" />
                                    <line x1="12" y1="2" x2="12" y2="5.5" />
                                    <line x1="12" y1="18.5" x2="12" y2="22" />
                                    <line x1="2" y1="12" x2="5.5" y2="12" />
                                    <line x1="18.5" y1="12" x2="22" y2="12" />
                                    <line x1="4.93" y1="4.93" x2="7.17" y2="7.17" />
                                    <line x1="16.83" y1="16.83" x2="19.07" y2="19.07" />
                                    <line x1="19.07" y1="4.93" x2="16.83" y2="7.17" />
                                    <line x1="7.17" y1="16.83" x2="4.93" y2="19.07" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>

                {/* 모바일 메뉴 버튼 */}
                <div className="md:hidden flex items-center gap-2">
                    {mounted && (
                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-full border flex items-center justify-center"
                            style={{ borderColor: 'var(--v2-line)', color: 'var(--v2-t-sub)' }}
                            aria-label="테마 전환"
                        >
                            {resolvedTheme === 'dark' ? (
                                <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            ) : (
                                <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="4.2" />
                                    <line x1="12" y1="2" x2="12" y2="5.5" />
                                    <line x1="12" y1="18.5" x2="12" y2="22" />
                                </svg>
                            )}
                        </button>
                    )}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-9 h-9 rounded-full border flex items-center justify-center"
                        style={{ borderColor: 'var(--v2-line)', color: 'var(--v2-t-sub)' }}
                        aria-label="메뉴"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.7" strokeLinecap="round">
                            {isMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* 모바일 메뉴 */}
            {isMenuOpen && (
                <div
                    className="md:hidden border-t py-4 px-6"
                    style={{
                        borderColor: 'var(--v2-line)',
                        background: resolvedTheme === 'dark' ? 'rgba(14,14,12,.98)' : 'rgba(245,243,238,.98)',
                    }}
                >
                    <nav className="flex flex-col space-y-3">
                        {navLinks.map(({ href, label }) => (
                            href.includes('#') ? (
                                <HashLink
                                    key={href}
                                    href={href}
                                    className="text-[12px] uppercase tracking-[0.1em] py-2 transition-colors"
                                    style={{
                                        color: isActive(href) ? 'var(--v2-accent)' : 'var(--v2-t-sub)',
                                        fontWeight: isActive(href) ? 700 : 500
                                    }}
                                    onNavigate={() => setIsMenuOpen(false)}
                                >
                                    {label}
                                </HashLink>
                            ) : (
                                <Link
                                    key={href}
                                    href={href}
                                    className="text-[12px] uppercase tracking-[0.1em] py-2 transition-colors"
                                    style={{
                                        color: isActive(href) ? 'var(--v2-accent)' : 'var(--v2-t-sub)',
                                        fontWeight: isActive(href) ? 700 : 500
                                    }}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {label}
                                </Link>
                            )
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
