import { getProjectBySlug, getAllProjectSlugs } from '@/lib/api';
import { notFound } from 'next/navigation';
import { formatDateRange, getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { InfoItem, InfoSection } from '@/components/ui/InfoItem';
import { Skill } from '@/types/skill';
import { StrapiMedia } from '@/types/media';

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export const dynamicParams = true;

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const { data: project } = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const {
    title,
    fullDescription,
    images,
    technologies,
    projectType,
    projectStatus,
    startDate,
    endDate,
    githubUrl,
    liveUrl,
  } = project;

  let mainImage: StrapiMedia | null = null;
  let otherImages: StrapiMedia[] = [];

  if (images) {
    if ('data' in images) { // Standard Strapi structure
      mainImage = images.data?.[0]?.attributes ?? null;
      otherImages = images.data?.slice(1).map(img => img.attributes) ?? [];
    } else if (Array.isArray(images)) { // Flattened structure
      mainImage = images?.[0] ?? null;
      otherImages = images?.slice(1) ?? [];
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <main className="lg:col-span-2">
            <div className="relative aspect-video mb-8">
              <Image
                src={mainImage ? getImageUrl(mainImage.url) : '/placeholder.svg'}
                alt={mainImage ? mainImage.alternativeText || title : `${title} placeholder image`}
                fill
                className="rounded-lg object-cover"
                priority
              />
            </div>
          </main>
          
          <aside>
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h2>
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: fullDescription || '' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoItem label="프로젝트 형태" value={projectType} />
                <InfoItem label="상태" value={projectStatus} />
                <InfoItem label="기간" value={formatDateRange(startDate, endDate)} />
              </div>

              {technologies?.data && technologies.data.length > 0 && (
                <InfoSection title="사용 기술">
                  <div className="flex flex-wrap gap-2">
                    {technologies.data.map((tech: Skill) => (
                      <span
                        key={tech.id}
                        className="px-3 py-1 bg-gray-200/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 text-sm rounded-full"
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </InfoSection>
              )}

              {(githubUrl || liveUrl) && (
                <InfoSection title="관련 링크">
                  <div className="flex flex-wrap gap-4">
                    {githubUrl && (
                      <Button asChild>
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                          GitHub 저장소
                        </a>
                      </Button>
                    )}
                    {liveUrl && (
                      <Button asChild variant="secondary">
                        <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                          라이브 데모
                        </a>
                      </Button>
                    )}
                  </div>
                </InfoSection>
              )}
            </div>
          </aside>
        </div>

        {otherImages.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-6">스크린샷</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherImages.map((image) => (
                <div key={image.url} className="relative aspect-video">
                  <Image
                    src={getImageUrl(image.url)}
                    alt={image.alternativeText || `${title} 스크린샷`}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((item) => ({
    slug: item,
  }));
} 