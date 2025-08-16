// 방문자 추적 관련 API 함수들
import { getCachedSiteSettings } from './siteSettings';
import { getApiUrl } from './api';

// 공통 API URL 선택 함수 사용 (api.ts의 환경별 로직 적용)
const API_URL = getApiUrl();

// Strapi 설정에서 방문자 추적 활성화 여부 확인
async function isTrackingEnabled(): Promise<boolean> {
  try {
    const settings = await getCachedSiteSettings();
    return settings.enableVisitorTracking;
  } catch (error) {
    console.warn('Failed to get tracking settings, defaulting to enabled');
    return true; // 기본값: 활성화
  }
}

export interface VisitorData {
  page: string;
  sessionId?: string;
  country?: string;
  city?: string;
}

export interface VisitorStats {
  period: string;
  totalVisitors: number;
  uniqueVisitors: number;
  totalSessions: number;
  avgPageViews: number;
  avgSessionDuration: number;
  pageStats: Array<{
    page: string;
    visits: number;
    unique_visitors: number;
  }>;
  dailyStats: Array<{
    date: string;
    visits: number;
    unique_visitors: number;
  }>;
  sessionStats: Array<{
    sessionId: string;
    ipAddress: string;
    pageViews: number;
    uniquePages: number;
    duration: number;
    firstVisit: string;
    lastVisit: string;
    userAgent: string;
    pages: string[];
  }>;
  browserStats: Array<{
    browser: string;
    visits: number;
    unique_visitors: number;
    percentage: number;
  }>;
  osStats: Array<{
    os: string;
    visits: number;
    unique_visitors: number;
    percentage: number;
  }>;
}

// 방문자 정보 기록
export async function recordVisitor(data: VisitorData): Promise<any> {
  // 방문자 추적이 비활성화된 경우 실행하지 않음
  const trackingEnabled = await isTrackingEnabled();
  if (!trackingEnabled) {
    // 방문자 추적이 비활성화되어 있습니다.
    return null;
  }

  try {
    const requestData = {
      data: {
        ...data,
        sessionId: data.sessionId || generateSessionId(),
      },
    };

    // 방문자 추적 요청 전송

    const response = await fetch(`${API_URL}/api/visitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    // 응답 상태 확인

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP 오류 응답:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // 방문자 기록 성공
    return result;
  } catch (error) {
    console.error('❌ 방문자 기록 실패:', error);
    // 방문자 추적 실패가 사이트 사용을 방해하지 않도록 에러를 던지지 않음
    return null;
  }
}

// 방문자 통계 조회
export async function getVisitorStats(
  period: '1d' | '7d' | '30d' | 'custom' = '7d', 
  customDateRange?: { startDate: string; endDate: string }
): Promise<VisitorStats | null> {
  try {
    let url = `${API_URL}/api/visitors/stats`;
    
    if (period === 'custom' && customDateRange) {
      url += `?period=custom&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
    } else {
      url += `?period=${period}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('방문자 통계 조회 실패:', error);
    return null;
  }
}

// 세션 ID 생성
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 로컬 스토리지에서 세션 ID 관리
export function getSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = localStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
}

// 페이지 경로 정규화 (개인정보 제거)
export function normalizePage(pathname: string): string {
  // 동적 라우트 매개변수를 일반화
  return pathname
    .replace(/\/portfolio\/[^\/]+/, '/portfolio/[slug]')
    .replace(/\/career-detail\/[^\/]+/, '/career-detail/[id]')
    .replace(/\?.*$/, '') // 쿼리 파라미터 제거
    .replace(/#.*$/, ''); // 해시 제거
}
