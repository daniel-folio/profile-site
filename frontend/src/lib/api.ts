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

// Vercel에 등록한 API 토큰을 가져옵니다.
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
  const path = `/projects?filters[slug][$eq]a=${slug}&populate=*`;
  return fetchAPI<ProjectsResponse>(path);
}

// ⭐️ 최종 해결책: API 응답을 받은 후, 데이터를 직접 검사하고 정제하여 안전한 형태로 반환합니다.
export async function getAllProjectSlugs(): Promise<{ slug: string }[]> {
  const path = `/projects?fields=slug`;
  const response = await fetchAPI<{ data: { attributes: { slug: string } }[] }>(path);

  // 데이터가 유효하지 않으면 빈 배열을 반환하여 빌드 에러를 방지합니다.
  if (!response || !Array.isArray(response.data)) {
    return [];
  }

  // 데이터 배열을 순회하며, 유효한 slug 값만 추출합니다.
  return response.data
    .filter(item => item && item.attributes && typeof item.attributes.slug === 'string')
    .map(item => ({ slug: item.attributes.slug }));
}
