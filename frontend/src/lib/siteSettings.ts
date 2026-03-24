// Strapi에서 사이트 설정을 조회하는 함수들
import { getApiUrl } from './api';

// 공통 API URL 선택 함수 사용 (api.ts의 환경별 로직 적용)
const API_URL = getApiUrl();

export interface SiteSettings {
  enableVisitorTracking: boolean;
  siteName?: string;
  siteDescription?: string;
  siteUsed: boolean;
  maxVisitorsPerDay: number;
  portfolioVersion?: string; // 'v1' | 'v2' — Strapi에서 관리
}

// 공개 설정 조회 (패스워드 제외)
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const response = await fetch(`${API_URL}/api/site-settings/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 항상 최신 설정 조회
    });

    if (!response.ok) {
      // Failed to fetch site settings, using defaults
      return getDefaultSettings();
    }

    const data = await response.json();
    return data.data || getDefaultSettings();
  } catch (error) {
    // Error fetching site settings
    return getDefaultSettings();
  }
}

// 관리자 패스워드 검증
export async function validateAdminPassword(password: string): Promise<boolean> {
  try {
    console.log('🔍 Password validation started');
    console.log('🔍 API_URL:', API_URL);
    console.log('🔍 Input password:', password);

    // Production 환경에서 API URL이 없으면 실패 처리
    if (!API_URL) {
      console.error('❌ API URL이 설정되지 않았습니다. 백엔드를 배포하고 NEXT_PUBLIC_STRAPI_API_URL_PRIMARY를 설정해주세요.');
      return false;
    }

    const response = await fetch(`${API_URL}/api/site-settings/validate-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response ok:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('🔍 Response data:', data);
      return data.success === true;
    }

    const errorText = await response.text();
    console.log('🔍 Error response:', errorText);
    return false;
  } catch (error) {
    console.error('🔍 Error validating admin password:', error);
    return false;
  }
}

// 기본 설정값
function getDefaultSettings(): SiteSettings {
  return {
    enableVisitorTracking: true,
    siteName: 'Developer Portfolio',
    siteDescription: 'Personal portfolio website',
    siteUsed: true,
    maxVisitorsPerDay: 10000,
    portfolioVersion: 'v1',
  };
}

// 설정 캐시 관리
let settingsCache: SiteSettings | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

export async function getCachedSiteSettings(): Promise<SiteSettings> {
  const now = Date.now();

  if (settingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return settingsCache;
  }

  settingsCache = await getSiteSettings();
  cacheTimestamp = now;

  return settingsCache;
}

// 캐시 무효화
export function invalidateSettingsCache() {
  settingsCache = null;
  cacheTimestamp = 0;
}
