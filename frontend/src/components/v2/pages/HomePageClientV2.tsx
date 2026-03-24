'use client';

import React from 'react';
import HeroV2 from '@/components/v2/sections/HeroV2';
import SkillsV2 from '@/components/v2/sections/SkillsV2';
import ProjectsV2 from '@/components/v2/sections/ProjectsV2';
import { Profile } from '@/types/profile';
import { Skill } from '@/types/skill';
import { Project } from '@/types/project';

interface PageV2Props {
    profile: Profile | null;
    skills: Skill[] | null;
    projects: Project[] | null;
}

export default function HomePageClientV2({ profile, skills, projects }: PageV2Props) {
    return (
        <>
            {/* 상단 영역 — 파티클 #8 Pulse Ripple 배경 */}
            <section id="v2-zone-top" style={{ scrollMarginTop: '62px' }}>
                <div id="hero">
                    <HeroV2 profile={profile} />
                </div>
            </section>

            {/* 중간 영역 — 파티클 #7 Gradient Drift 배경 */}
            <section id="v2-zone-mid" style={{ scrollMarginTop: '62px' }}>
                <div id="skills" className="v2-sec" style={{ scrollMarginTop: '62px' }}>
                    <div className="v2-W">
                        <SkillsV2 skills={skills} />
                    </div>
                </div>
                <div id="projects" style={{ scrollMarginTop: '62px' }}>
                    <ProjectsV2 projects={projects} />
                </div>
            </section>

        </>
    );
}
