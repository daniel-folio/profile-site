import { ProfileResponse } from '@/types/profile';
import { SkillsResponse } from '@/types/skill';
import { ProjectsResponse, ProjectResponse, Project } from '@/types/project';
import { CompanyResponse } from '@/types/company';
import { EducationResponse } from '@/types/education';
import { CareerDetailResponse } from '@/types/career-detail';
import qs from 'qs';

// Vercel 환경에서는 환경 변수를, 로컬에서는 null이 됩니다.
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || null;

// URL 유효성 검사 유틸리티
function isValidHttpUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 환경에 따른 API URL 선택 로직 (중앙 집중식)
 * 다른 파일에서 일관된 API URL 사용을 위한 공통 함수
 */
export function getApiUrl(): string {
  // Vercel 런타임 여부 및 환경 종류 감지
  const vercelEnv = process.env.VERCEL_ENV; // 'production' | 'preview' | 'development' | undefined
  const isVercel = process.env.VERCEL === '1';

  const PRIMARY = process.env.NEXT_PUBLIC_STRAPI_API_URL_PRIMARY; // 운영/공용 기본 백엔드 URL
  const PREVIEW = process.env.NEXT_PUBLIC_STRAPI_URL;             // Vercel preview/dev 전용 URL
  const SECONDARY = process.env.NEXT_PUBLIC_STRAPI_API_URL_SECONDARY; // 보조 백엔드 URL

  // 1) Production (Vercel)
  if (vercelEnv === 'production') {
    if (PRIMARY) return PRIMARY;
    // Fail-fast: 프로덕션에서 PRIMARY 미설정은 치명적 구성 오류
    throw new Error('Production requires NEXT_PUBLIC_STRAPI_API_URL_PRIMARY.');
  }

  // 2) Preview/Development on Vercel
  if (isVercel) {
    if (PREVIEW) return PREVIEW;
    if (PRIMARY) return PRIMARY;
    if (SECONDARY) return SECONDARY;
    return 'http://127.0.0.1:1337';
  }

  // 3) Local development
  return PREVIEW || PRIMARY || 'http://127.0.0.1:1337';
}

/**
 * Strapi 미디어 파일의 전체 URL을 반환하는 함수
 */
export function getStrapiMedia(url: string | null | undefined): string | null {
  const baseUrl = getApiUrl();

  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${baseUrl}${url}`;
}

/**
 * API 호출을 위한 중앙 집중식 헬퍼 함수 (Failover 로직 통합)
 */
async function fetchAPI<T>(path: string, params?: any, options: RequestInit = {}): Promise<T> {
  
  // 공통 API URL 선택 함수 사용
  const primaryApiUrl = getApiUrl();
  const isProduction = process.env.VERCEL_ENV === 'production';

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

  // 실제 요청을 수행하는 내부 함수 (타임아웃 및 URL 유효성 포함)
  const tryFetch = async (apiUrl: string | undefined, timeoutMs = 8000) => {
    if (!isValidHttpUrl(apiUrl || '')) {
      throw new Error('Invalid API URL.');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // 쿼리 파라미터 생성
      const queryString = params ? `?${qs.stringify(params)}` : '';
      const requestUrl = `${apiUrl}/api${path}${queryString}`;

      const response = await fetch(requestUrl, { ...defaultOptions, signal: controller.signal });

      if (!response.ok) {
        // 본문은 디버깅 시 별도로 확인 가능. 로그는 간결하게 유지.
        throw new Error(`API ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (err: any) {
      // AbortError 또는 네트워크 에러를 간결히 래핑
      if (err?.name === 'AbortError') {
        throw new Error('API request timeout');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
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
    // PRIMARY backend fetch 실패 → 조건부로 SECONDARY 시도
    if (!isValidHttpUrl(secondaryApiUrl || '')) {
      // SECONDARY 미설정/무효: 즉시 에러 전파
      throw error;
    }
    try {
        return await tryFetch(secondaryApiUrl);
    } catch (secondaryError) {
        // SECONDARY backend fetch도 실패
        throw new Error('Both primary and secondary backends failed.');
    }
  }
}

// --- 기존 API 함수들은 수정할 필요가 없습니다. ---

export async function getProfile(params?: any, options?: RequestInit): Promise<ProfileResponse | null> {
  try {
    return await fetchAPI<ProfileResponse>(
      '/profile',
      { populate: '*' },
      options
    );
  } catch (e) {
    return null;
  }
}

export async function getSkills(params?: any, options?: RequestInit): Promise<SkillsResponse> {
  const defaultParams = { populate: '*', sort: 'order:asc', 'pagination[pageSize]': 1000 };
  const response = await fetchAPI<SkillsResponse>(
    '/skills',
    { ...defaultParams, ...params },
    options
  );
  return response;
}

export async function getProjects(featured?: boolean, params?: any, options?: RequestInit): Promise<ProjectsResponse> {
  const defaultParams: any = { populate: '*', 'pagination[pageSize]': 1000 };
  
  if (featured) {
    // 대표 프로젝트는 featuredOrder 기준으로 오름차순 정렬
    defaultParams['filters[featured][$eq]'] = true;
    defaultParams['sort'] = 'featuredOrder:asc';
  } else {
    // 그 외 모든 프로젝트는 기존 order 기준으로 오름차순 정렬
    defaultParams['sort'] = 'order:asc';
  }
  return fetchAPI<ProjectsResponse>(
    '/projects',
    { ...defaultParams, ...params },
    options
  );
}

export async function getProjectBySlug(slug: string, options?: RequestInit): Promise<ProjectsResponse> {
  return fetchAPI<ProjectsResponse>(
    '/projects',
    { filters: { slug: { $eq: slug } }, populate: '*' },
    options
  );
}

export async function getAllProjectSlugs(options?: RequestInit): Promise<{ data: { attributes: { slug: string } }[] }> {
  return fetchAPI<{ data: { attributes: { slug: string } }[] }>(
    '/projects',
    { fields: ['slug'] },
    options
  );
}

export async function getCompanies(params?: any, options?: RequestInit): Promise<CompanyResponse> {
  const defaultParams = { populate: '*', sort: 'startDate:desc', 'pagination[pageSize]': 1000 };
  return fetchAPI<CompanyResponse>(
    '/companies',
    { ...defaultParams, ...params },
    options
  );
}

export async function getEducations(params?: any, options?: RequestInit): Promise<EducationResponse> {
  const defaultParams = { populate: '*', sort: 'order:asc', 'pagination[pageSize]': 1000 };
  return fetchAPI<EducationResponse>(
    '/educations',
    { ...defaultParams, ...params },
    options
  );
}

export async function getCareerDetails(params?: any, options?: RequestInit) {
  try {
    const defaultParams = { populate: '*', 'pagination[pageSize]': 1000 };
    return await fetchAPI(
      '/career-details',
      { ...defaultParams, ...params },
      options
    );
  } catch (e) {
    return null;
  }
}

export async function getOtherExperiences(params?: any, options?: RequestInit) {
  const defaultParams = { 'pagination[pageSize]': 1000 };
  return fetchAPI(
    '/other-experiences',
    { ...defaultParams, ...params },
    options
  );
}