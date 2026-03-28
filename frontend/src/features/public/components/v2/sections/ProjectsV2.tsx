'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Project } from '@/features/common/types/project';
import { PROJECT_CATEGORY_ORDER } from '@/features/common/utils/projectCategories';

interface ProjectsV2Props {
    projects: Project[] | null;
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

export default function ProjectsV2({ projects }: ProjectsV2Props) {
    const sectionRef = useScrollReveal();

    if (!projects || projects.length === 0) {
        return (
            <section className="v2-sec" ref={sectionRef}>
                <div className="v2-W">
                    <div className="v2-sec-hd v2-rise">
                        <span className="v2-sec-lbl">Selected Work</span>
                    </div>
                    <p style={{ color: 'var(--v2-t-sub)' }}>등록된 프로젝트가 없습니다.</p>
                </div>
            </section>
        );
    }

    const [filter, setFilter] = useState('All');
    
    // 실제 데이터에 존재하는 카테고리만 표시하되, projectCategories.ts 순서를 따름
    const existingTypes = new Set(projects.map(p => p.projectType).filter(Boolean));
    const filters = ['All', ...PROJECT_CATEGORY_ORDER.filter(t => existingTypes.has(t))];

    const filteredProjects = projects.filter(p => {
        if (filter === 'All') return true;
        return p.projectType === filter;
    });

    return (
        <section className="v2-sec" ref={sectionRef}>
            <div className="v2-W">
                <div className="v2-sec-hd v2-rise flex-col sm:flex-row !items-start sm:!items-center gap-6" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '52px' }}>
                    <div className="flex items-baseline gap-4">
                        <span className="v2-sec-lbl">Selected Work</span>
                        <span className="v2-sec-meta">
                            {String(filteredProjects.length).padStart(2, '0')} projects
                        </span>
                    </div>

                    {/* Filter Tabs */}
                    <div
                        className="flex gap-6 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0"
                        style={{
                            fontFamily: 'var(--v2-mono)',
                            color: 'var(--v2-t-sub)',
                            fontSize: '13px',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase'
                        }}
                    >
                        {filters.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className="relative py-1 transition-colors whitespace-nowrap"
                                style={{
                                    color: filter === f ? 'var(--v2-accent)' : 'inherit',
                                    fontWeight: filter === f ? 700 : 600
                                }}
                                onMouseEnter={(e) => {
                                    if (filter !== f) e.currentTarget.style.color = 'var(--v2-t-hi)';
                                }}
                                onMouseLeave={(e) => {
                                    if (filter !== f) e.currentTarget.style.color = 'inherit';
                                }}
                            >
                                {f}
                                {filter === f && (
                                    <span
                                        className="absolute left-0 bottom-0 w-full h-[1px]"
                                        style={{ background: 'var(--v2-accent)' }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <ul className="list-none v2-rise-list" style={{ margin: 0, padding: 0 }}>
                    {filteredProjects.map((project, idx) => {
                        // 스킬 태그 추출
                        const skillTags: string[] = [];
                        if (Array.isArray(project.skills?.data)) {
                            project.skills.data.forEach((s: any) => {
                                if (s?.name) skillTags.push(s.name);
                            });
                        }

                        return (
                            <li key={project.id} className="group relative">
                                {/* accent bar on hover */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-[2px] origin-bottom transition-transform duration-500 scale-y-0 group-hover:scale-y-100"
                                    style={{
                                        left: 'calc(-1 * var(--v2-pad))',
                                        background: 'var(--v2-accent)',
                                    }}
                                />

                                <Link href={`/portfolio/${project.slug}`}>
                                    <div
                                        className="flex flex-col md:grid gap-4 md:gap-6 items-start transition-colors md:grid-cols-[48px_1fr_220px_36px]"
                                        style={{
                                            padding: '40px 0',
                                            borderTop: '1px solid var(--v2-line)',
                                            borderBottom: idx === projects.length - 1
                                                ? '1px solid var(--v2-line)'
                                                : 'none',
                                        }}
                                    >
                                        {/* 번호 및 화살표 래퍼 (모바일 화면) */}
                                        <div className="flex md:hidden w-full justify-between items-center mb-2">
                                            <span
                                                className="text-[14px] tracking-[0.06em] pt-[3px] transition-colors group-hover:text-[var(--v2-accent)]"
                                                style={{ fontFamily: 'var(--v2-mono)', color: 'var(--v2-line-up)', fontWeight: 600 }}
                                            >
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                            <span
                                                className="text-base pt-[3px] transition-all group-hover:text-[var(--v2-accent)] group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
                                                style={{ color: 'var(--v2-line-up)' }}
                                            >
                                                ↗
                                            </span>
                                        </div>

                                        {/* 데스크톱 번호 */}
                                        <span
                                            className="hidden md:block text-[14px] tracking-[0.06em] pt-[3px] transition-colors group-hover:!text-[var(--v2-accent)]"
                                            style={{ fontFamily: 'var(--v2-mono)', color: 'var(--v2-line-up)', fontWeight: 600 }}
                                        >
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>

                                        {/* 정보 */}
                                        <div>
                                            <p
                                                className="text-[13px] font-bold uppercase tracking-[0.2em] mb-[9px]"
                                                style={{ fontFamily: 'var(--v2-mono)', color: 'var(--v2-accent)' }}
                                            >
                                                {project.projectType || 'Project'}
                                            </p>
                                            <h3
                                                className="font-semibold mb-3 transition-colors group-hover:!text-[var(--v2-accent)]"
                                                style={{
                                                    fontSize: 'clamp(18px, 1.8vw, 23px)',
                                                    letterSpacing: '-0.02em',
                                                    lineHeight: 1.25,
                                                    color: 'var(--v2-t-hi)',
                                                }}
                                            >
                                                {project.title}
                                            </h3>
                                            <p
                                                className="text-sm leading-[1.72] max-w-[540px]"
                                                style={{ color: 'var(--v2-t-body)', fontWeight: 400 }}
                                            >
                                                {project.shortDescription || ''}
                                            </p>
                                        </div>

                                        {/* 태그 */}
                                        <div className="flex flex-wrap gap-[6px] self-start pt-[2px]">
                                            {skillTags.slice(0, 4).map(tag => (
                                                <span
                                                    key={tag}
                                                    className="text-[12px] uppercase tracking-[0.07em] px-[12px] py-[6px] transition-all group-hover:!border-[var(--v2-accent-bdr)] group-hover:!text-[var(--v2-accent)] group-hover:!bg-[var(--v2-accent-sub)]"
                                                    style={{
                                                        fontFamily: 'var(--v2-mono)',
                                                        fontWeight: 600,
                                                        border: '1px solid var(--v2-line-up)',
                                                        color: 'var(--v2-t-sub)',
                                                    }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* 화살표 (데스크톱) */}
                                        <span
                                            className="hidden md:block text-base pt-[3px] self-start transition-all group-hover:!text-[var(--v2-accent)] group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
                                            style={{ color: 'var(--v2-line-up)' }}
                                        >
                                            ↗
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
