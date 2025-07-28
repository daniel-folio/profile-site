import { ProfileResponse } from '@/types/profile';
import { SkillsResponse } from '@/types/skill';
import { ProjectsResponse, ProjectResponse, Project } from '@/types/project';
import { CompanyResponse } from '@/types/company';
import { EducationResponse } from '@/types/education';
import { CareerDetailResponse } from '@/types/career-detail';

// Vercel 환경에서는 환경 변수를, 로컬에서는 null이 됩니다.
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || null;

/**
 * Strapi 미디어 파일의 전체 URL을 반환하는 함수
 */
export function getStrapiMedia(url: string | null | undefined): string | null {
  // 환경 변수가 없으면 로컬 개발 환경으로 간주하고 기본 URL을 사용합니다.
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL_PRIMARY || 'http://127.0.0.1:1337';

  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${baseUrl}${url}`;
}

/**
 * API 호출을 위한 중앙 집중식 헬퍼 함수 (Failover 로직 통합)
 */
async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Vercel 환경에서는 _PRIMARY를, 로컬에서는 기본 URL을 사용합니다.
  const primaryApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL_PRIMARY || 'http://127.0.0.1:1337';
  const secondaryApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL_SECONDARY;
  // FAILOVER_MODE_ENABLED 변수가 'true'일 때만 failover 기능을 활성화합니다.
  const failoverEnabled = process.env.FAILOVER_MODE_ENABLED === 'true';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // API 토큰이 있을 경우에만 (Vercel 환경) 인증 헤더를 추가합니다.
  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  const defaultOptions: RequestInit = {
    next: { revalidate: 60 },
    headers,
    ...options,
  };

  // 실제 요청을 수행하는 내부 함수
  const tryFetch = async (apiUrl: string | undefined) => {
    if (!apiUrl) {
      throw new Error("API URL is not defined. This should not happen with the default value set.");
    }
    const requestUrl = `${apiUrl}/api${path}`;
    const response = await fetch(requestUrl, defaultOptions);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', errorBody);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  };

  // --- 로직 실행 ---

  // Failover 기능이 비활성화된 경우 (B 사이트, A 사이트의 dev, 로컬 환경), Primary URL만 사용합니다.
  if (!failoverEnabled) {
    return tryFetch(primaryApiUrl);
  }

  // Failover 기능이 활성화된 경우 (A 사이트의 Production 환경)
  try {
    return await tryFetch(primaryApiUrl);
  } catch (error) {
    console.error("PRIMARY backend fetch failed:", error instanceof Error ? error.message : String(error));
    
    try {
        return await tryFetch(secondaryApiUrl);
    } catch (secondaryError) {
        console.error("SECONDARY backend fetch also failed:", secondaryError instanceof Error ? secondaryError.message : String(secondaryError));
        throw new Error("Both primary and secondary backends failed.");
    }
  }
}

// --- 기존 API 함수들은 수정할 필요가 없습니다. ---

export async function getProfile(params?: any, options?: RequestInit): Promise<ProfileResponse | null> {
  try {
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