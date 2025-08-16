'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { recordVisitor, getSessionId, normalizePage, VisitorStats, getVisitorStats } from '@/lib/visitor';

// 방문자 추적 훅
export function useVisitorTracking() {
  const pathname = usePathname();
  const hasTracked = useRef(new Set<string>());

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return;

    const normalizedPage = normalizePage(pathname);
    
    // 이미 추적한 페이지는 중복 추적하지 않음
    if (hasTracked.current.has(normalizedPage)) return;

    // 방문자 정보 기록
    const trackVisitor = async () => {
      try {
        const sessionId = getSessionId();
        
        await recordVisitor({
          page: normalizedPage,
          sessionId,
        });

        // 추적 완료 표시
        hasTracked.current.add(normalizedPage);
        
        // 방문자 추적 완료
      } catch (error) {
        console.error('방문자 추적 오류:', error);
      }
    };

    // 페이지 로드 후 약간의 지연을 두고 추적 (성능 고려)
    const timeoutId = setTimeout(trackVisitor, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname]);
}

// 방문자 통계 조회 훅
export function useVisitorStats(period: '1d' | '7d' | '30d' | 'custom' = '7d', customDateRange?: { startDate: string; endDate: string }) {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getVisitorStats(period, customDateRange);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '통계 조회 실패');
        console.error('방문자 통계 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period, customDateRange?.startDate, customDateRange?.endDate]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getVisitorStats(period, customDateRange);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '통계 조회 실패');
      console.error('방문자 통계 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch };
}
