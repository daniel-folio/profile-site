'use client';

import React, { useEffect, useRef } from 'react';
import { Profile } from '@/types/profile';
import { getStrapiMedia } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub, FaLinkedin, FaEnvelope, FaInstagram, FaFacebook, FaYoutube, FaBlogger, FaMedium, FaGlobe } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiVelog, SiTistory, SiNotion } from 'react-icons/si';
import { RichTextRenderer } from '@/components/common/ui/RichTextRenderer';

interface HeroV2Props {
    profile: Profile | null;
}

function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ref.current) return;
        const els = ref.current.querySelectorAll('.v2-rise, .v2-rise-list');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('on');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
        );
        els.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);
    return ref;
}

export default function HeroV2({ profile }: HeroV2Props) {
    const sectionRef = useScrollReveal();

    if (!profile) {
        return (
            <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16">
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--v2-t-hi)' }}>등록된 프로필 정보가 없습니다.</h2>
                <p style={{ color: 'var(--v2-t-sub)' }}>관리자 페이지에서 프로필을 등록해 주세요.</p>
            </section>
        );
    }

    const { name, title, mainBio, socialLinks, profileImage, email, location, headline, expertise, background } = profile;
    const profileImageUrl = profileImage?.url ? getStrapiMedia(profileImage.url) : null;

    // 타이틀에서 역할과 직급 분리 (예: "Full-Stack Developer" → ["Full-Stack", "Developer"])
    const titleParts = title ? title.split(' ') : [];
    const titleAccent = titleParts.slice(0, -1).join(' ') || title;
    const titleRest = titleParts.length > 1 ? titleParts[titleParts.length - 1] : '';

    // 소셜 링크 아이콘 매핑
    const socialIconMap: Record<string, { icon: React.ReactNode; label: string }> = {
        github: { icon: <FaGithub size={24} />, label: 'GitHub' },
        linkedin: { icon: <FaLinkedin size={24} />, label: 'LinkedIn' },
        x: { icon: <FaXTwitter size={24} />, label: 'X' },
        twitter: { icon: <FaXTwitter size={24} />, label: 'Twitter' },
        instagram: { icon: <FaInstagram size={24} />, label: 'Instagram' },
        facebook: { icon: <FaFacebook size={24} />, label: 'Facebook' },
        youtube: { icon: <FaYoutube size={24} />, label: 'YouTube' },
        blog: { icon: <FaBlogger size={24} />, label: 'Blog' },
        velog: { icon: <SiVelog size={24} />, label: 'Velog' },
        tistory: { icon: <SiTistory size={24} />, label: 'Tistory' },
        notion: { icon: <SiNotion size={24} />, label: 'Notion' },
        medium: { icon: <FaMedium size={24} />, label: 'Medium' },
        website: { icon: <FaGlobe size={24} />, label: 'Website' },
    };

    return (
        <div ref={sectionRef}>
            {/* Hero */}
            <section
                id="hero"
                className="flex flex-col border-b min-h-[50vh] md:min-h-svh"
                style={{ paddingTop: 62, borderColor: 'var(--v2-line)' }}
            >
                <div
                    className="flex-1 flex flex-col justify-center w-full py-20 md:py-0"
                    style={{
                        maxWidth: 'var(--v2-max)',
                        margin: '0 auto',
                        paddingLeft: 'var(--v2-pad)',
                        paddingRight: 'var(--v2-pad)'
                    }}
                >
                    {/* 상태 표시 */}
                    {headline && (
                        <div
                            className="inline-flex items-center gap-2 mb-11"
                            style={{ opacity: 0, animation: 'v2FadeUp .6s .1s ease forwards' }}
                        >
                            <span
                                className="w-[7px] h-[7px] rounded-full"
                                style={{ background: '#2db864', animation: 'v2LivePulse 2.2s ease-in-out infinite' }}
                            />
                            <span
                                className="text-[13px] sm:text-[14px] tracking-[0.2em] uppercase"
                                style={{ fontFamily: 'var(--v2-mono)', color: 'var(--v2-t-sub)', fontWeight: 500 }}
                            >
                                {headline}
                            </span>
                        </div>
                    )}

                    {/* 대형 헤딩 */}
                    <h1
                        className="font-semibold mb-14"
                        style={{
                            fontSize: 'clamp(64px, 10vw, 120px)',
                            lineHeight: 0.9,
                            letterSpacing: '-0.03em',
                            color: 'var(--v2-t-hi)',
                            opacity: 0,
                            animation: 'v2FadeUp .8s .2s ease forwards',
                        }}
                    >
                        <span className="block" style={{ color: 'var(--v2-accent)' }}>
                            {titleAccent}
                        </span>
                        {titleRest}
                        <span
                            className="block mt-4"
                            style={{
                                fontSize: '0.38em',
                                fontWeight: 400,
                                letterSpacing: '0.01em',
                                lineHeight: 1.3,
                                color: 'var(--v2-t-sub)',
                            }}
                        >
                            {name}
                        </span>
                    </h1>

                    {/* 하단 행: 설명 + 이미지 */}
                    <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start"
                        style={{
                            opacity: 0,
                            animation: 'v2FadeUp .7s .32s ease forwards',
                        }}
                    >
                        {/* 설명 및 CTA 영역 */}
                        <div>
                            {mainBio && (
                                <div
                                    className="text-base leading-[1.75]"
                                    style={{ color: 'var(--v2-t-body)', fontWeight: 400 }}
                                >
                                    <RichTextRenderer text={mainBio} className="" />
                                </div>
                            )}
                            <div className="flex gap-4 mt-8">
                                <Link href="/#projects" className="v2-btn v2-btn-fill">
                                    View Work
                                </Link>
                                <Link href="/resume" className="v2-btn v2-btn-outline">
                                    Resume
                                </Link>
                            </div>
                        </div>

                        {/* 프로필 이미지 영역 */}
                        {profileImageUrl && (
                            <div className="hidden md:flex justify-end">
                                <div
                                    className="relative w-64 h-80 lg:w-80 lg:h-[25rem] rounded-full overflow-hidden"
                                    style={{ border: '1px solid var(--v2-line-up)' }}
                                >
                                    <Image
                                        src={profileImageUrl}
                                        alt={name || 'Profile'}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 320px"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 소셜 링크 */}
                    {socialLinks && (
                        <div
                            className="flex gap-5 mt-8"
                            style={{ opacity: 0, animation: 'v2FadeUp .7s .45s ease forwards' }}
                        >
                            {Object.entries(socialLinks).map(([key, url]) => {
                                if (!url || !socialIconMap[key]) return null;
                                return (
                                    <a
                                        key={key}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={socialIconMap[key].label}
                                        className="transition-colors"
                                        style={{ color: 'var(--v2-t-sub)' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--v2-accent)')}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--v2-t-sub)')}
                                    >
                                        {socialIconMap[key].icon}
                                    </a>
                                );
                            })}
                            {email && (
                                <a
                                    href={`mailto:${email}`}
                                    aria-label="Email"
                                    className="transition-colors"
                                    style={{ color: 'var(--v2-t-sub)' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--v2-accent)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--v2-t-sub)')}
                                >
                                    <FaEnvelope size={24} />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* 메타 바 */}
            <div
                className="border-b transition-colors"
                style={{ background: 'var(--v2-bg-up)', borderColor: 'var(--v2-line)' }}
            >
                <div
                    className="grid grid-cols-2 md:grid-cols-4"
                    style={{
                        maxWidth: 'var(--v2-max)',
                        margin: '0 auto',
                        padding: '0 var(--v2-pad)',
                    }}
                >
                    <MetaCell label="Role" value={headline || 'Developer'} isMobileRow1 />
                    <MetaCell label="Expertise" value={expertise || 'Data Modeling'} isMobileRow1 isMobileLast />
                    <MetaCell label="Background" value={background || '백엔드 개발'} />
                    <MetaCell label="Location" value={location || 'Seoul · 원격 가능'} isLast isMobileLast />
                </div>
            </div>
        </div>
    );
}

function MetaCell({ label, value, isLast, isMobileLast, isMobileRow1 }: { label: string; value: string; isLast?: boolean; isMobileLast?: boolean; isMobileRow1?: boolean }) {
    let borderClass = '';
    // 우측 가로선 로직
    if (isLast) borderClass += 'border-r-0';
    else if (isMobileLast) borderClass += 'border-r-0 md:border-r';
    else borderClass += 'border-r';

    // 하단 가로선 로직 (모바일 1,2번째 아이템)
    if (isMobileRow1) borderClass += ' border-b md:border-b-0';

    return (
        <div
            className={`py-[16px] md:py-[22px] px-3 md:px-6 first:pl-0 transition-colors ${borderClass}`}
            style={{
                borderColor: 'var(--v2-line)',
            }}
        >
            <p
                className="text-[12px] font-medium uppercase tracking-[0.18em] mb-[6px]"
                style={{ fontFamily: 'var(--v2-mono)', color: 'var(--v2-accent)' }}
            >
                {label}
            </p>
            <p
                className="text-[13px] leading-[1.55]"
                style={{ color: 'var(--v2-t-body)', fontWeight: 400 }}
            >
                {value}
            </p>
        </div>
    );
}
