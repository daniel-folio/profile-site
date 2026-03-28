'use client';

import React from 'react';
import { Hero } from "@/features/public/components/v1/sections/Hero";
import { Skills } from "@/features/public/components/v1/sections/Skills";
import { Projects } from "@/features/public/components/v1/sections/Projects";
import { Profile } from '@/features/common/types/profile';
import { Skill } from '@/features/common/types/skill';
import { Project } from '@/features/common/types/project';

interface HomePageClientV1Props {
    profile: Profile | null;
    skills: Skill[] | null;
    projects: Project[] | null;
}

export default function HomePageClientV1({ profile, skills, projects }: HomePageClientV1Props) {
    return (
        <div className="container mx-auto px-4">
            <div>
                <section id="hero" className="pt-16 md:pt-24 pb-16 md:pb-24 scroll-mt-[72px] md:scroll-mt-[80px]" style={{ scrollMarginTop: '80px' }}>
                    <Hero profile={profile} />
                </section>
                <section id="skills" className="pt-0 md:pt-0 pb-16 md:pb-24 bg-transparent scroll-mt-[72px] md:scroll-mt-[80px]" style={{ scrollMarginTop: '80px' }}>
                    <Skills skills={skills} />
                </section>
                <section id="projects" className="pt-0 md:pt-0 pb-16 md:pb-24 bg-transparent scroll-mt-[72px] md:scroll-mt-[80px]" style={{ scrollMarginTop: '80px' }}>
                    <Projects projects={projects} />
                </section>
            </div>
        </div>
    );
}
