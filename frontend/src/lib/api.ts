import { ProfileResponse } from '@/types/profile';
import { SkillsResponse } from '@/types/skill';
import { ProjectsResponse, ProjectResponse, Project } from '@/types/project';

// Vercel에 설정된 환경 변수 값을 가져옵니다.
let strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';

// 사용자가 실수로 URL 끝에 '/'나 '/api'를 붙이는 경우를 대비해, 코드가 알아서 불필요한 부분을 제거하도록 보강합니다.
if (strapiUrl.endsWith('/')) {
  strapiUrl = strapiUrl.slice(0, -1);
}
if (strapiUrl.endsWith('/api')) {
  strapiUrl = strapiUrl.slice(0, -4);
}
const STRAPI_URL = strapiUrl;

// ⭐️ 해결책 1: Vercel에 등록한 API 토큰을 가져옵니다.
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

/**
 * Strapi 미디어 파일의 전체 URL을 반환하는 함수
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
 */
async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  
  // ⭐️ 해결책 2: 모든 요청에 인증 헤더를 기본으로 포함시킵니다.
  const defaultOptions: RequestInit = {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_API_TOKEN}`, // API 토큰(출입증) 제시
    },
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


// --- API 함수들 (이제 모두 인증된 상태로 요청됩니다) ---

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
  const path = `/projects?fields=slug`;
  return fetchAPI<{ data: { attributes: { slug: string } }[] }>(path);
}
