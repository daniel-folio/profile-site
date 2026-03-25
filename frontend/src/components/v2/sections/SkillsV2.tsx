'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Skill } from '@/types/skill';
import { getImageUrl } from '@/lib/utils';

interface SkillsV2Props {
    skills: Skill[] | null;
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

const CATEGORY_ORDER = ['Backend', 'Frontend', 'Database', 'Tools', 'Server', 'Other'];

export default function SkillsV2({ skills }: SkillsV2Props) {
    const sectionRef = useScrollReveal();
    const visibleSkills = (skills || []).filter(
        skill => skill.isPublic !== false && skill.visible !== false
    );

    if (visibleSkills.length === 0) {
        return (
            <section className="v2-sec" ref={sectionRef}>
                <div className="v2-W">
                    <div className="v2-sec-hd v2-rise">
                        <span className="v2-sec-lbl">Skills & Tools</span>
                    </div>
                    <p style={{ color: 'var(--v2-t-sub)' }}>등록된 기술 스택이 없습니다.</p>
                </div>
            </section>
        );
    }

    const skillsByCategory = visibleSkills.reduce((acc, skill) => {
        const category = skill.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill);
        return acc;
    }, {} as Record<string, Skill[]>);

    return (
        <section className="v2-sec" ref={sectionRef}>
            <div className="v2-W">
                <div className="v2-sec-hd v2-rise">
                    <span className="v2-sec-lbl">Skills & Tools</span>
                </div>
                <ul className="list-none v2-rise" style={{ margin: 0, padding: 0 }}>
                    {CATEGORY_ORDER.filter(category => skillsByCategory[category]).map((category, ci) => (
                        <li key={category}>
                                {/* 스킬 매핑 영역 레퍼 */}
                                <div
                                    className="flex flex-col md:grid items-baseline gap-4 md:gap-7 md:grid-cols-[168px_1fr]"
                                    style={{
                                        padding: '26px 0',
                                        borderTop: '1px solid var(--v2-line)',
                                        borderBottom: ci === CATEGORY_ORDER.filter(c => skillsByCategory[c]).length - 1
                                            ? '1px solid var(--v2-line)'
                                            : 'none',
                                    }}
                                >
                                    {/* 카테고리 라벨 */}
                                    <span
                                        className="text-[14px] font-bold uppercase tracking-[0.2em] md:pt-[2px]"
                                        style={{ fontFamily: 'var(--v2-mono)', color: 'var(--v2-accent)' }}
                                    >
                                    {category}
                                </span>

                                {/* 스킬 필 태그들 */}
                                <div className="flex flex-wrap gap-2">
                                    {skillsByCategory[category]
                                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                        .map((skill, idx) => {
                                            let iconUrl: string | undefined;
                                            if (skill.icon) {
                                                if ('data' in skill.icon && skill.icon.data) {
                                                    iconUrl = (skill.icon as any).data.attributes.url;
                                                } else if ('url' in skill.icon) {
                                                    iconUrl = (skill.icon as any).url;
                                                }
                                            }

                                            return (
                                                <span
                                                    key={skill.id}
                                                    className="inline-flex items-center gap-[6px] transition-all cursor-default"
                                                    style={{
                                                        fontFamily: 'var(--v2-sans)',
                                                        fontSize: '13px',
                                                        fontWeight: 500,
                                                        letterSpacing: '-0.01em',
                                                        color: 'var(--v2-t-hi)',
                                                        padding: '6px 14px',
                                                        border: '1px solid var(--v2-line-up)',
                                                        background: 'var(--v2-bg-card)',
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.borderColor = 'var(--v2-accent-bdr)';
                                                        e.currentTarget.style.color = 'var(--v2-accent)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.borderColor = 'var(--v2-line-up)';
                                                        e.currentTarget.style.color = 'var(--v2-t-hi)';
                                                    }}
                                                >
                                                    {/* 아이콘 — 텍스트 크기와 동일 (1em), 다크모드 대응을 위해 흰색 배경 추가 */}
                                                    {iconUrl && (
                                                        <Image
                                                            src={getImageUrl(iconUrl)}
                                                            alt={`${skill.name} icon`}
                                                            width={14}
                                                            height={14}
                                                            className="object-contain bg-white rounded-[2.5px] p-[1.5px]"
                                                            style={{ width: '1.15em', height: '1.15em', flexShrink: 0 }}
                                                        />
                                                    )}
                                                    {skill.name}
                                                </span>
                                            );
                                        })}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
