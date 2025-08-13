import { getProjectBySlug, getAllProjectSlugs } from '@/lib/api';
import { notFound } from 'next/navigation';
import { formatDateRange, getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { InfoItem, InfoSection } from '@/components/ui/InfoItem';
import { Skill } from '@/types/skill';
import { StrapiMedia } from '@/types/media';
import { marked } from 'marked';
import { RichTextRenderer } from '@/components/ui/RichTextRenderer';

// --- 타입 정의: 각 데이터의 형태를 명확하게 정의합니다 ---

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
  thumbnailImage?: StrapiMedia | null;
}

// Strapi API의 여러 항목(컬렉션) 응답 형태
interface StrapiApiCollectionResponse<T> {
  data: { id: number; attributes: T }[];
}

// 페이지가 받는 Props의 정확한 타입
type PageProps = {
  params: { slug: string };
};

// --- 페이지 컴포넌트 ---

export default async function ProjectPage(props: any) {
  const params = await props.params;
  const slug = params.slug;

  const response = await getProjectBySlug(slug, { next: { revalidate: 3600 } });

  // 유연하게 flat/attributes 구조 모두 지원
  const projectData = response?.data?.[0];
  const project = (projectData as any)?.attributes || projectData;

  if (!project) {
    console.log('404로 빠지는 원인:', projectData);
    notFound();
  }

  const {
    title = '',
    fullDescription = '',
    images = { data: [] },
    technologies = { data: [] },
    projectType = '',
    projectStatus = '',
    startDate = '',
    endDate = '',
    githubUrl = '',
    liveUrl = '',
    thumbnailImage = null,
  } = project;

  // 이미지 추출 로직 유연하게
  let mainImage: any = null;
  let otherImages: any[] = [];
  if (Array.isArray(images) && images.length > 0) {
    mainImage = images[0];
    otherImages = images.slice(1);
  } else if (images && images.data && images.data.length > 0) {
    mainImage = images.data[0]?.attributes ?? null;
    otherImages = images.data.slice(1).map((img: any) => img.attributes);
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* ----- 상단: 제목과 기본 정보 ----- */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <InfoItem label="프로젝트 형태" value={projectType} />
            <InfoItem label="상태" value={projectStatus} />
            <InfoItem label="기간" value={formatDateRange(startDate, endDate)} />
          </div>
        </div>

        {/* ----- 메인 이미지 (있는 경우에만 표시) ----- */}
        {mainImage && (
          <div className="relative aspect-video mb-8 overflow-hidden rounded-lg">
            <Image
              src={getImageUrl(mainImage.url)}
              alt={mainImage.alternativeText || title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* ----- 하단: 설명과 부가 정보를 나란히 배치 ----- */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* 왼쪽: 프로젝트 설명 */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">프로젝트 소개</h2>
              <RichTextRenderer text={fullDescription} className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300" />
            </div>

            {/* 추가 스크린샷들 */}
            {otherImages.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">스크린샷</h3>
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
          </div>
          
          {/* 오른쪽: 기술 스택과 링크 */}
          <aside className="h-fit">
            <div className="space-y-8">
              {technologies?.data && technologies.data.length > 0 && (
                <InfoSection title="사용 기술">
                  <div className="flex flex-wrap gap-2">
                    {technologies.data.map((skill: { id: number; attributes: Skill }) => (
                      <span
                        key={skill.id}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-full"
                      >
                        {skill.attributes.name}
                      </span>
                    ))}
                  </div>
                </InfoSection>
              )}

              {(githubUrl || liveUrl) && (
                <InfoSection title="관련 링크">
                  <div className="flex flex-col gap-3">
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 rounded bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end text-white font-semibold shadow hover:opacity-90 transition text-center"
                      >
                        GitHub 저장소
                      </a>
                    )}
                    {liveUrl && (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold shadow hover:opacity-90 transition text-center"
                      >
                        라이브 데모
                      </a>
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
export async function generateStaticParams() {
  const allProjects = await getAllProjectSlugs();
  if (!allProjects?.data || !Array.isArray(allProjects.data)) {
    return [];
  }
  // flat 구조와 attributes 구조 모두 지원
  const slugs = allProjects.data
    .map((item: any) => item?.attributes?.slug || item?.slug)
    .filter((slug: any) => typeof slug === 'string' && !!slug);
  return slugs.map((slug: string) => ({ slug }));
}
