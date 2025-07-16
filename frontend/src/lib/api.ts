import { ProfileResponse } from '@/types/profile';
import { SkillsResponse } from '@/types/skill';
import { ProjectsResponse, ProjectResponse, Project } from '@/types/project';
import { CompanyResponse } from '@/types/company';
import { EducationResponse } from '@/types/education';
import { CareerDetailResponse } from '@/types/career-detail';

// Vercel에 설정된 환경 변수 값을 가져옵니다.
let STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';

// 사용자가 실수로 URL 끝에 '/'나 '/api'를 붙이는 경우를 대비해,
// 코드가 알아서 불필요한 부분을 제거하도록 보강합니다.
if (STRAPI_URL.endsWith('/')) {
  STRAPI_URL = STRAPI_URL.slice(0, -1);
}
if (STRAPI_URL.endsWith('/api')) {
  STRAPI_URL = STRAPI_URL.slice(0, -4);
}

// Vercel에 등록한 API 토큰을 가져옵니다.
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

console.log('ENV:', process.env.NEXT_PUBLIC_STRAPI_API_URL);
console.log('STRAPI_URL:', STRAPI_URL);

/**
 * Strapi 미디어 파일의 전체 URL을 반환하는 함수
 */
export function getStrapiMedia(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}


/**
 * API 호출을 위한 중앙 집중식 헬퍼 함수
 */
async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  
  const defaultOptions: RequestInit = {
    // ⭐️ 해결책: cache: 'no-store' 옵션을 제거하고,
    //    Next.js의 기본 캐싱 동작(정적 생성)을 따르도록 합니다.
    //    revalidate 옵션을 통해 주기적으로 데이터를 업데이트할 수 있습니다.
    next: { revalidate: 60 }, // 60초마다 데이터를 새로 가져오도록 설정
    headers: {
      'Content-Type': 'application/json',
      // API 토큰이 있을 경우에만 인증 헤더를 추가합니다.
      ...(STRAPI_API_TOKEN && { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` }),
    },
    ...options,
  };

  try {
    const requestUrl = `${STRAPI_URL}/api${path}`;
    console.log('Requesting:', requestUrl);
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

export async function getProfile(params?: any, options?: RequestInit): Promise<ProfileResponse | null> {
  try {
    // ⭐️ 해결책: 'populate=deep' 대신 가장 안정적인 'populate=*'를 사용합니다.
    return await fetchAPI<ProfileResponse>(`/profile?populate=*`, options);
  } catch (e) {
    return null;
  }
}

export async function getSkills(options?: RequestInit): Promise<SkillsResponse> {
  return fetchAPI<SkillsResponse>('/skills?populate=*&sort=order:asc', options);
}

export async function getProjects(featured?: boolean, options?: RequestInit): Promise<ProjectsResponse> {
  const filters = featured ? '&filters[featured][$eq]=true' : '';
  return fetchAPI<ProjectsResponse>(`/projects?populate=*&sort=order:asc${filters}`, options);
}

export async function getProjectBySlug(slug: string, options?: RequestInit): Promise<ProjectsResponse> {
  const path = `/projects?filters[slug][$eq]=${slug}&populate=*`;
  return fetchAPI<ProjectsResponse>(path, options);
}

export async function getAllProjectSlugs(options?: RequestInit): Promise<{ data: { attributes: { slug: string } }[] }> {
  const path = `/projects?fields=slug`;
  return fetchAPI<{ data: { attributes: { slug: string } }[] }>(path, options);
}

export async function getCompanies(options?: RequestInit): Promise<CompanyResponse> {
  return fetchAPI<CompanyResponse>('/companies?populate=*&sort=startDate:desc', options);
}

export async function getEducations(options?: RequestInit): Promise<EducationResponse> {
  return fetchAPI<EducationResponse>('/educations?populate=*&sort=order:asc', options);
}

export async function getCareerDetails(options?: RequestInit) {
  try {
    return await fetchAPI('/career-details?populate=*', options);
  } catch (e) {
    return null;
  }
}

export async function getOtherExperiences(options?: RequestInit) {
  return fetchAPI('/other-experiences?pagination[pageSize]=100', options);
}