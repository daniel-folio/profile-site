import { getProjectBySlug, getAllProjectSlugs } from '@/lib/api';
import { notFound } from 'next/navigation';
import { formatDateRange, getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { InfoItem, InfoSection } from '@/components/ui/InfoItem';
import { Skill } from '@/types/skill';
import { StrapiMedia } from '@/types/media';

// --- 타입 정의: API 응답과 페이지 Props의 구조를 명확하게 정의합니다 ---

// 프로젝트 데이터의 상세 속성 타입
interface ProjectAttributes {
  title: string;
  slug: string;
  fullDescription: string;
  images: { data: { id: number; attributes: StrapiMedia }[] | null };
  technologies: { data: { id: number; attributes: Skill }[] | null };
  projectType: string;
  projectStatus: string;
  startDate: string;
  endDate: string;
  githubUrl?: string;
  liveUrl?: string;
}

// Strapi API의 단일 항목 응답 형태
interface StrapiApiSingleResponse<T> {
  data: { id: number; attributes: T } | null;
}

// Strapi API의 여러 항목(컬렉션) 응답 형태
interface StrapiApiCollectionResponse<T> {
  data: { id: number; attributes: T }[];
}

// 페이지가 받는 Props의 정확한 타입 (Next.js 규칙 준수)
type PageProps = {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

// --- 페이지 컴포넌트 ---

export default async function ProjectPage({ params }: PageProps) {
  
  const slug = params.slug;

  const response = await getProjectBySlug(slug) as StrapiApiSingleResponse<ProjectAttributes>;

  if (!response?.data?.attributes) {
    notFound();
  }

  const project = response.data.attributes;

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
    otherImages = images.data.slice(1).map(img => img.attributes);
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* ----- 왼쪽 메인 콘텐츠 ----- */}
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
          
          {/* ----- 오른쪽 사이드바 정보 ----- */}
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
                    {technologies.data.map((tech: { id: number; attributes: Skill }) => (
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

// 빌드 시점에 정적 페이지를 미리 생성하기 위한 함수입니다.
// ⭐️ 해결책: 함수의 반환 타입을 명시적으로 지정하여 타입 추론의 모호함을 없앱니다.
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const allProjects = await getAllProjectSlugs() as StrapiApiCollectionResponse<{ slug: string }>;
  
  if (!allProjects?.data || !Array.isArray(allProjects.data)) {
    return [];
  }

  const slugs = allProjects.data
    .map((item: { id: number, attributes: { slug: string } }) => item.attributes.slug)
    .filter((slug): slug is string => typeof slug === 'string'); // slug가 문자열인지 한 번 더 확인
  
  return slugs.map((slug) => ({
    slug: slug,
  }));
}
