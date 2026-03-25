import { getProjectBySlug, getAllProjectSlugs } from '@/lib/api';
import { notFound } from 'next/navigation';
import { formatDateRange, getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Skill } from '@/types/skill';
import { StrapiMedia } from '@/types/media';
import { RichTextRenderer } from '@/components/common/ui/RichTextRenderer';

// --- 타입 정의 ---

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

interface StrapiApiCollectionResponse<T> {
  data: { id: number; attributes: T }[];
}

type PageProps = {
  params: { slug: string };
};

// --- 페이지 컴포넌트 ---

export default async function ProjectPage(props: any) {
  const params = await props.params;
  const slug = params.slug;

  const response = await getProjectBySlug(slug, { next: { revalidate: 3600 } });

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

  const displayCategory = projectType || 'Project';

  // 이미지 추출 로직
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
    <div style={{ background: 'var(--v2-bg)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 'var(--v2-max)',
          margin: '0 auto',
          padding: 'clamp(100px, 12vh, 140px) var(--v2-pad) 80px',
        }}
      >
        {/* 뒤로가기 */}
        <Link
          href="/#projects"
          className="v2-back-link"
        >
          ← Back to Projects
        </Link>

        {/* 상단: 프로젝트 제목 + 메타 정보 */}
        <div style={{ marginBottom: 48 }}>
          <p
            style={{
              fontFamily: 'var(--v2-mono)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: 'var(--v2-accent)',
              marginBottom: 16,
            }}
          >
            {displayCategory}
          </p>
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: 'var(--v2-t-hi)',
              marginBottom: 24,
            }}
          >
            {title}
          </h1>

          {/* 메타 바 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderTop: '1px solid var(--v2-line)',
              borderBottom: '1px solid var(--v2-line)',
            }}
          >
            <MetaCell label="Type" value={displayCategory} />
            <MetaCell label="Status" value={projectStatus} />
            <MetaCell label="Period" value={formatDateRange(startDate, endDate)} isLast />
          </div>
        </div>

        {/* 메인 이미지 */}
        {mainImage && (
          <div
            style={{
              position: 'relative',
              aspectRatio: '16/9',
              marginBottom: 56,
              overflow: 'hidden',
              borderRadius: 8,
              border: '1px solid var(--v2-line)',
            }}
          >
            <Image
              src={getImageUrl(mainImage.url)}
              alt={mainImage.alternativeText || title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* 본문: 설명 + 사이드바 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: 64,
          }}
          className="v2-detail-grid"
        >
          {/* 왼쪽: 프로젝트 설명 */}
          <div>
            <h2
              style={{
                fontFamily: 'var(--v2-mono)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase' as const,
                color: 'var(--v2-accent)',
                marginBottom: 24,
              }}
            >
              ─── About the Project
            </h2>
            <RichTextRenderer
              text={fullDescription}
              className="v2-prose"
            />

            {/* 추가 스크린샷 */}
            {otherImages.length > 0 && (
              <div style={{ marginTop: 64 }}>
                <h3
                  style={{
                    fontFamily: 'var(--v2-mono)',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--v2-accent)',
                    marginBottom: 24,
                  }}
                >
                  ─── Screenshots
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 16,
                  }}
                >
                  {otherImages.map((image: any) => (
                    <div
                      key={image.url}
                      style={{
                        position: 'relative',
                        aspectRatio: '16/9',
                        overflow: 'hidden',
                        borderRadius: 6,
                        border: '1px solid var(--v2-line)',
                      }}
                    >
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

          {/* 오른쪽: 기술 스택 + 링크 */}
          <aside>
            <div style={{ position: 'sticky', top: 100 }}>
              {/* 기술 스택 */}
              {technologies?.data && technologies.data.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--v2-mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--v2-accent)',
                      marginBottom: 16,
                    }}
                  >
                    ─── Tech Stack
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {technologies.data.map((skill: { id: number; attributes: Skill }) => (
                      <span
                        key={skill.id}
                        style={{
                          fontFamily: 'var(--v2-mono)',
                          fontSize: 13,
                          fontWeight: 600,
                          letterSpacing: '0.07em',
                          textTransform: 'uppercase' as const,
                          padding: '6px 14px',
                          border: '1px solid var(--v2-line-up)',
                          color: 'var(--v2-t-sub)',
                          transition: 'all .2s',
                        }}
                      >
                        {skill.attributes.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 관련 링크 */}
              {(githubUrl || liveUrl) && (
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--v2-mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--v2-accent)',
                      marginBottom: 16,
                    }}
                  >
                    ─── Links
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="v2-btn v2-btn-fill"
                        style={{ textAlign: 'center' }}
                      >
                        GitHub Repository
                      </a>
                    )}
                    {liveUrl && (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="v2-btn v2-btn-outline"
                        style={{ textAlign: 'center' }}
                      >
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MetaCell({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <div
      style={{
        padding: '18px 20px',
        borderRight: isLast ? 'none' : '1px solid var(--v2-line)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--v2-mono)',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: 'var(--v2-accent)',
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--v2-t-body)',
          fontWeight: 500,
        }}
      >
        {value}
      </p>
    </div>
  );
}

// 빌드 시점에 정적 페이지를 미리 생성하기 위한 함수
export async function generateStaticParams() {
  const allProjects = await getAllProjectSlugs();
  if (!allProjects?.data || !Array.isArray(allProjects.data)) {
    return [];
  }
  const slugs = allProjects.data
    .map((item: any) => item?.attributes?.slug || item?.slug)
    .filter((slug: any) => typeof slug === 'string' && !!slug);
  return slugs.map((slug: string) => ({ slug }));
}
