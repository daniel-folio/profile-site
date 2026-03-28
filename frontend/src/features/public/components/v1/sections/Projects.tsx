'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/features/common/types/project';
import { getImageUrl, getStatusColor, getProjectTypeIcon, formatDateRange } from '@/features/common/utils/utils';
import { Button } from '@/features/common/ui/Button';
import { motion } from 'framer-motion';
import { RichTextRenderer } from '@/features/common/ui/RichTextRenderer';

interface ProjectsProps {
  projects: Project[] | null;
  featured?: boolean;
}

function isStrapiMedia(media: any): media is { url: string; alternativeText: string | null } {
  return media && typeof media.url === 'string';
}

function isStrapiMediaArray(media: any): media is { url: string; alternativeText: string | null }[] {
  return Array.isArray(media) && media.every(isStrapiMedia);
}

export function Projects({ projects, featured = false }: ProjectsProps) {
  if (!projects || projects.length === 0) {
    return (
      <motion.section className="text-center py-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} viewport={{ once: false, amount: 0.2 }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
              {featured ? '대표 프로젝트' : '모든 프로젝트'}
            </h2>
          </div>
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-3xl py-16 px-6 shadow-sm border-dashed">
            <svg width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto text-gray-300 dark:text-gray-600 mb-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-3 tracking-tight">프로젝트 준비 중</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
              새로운 프로젝트들을 기획하고 구현하는 중입니다.<br />곧 멋진 결과물로 찾아뵙겠습니다.
            </p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section className="" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} viewport={{ once: false, amount: 0.2 }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {featured ? '모든 프로젝트' : '대표 프로젝트'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            let imageUrl: string | undefined;
            let imageAlt: string | null | undefined = project.title;

            if (project.thumbnailImage) {
              if ('data' in project.thumbnailImage && project.thumbnailImage.data) {
                imageUrl = project.thumbnailImage.data.attributes.url;
                imageAlt = project.thumbnailImage.data.attributes.alternativeText;
              } else if (isStrapiMedia(project.thumbnailImage)) {
                imageUrl = project.thumbnailImage.url;
                imageAlt = project.thumbnailImage.alternativeText;
              }
            }
            
            if (!imageUrl && project.images) {
              if ('data' in project.images && project.images.data.length > 0) {
                imageUrl = project.images.data[0].attributes.url;
                imageAlt = project.images.data[0].attributes.alternativeText;
              } else if (isStrapiMediaArray(project.images) && project.images.length > 0) {
                imageUrl = project.images[0].url;
                imageAlt = project.images[0].alternativeText;
              }
            }

            return (
              <div key={project.id} className="group overflow-hidden bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl dark:hover:shadow-primary-gradient-start/20 rounded-lg border border-gray-200 transition-all duration-150 hover:shadow-none flex flex-col h-full">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  {imageUrl && (
                    <Image
                      src={getImageUrl(imageUrl)!}
                      alt={imageAlt || project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover w-full h-full transition-all duration-150 filter brightness-75 group-hover:brightness-100 group-hover:scale-110"
                    />
                  )}
                </div>
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl text-gray-700 dark:text-gray-300">
                      {getProjectTypeIcon(project.projectType || '')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.projectStatus)}`}>
                      {project.projectStatus}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100">{project.title}</h3>
                  {/* CardDescription을 div와 RichTextRenderer로 교체하여 마크다운을 렌더링합니다. */}
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {project.shortDescription && 
                      <RichTextRenderer text={project.shortDescription} className="prose prose-sm dark:prose-invert max-w-none" />}
                  </div>
                </div>
                <div className="p-6 pt-0 flex-grow">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Array.isArray(project.skills?.data) && project.skills.data.map((skill: any, idx) => (
                      <span key={skill?.id ?? idx} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded px-2 py-1">
                        {skill?.name ?? skill}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {formatDateRange(project.startDate, project.endDate)}
                  </div>
                </div>
                <div className="flex items-center p-6 pt-0 justify-end mt-auto">
                  <Link href={`/portfolio/${project.slug}`}>
                    <Button size="sm" variant="gradient">자세히 보기</Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
} 