import { ProfileResponse } from '@/types/profile';
import { SkillsResponse } from '@/types/skill';
import { ProjectsResponse, ProjectResponse, Project } from '@/types/project';

// 1. Vercel에 설정된 환경 변수 값을 가져옵니다.
let strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';

// 2. ⭐️ 최종 해결책: 사용자가 실수로 URL 끝에 '/'나 '/api'를 붙이는 경우를 대비해,
//    코드가 알아서 불필요한 부분을 제거하도록 보강합니다.
if (strapiUrl.endsWith('/')) {
  strapiUrl = strapiUrl.slice(0, -1);
}
if (strapiUrl.endsWith('/api')) {
  strapiUrl = strapiUrl.slice(0, -4);
}
const STRAPI_URL = strapiUrl;


/**
 * Strapi 미디어 파일의 전체 URL을 반환하는 함수
 * @param url - Strapi에서 받은 미디어의 URL
 * @returns 전체 이미지 URL 또는 null
 */
export function getStrapiMedia(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }
  if (url.startsWith('http')) {
    return url;
  }
  return `${STRAPI_URL}${url}`;
}


/**
 * API 호출을 위한 중앙 집중식 헬퍼 함수
 * @param path - /api/ 이후의 경로 (예: /projects)
 * @param options - fetch 함수에 전달할 옵션
 * @returns - API로부터 받은 JSON 데이터
 */
async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  const defaultOptions: RequestInit = {
    cache: 'no-store',
    ...options,
  };

  try {
    const requestUrl = `${STRAPI_URL}/api${path}`;
    const response = await fetch(requestUrl, defaultOptions);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', errorBody);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching API:", error);
    throw new Error(`Error fetching API: ${error instanceof Error ? error.message : String(error)}`);
  }
}


// --- API 함수들 ---

export async function getProfile(): Promise<ProfileResponse> {
  return fetchAPI<ProfileResponse>('/profile?populate=*');
}

export async function getSkills(): Promise<SkillsResponse> {
  return fetchAPI<SkillsResponse>('/skills?populate=*&sort=order:asc');
}

export async function getProjects(featured?: boolean): Promise<ProjectsResponse> {
  const filters = featured ? '&filters[featured][$eq]=true' : '';
  return fetchAPI<ProjectsResponse>(`/projects?populate=*&sort=order:asc${filters}`);
}

export async function getProjectBySlug(slug: string): Promise<ProjectsResponse> {
  const path = `/projects?filters[slug][$eq]=${slug}&populate=*`;
  return fetchAPI<ProjectsResponse>(path);
}

export async function getAllProjectSlugs(): Promise<{ data: { attributes: { slug: string } }[] }> {
  const path = `/projects`;
  return fetchAPI<{ data: { attributes: { slug: string } }[] }>(path);
}
