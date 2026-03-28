'use client';
import React from 'react';
import Image from 'next/image';
import { Skill } from '@/features/common/types/skill';
import { getImageUrl } from '@/features/common/utils/utils';
import { motion } from 'framer-motion';
import { SKILL_CATEGORY_ORDER } from '@/features/common/utils/skillCategories';

interface SkillsProps {
  skills: Skill[] | null;
}

export function Skills({ skills }: SkillsProps) {
  const visibleSkills = (skills || []).filter(skill => skill.isPublic !== false && skill.visible !== false) ;
  if (visibleSkills.length === 0) {
    return (
      <motion.section className="text-center py-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} viewport={{ once: false, amount: 0 }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">기술 스택</h2>
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-12 shadow-sm border-dashed">
            <svg width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto text-gray-400 dark:text-gray-500 mb-6 opacity-60">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3 tracking-tight">아직 등록된 기술 스택이 없습니다</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm max-w-sm mx-auto">
              현재 활용 가능한 기술 스택 정보를 설정하고 있습니다.<br />조금만 기다려주세요!
            </p>
          </div>
        </div>
      </motion.section>
    );
  }
  // 카테고리별로 스킬 그룹화
  const skillsByCategory = visibleSkills.reduce((acc, skill) => {
    const category = skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);


  return (
    <motion.section
      className=""
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: false, amount: 0 }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
          기술 스택
        </h2>
        <div className="space-y-12">
          {SKILL_CATEGORY_ORDER.filter(category => skillsByCategory[category]).map(category => (
            <div key={category}>
              <h3 className="text-2xl font-semibold mb-6 capitalize text-gray-800 dark:text-gray-200">{category}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {skillsByCategory[category]
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((skill) => {
                    let iconUrl: string | undefined;

                    if (skill.icon) {
                      if ('data' in skill.icon && skill.icon.data) {
                        iconUrl = skill.icon.data.attributes.url;
                      } else if ('url' in skill.icon) {
                        iconUrl = skill.icon.url;
                      }
                    }

                    return (
                      <div key={skill.id} className="text-center">
                        <div className="bg-white shadow-md rounded-lg p-4 h-32 w-32 mx-auto flex items-center justify-center transition-transform duration-300 hover:scale-110">
                          {iconUrl ? (
                            <div className="relative w-24 h-24">
                              <Image
                                src={getImageUrl(iconUrl)}
                                alt={`${skill.name} icon`}
                                fill
                                sizes="6rem"
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <span className="text-4xl font-bold text-gray-400">{skill.name.slice(0, 2)}</span>
                          )}
                        </div>
                        <p className="mt-4 font-semibold text-gray-900 dark:text-gray-100">{skill.name}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
} 