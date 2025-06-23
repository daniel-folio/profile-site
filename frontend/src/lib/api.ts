import { ProfileResponse } from '@/types/profile';
import { SkillsResponse } from '@/types/skill';
import { ProjectsResponse, ProjectResponse, Project } from '@/types/project';

// 1. 환경 변수 이름을 Vercel에 설정한 것과 정확히 일치시킵니다.
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';

/**
 * Strapi 미디어 파일의 전체 URL을 반환하는 함수
 * @param url - Strapi에서 받은 미디어의 URL
 * @returns 전체 이미지 URL 또는 null
 */
export function getStrapiMedia(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }
  // 이미 전체 URL인 경우 그대로 반환
  if (url.startsWith('http')) {
    return url;
  }
  // 상대 경로인 경우 기본 URL을 앞에 붙여서 반환
  return `${STRAPI_URL}${url}`;
}


/**
 * API 호출을 위한 중앙 집중식 헬퍼 함수
 * @param path - /api/ 이후의 경로 (예: /projects)
 * @param options - fetch 함수에 전달할 옵션
 * @returns - API로부터 받은 JSON 데이터
 */
async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  // 기본 옵션에 no-store 캐시 전략을 포함하여 항상 최신 데이터를 가져오도록 합니다.
  const defaultOptions: RequestInit = {
    cache: 'no-store',
    ...options,
  };

  try {
    const requestUrl = `${STRAPI_URL}/api${path}`;
    const response = await fetch(requestUrl, defaultOptions);

    if (!response.ok) {
      // 에러가 발생하면 응답 내용을 함께 로깅하여 디버깅을 돕습니다.
      const errorBody = await response.text();
      console.error('API Error Response:', errorBody);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching API:", error);
    // 에러를 다시 던져서 호출한 쪽에서 처리할 수 있도록 합니다.
    throw new Error(`Error fetching API: ${error instanceof Error ? error.message : String(error)}`);
  }
}


// --- API 함수들 ---

// Profile API
export async function getProfile(): Promise<ProfileResponse> {
  return fetchAPI<ProfileResponse>('/profile?populate=*');
}

// Skills API
export async function getSkills(): Promise<SkillsResponse> {
  return fetchAPI<SkillsResponse>('/skills?populate=*&sort=order:asc');
}

// Projects API
export async function getProjects(featured?: boolean): Promise<ProjectsResponse> {
  const filters = featured ? '&filters[featured][$eq]=true' : '';
  return fetchAPI<ProjectsResponse>(`/projects?populate=*&sort=order:asc${filters}`);
}

export async function getProjectBySlug(slug: string): Promise<ProjectsResponse> {
  const path = `/projects?filters[slug][$eq]=${slug}&populate=*`;
  return fetchAPI<ProjectsResponse>(path);
}

export async function getAllProjectSlugs(): Promise<{ data: { attributes: { slug: string } }[] }> {
  // ⭐️ 최종 해결책: 특정 필드만 요청하는 대신, 전체 프로젝트 목록을 요청합니다.
  // 이는 쿼리 파라미터 문법으로 인한 400 Bad Request 에러를 우회하는 가장 확실한 방법입니다.
  // populate를 제외하여 요청을 가볍게 유지합니다.
  const path = `/projects`;
  return fetchAPI<{ data: { attributes: { slug: string } }[] }>(path);
}
