'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/types/project';
import { getImageUrl, getStatusColor, getProjectTypeIcon, formatDateRange } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { marked } from 'marked';

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
      <motion.section id="projects" className="py-20 text-center" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} viewport={{ once: false, amount: 0.2 }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">프로젝트</h2>
          <p className="text-gray-700 dark:text-gray-300">등록된 프로젝트가 없습니다.</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section id="projects" className="py-20" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} viewport={{ once: false, amount: 0.2 }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {featured ? '대표 프로젝트' : '모든 프로젝트'}
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
              <Card key={project.id} className="group overflow-hidden bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl dark:hover:shadow-primary-gradient-start/20">
                <div className="relative h-48 overflow-hidden">
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
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl text-gray-700 dark:text-gray-300">
                      {getProjectTypeIcon(project.projectType)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.projectStatus)}`}>
                      {project.projectStatus}
                    </span>
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{project.title}</CardTitle>
                  <CardDescription className="text-gray-700 dark:text-gray-300">
                    {project.shortDescription && (
                      <span dangerouslySetInnerHTML={{ __html: marked(project.shortDescription) }} />
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Array.isArray(project.technologies) && project.technologies.map((tech: any, idx) => (
                      <span key={tech?.id ?? idx} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded px-2 py-1">
                        {tech?.name ?? tech}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {formatDateRange(project.startDate, project.endDate)}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Link href={`/portfolio/${project.slug}`}>
                    <Button size="sm" variant="gradient">자세히 보기</Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
} 