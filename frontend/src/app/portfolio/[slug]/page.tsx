import { getProjectBySlug, getAllProjectSlugs } from '@/lib/api';
import { notFound } from 'next/navigation';
import { formatDateRange, getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { InfoItem, InfoSection } from '@/components/ui/InfoItem';
import { Skill } from '@/types/skill';
import { StrapiMedia } from '@/types/media';

// API 응답 타입 (Strapi 기준)
type Project = {
  id: number;
  title: string;
  fullDescription: string;
  images: { data: { id: number; attributes: StrapiMedia }[] | null };
  technologies: { data: { id: number; attributes: Skill }[] | null };
  projectType: string;
  projectStatus: string;
  startDate: string;
  endDate: string;
  githubUrl?: string;
  liveUrl?: string;
};

type ProjectResponse = {
  data: Project | null;
};

export default async function ProjectPage(props: any) {
  const slug = props.params.slug;

  const response: ProjectResponse = await getProjectBySlug(slug);
  if (!response || !response.data) {
    notFound();
  }

  const project = response.data;

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

  if (images && images.data) {
    mainImage = images.data[0]?.attributes ?? null;
    otherImages = images.data.slice(1).map((img) => img.attributes);
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <main className="lg:col-span-2">
            <div className="relative aspect-video mb-8 overflow-hidden rounded-lg">
              <Image
                src={mainImage ? getImageUrl(mainImage.url) : '/placeholder.svg'}
                alt={mainImage ? mainImage.alternativeText || title : `${title} placeholder image`}
                fill
                className="object-cover"
                priority
              />
            </div>

            {otherImages.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold mb-6">스크린샷</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {otherImages.map((image) => (
                    <div key={image.url} className="relative aspect-video overflow-hidden rounded-lg">
                      <Image
                        src={getImageUrl(image.url)}
                        alt={image.alternativeText || `${title} 스크린샷`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h1>
                <div
                  className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
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
                    {technologies.data.map((tech) => (
                      <span
                        key={tech.id}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-full"
                      >
                        {tech.attributes.name}
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
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const allProjects = await getAllProjectSlugs();
  const slugs = allProjects?.data?.map((item) => item.attributes.slug) || [];

  return slugs.map((slug: string) => ({ slug }));
}
