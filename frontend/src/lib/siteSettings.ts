// Strapi에서 사이트 설정을 조회하는 함수들
import { getApiUrl } from './api';

// 주의: getApiUrl()을 모듈 상단 상수로 선언하지 않습니다.
// 상수로 선언하면 빌드 타임에 URL이 고정되어 테스트/운영 서버에서
// 다른 환경 변수가 적용되지 않는 문제가 발생합니다.
// 각 함수 내에서 직접 호출하여 런타임에 올바른 URL을 사용합니다.

export interface SiteSettings {
  enableVisitorTracking: boolean;
  siteName?: string;
  siteDescription?: string;
  siteUsed: boolean;
  maxVisitorsPerDay: number;
  portfolioVersion?: string; // Strapi의 Site Settings에서 관리 (예: 'v1', 'v2', ...)
}

// 공개 설정 조회 (패스워드 제외)
export async function getSiteSettings(): Promise<SiteSettings> {
  // 런타임마다 URL을 동적으로 결정 (테스트/운영 서버 대응)
  const apiUrl = getApiUrl();
  try {
    const url = `${apiUrl}/api/site-settings/public?t=${Date.now()}`;
    console.log('[getSiteSettings] API Request:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 항상 최신 설정 조회
    });

    if (!response.ok) {
      console.error(`[getSiteSettings] API Error: ${response.status}`);
      return getDefaultSettings();
    }

    const data = await response.json();
    console.log('[getSiteSettings] Loaded Version:', data.data?.portfolioVersion);
    return data.data || getDefaultSettings();
  } catch (error) {
    return getDefaultSettings();
  }
}

// 관리자 패스워드 검증
export async function validateAdminPassword(password: string): Promise<boolean> {
  // 런타임마다 URL을 동적으로 결정
  const apiUrl = getApiUrl();
  try {
    if (!apiUrl) {
      console.error('❌ API URL이 설정되지 않았습니다. 백엔드를 배포하고 NEXT_PUBLIC_STRAPI_API_URL_PRIMARY를 설정해주세요.');
      return false;
    }

    const response = await fetch(`${apiUrl}/api/site-settings/validate-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.success === true;
    }

    return false;
  } catch (error) {
    console.error('Error validating admin password:', error);
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
