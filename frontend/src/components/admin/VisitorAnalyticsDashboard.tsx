'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { osm } from 'pigeon-maps/providers';
import { useVisitorStats } from '@/hooks/useVisitorTracking';
import { VisitorStats } from './VisitorStats';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getApiUrl } from '@/lib/api';

interface VisitorDetail {
  id: number;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  page: string;
  visitedAt: string;
  sessionId: string;
  country?: string;
  city?: string;
  region?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  ownerNote?: string | null;
  ownerTag?: string | null;
}

interface VisitorSession {
  sessionId: string;
  ipAddress: string;
  visits: VisitorDetail[];
  firstVisit: string;
  lastVisit: string;
  pageCount: number;
  userAgent: string;
  country?: string;
  city?: string;
}

// 개선된 방문자 분석 대시보드
export function VisitorAnalyticsDashboard() {
  const [period, setPeriod] = useState<'1d' | '7d' | '30d' | 'custom'>('1d');
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'pages' | 'realtime' | 'map'>('overview');
  const [segment, setSegment] = useState<'general' | 'owner' | 'all'>('all');
  // deprecated: local stats state removed; use useVisitorStats().stats
  const [visitorDetails, setVisitorDetails] = useState<VisitorDetail[]>([]);
  const [visitorSessions, setVisitorSessions] = useState<VisitorSession[]>([]);
  const [geoPoints, setGeoPoints] = useState<Array<{ lat: number; lng: number; count: number; country?: string; city?: string; region?: string; countryCode?: string; timezone?: string; isp?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIPs
    , setExpandedIPs] = useState<Set<string>>(new Set());
  const [geoLoading, setGeoLoading] = useState(false);

  // react 19 호환 지도 컴포넌트 (SSR 비활성화)
  // 주의: 전역 Map 객체와 이름 충돌을 피하기 위해 별칭 사용
  const PigeonMap: any = dynamic(() => import('pigeon-maps').then(m => m.Map as any), { ssr: false } as any);
  const PigeonMarker: any = dynamic(() => import('pigeon-maps').then(m => m.Marker as any), { ssr: false } as any);
  
  // 사용자 정의 날짜 범위 상태 (초기값: 오늘)
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0], // 오늘
    endDate: new Date().toISOString().split('T')[0], // 오늘
  });

  const { stats, loading: statsLoading, error, refetch: refetchStats } = useVisitorStats(
    period,
    period === 'custom' ? customDateRange : undefined,
    segment,
    activeTab !== 'realtime'
  );

  // 실시간 폴링 타이머
  const realtimeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 기간 빠른 변경 헬퍼
  const handlePeriodChange = (p: '1d' | '7d' | '30d') => {
    // 기간 변경 시 시작일/종료일도 함께 변경
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 오늘 00:00 기준
    const days = p === '1d' ? 1 : p === '7d' ? 7 : 30;
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));
    const toStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    setCustomDateRange({ startDate: toStr(start), endDate: toStr(end) });
    setPeriod(p);
  };

  // 실시간 탭: 진입 시 즉시 로드 + 10초 폴링, 이탈/언마운트 시 정리
  useEffect(() => {
    if (activeTab === 'realtime') {
      // 최초 즉시 로드
      fetchVisitorDetails({ mode: 'realtime' });
      // 10초마다 갱신
      realtimeTimerRef.current = setInterval(() => {
        fetchVisitorDetails({ mode: 'realtime' });
      }, 10000);
    } else {
      // 다른 탭으로 이동 시 타이머 정리
      if (realtimeTimerRef.current) {
        clearInterval(realtimeTimerRef.current);
        realtimeTimerRef.current = null;
      }
      // 실시간 외 탭은 기존 기간 기반 데이터 로드(필요 시)
      // 세션/페이지 탭에서 상세가 필요하면 일반 모드로 로드
      if (activeTab === 'sessions' || activeTab === 'pages') {
        fetchVisitorDetails({ mode: 'default' });
      }
    }
    return () => {
      if (realtimeTimerRef.current) {
        clearInterval(realtimeTimerRef.current);
        realtimeTimerRef.current = null;
      }
    };
  }, [activeTab, segment, period, customDateRange.startDate, customDateRange.endDate]);
  const applyCustomRange = () => {
    setPeriod('custom');
  };

  // 브라우저/OS 파서(간단 버전)
  const parseBrowser = (ua?: string) => {
    if (!ua) return 'Unknown';
    if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'Chrome';
    if (/Edg\//i.test(ua)) return 'Edge';
    if (/Firefox\//i.test(ua)) return 'Firefox';
    if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'Safari';
    return 'Unknown';
  };

  const parseOS = (ua?: string) => {
    if (!ua) return 'Unknown';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac OS X/i.test(ua)) return 'macOS';
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Unknown';
  };

  // 실시간 탭: IP별 그룹핑
  const groupVisitorsByIP = (
    details: VisitorDetail[]
  ): { ip: string; visits: VisitorDetail[]; latestVisit: VisitorDetail }[] => {
    const map = new Map<string, VisitorDetail[]>();
    for (const v of details) {
      const key = v.ipAddress || 'Unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    const result: { ip: string; visits: VisitorDetail[]; latestVisit: VisitorDetail }[] = [];
    for (const [ip, visits] of map.entries()) {
      visits.sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime());
      result.push({ ip, visits, latestVisit: visits[0] });
    }
    return result;
  };

  // 아코디언 토글
  const toggleIPExpansion = (ip: string) => {
    setExpandedIPs(prev => {
      const next = new Set(prev);
      if (next.has(ip)) next.delete(ip); else next.add(ip);
      return next;
    });
  };

  // 지도용 지오 포인트 조회
  const fetchGeo = useCallback(async () => {
    if (geoFetchingRef.current) return;
    geoFetchingRef.current = true;
    const controller = new AbortController();
    try {
      setGeoLoading(true);
      const apiUrl = getApiUrl();
      const params = new URLSearchParams();
      params.set('segment', segment);
      params.set('period', period);
      if (period === 'custom' && customDateRange.startDate && customDateRange.endDate) {
        params.set('startDate', customDateRange.startDate);
        params.set('endDate', customDateRange.endDate);
      }
      const res = await fetch(`${apiUrl}/api/visitors/geo?${params.toString()}`, { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.points)) {
          setGeoPoints(
            data.points.map((p: any) => ({
              lat: Number(p.lat),
              lng: Number(p.lng),
              count: Number(p.count ?? 1),
              country: p.country,
              city: p.city,
              region: p.region,
              countryCode: p.countryCode,
              timezone: p.timezone,
              isp: p.isp,
            }))
          );
        } else {
          setGeoPoints([]);
        }
      }
    } catch (e) {
      // noop
    } finally {
      geoFetchingRef.current = false;
      setGeoLoading(false);
    }
  }, [segment, period, customDateRange.startDate, customDateRange.endDate]);

  // 지도 탭 진입 또는 필터 변경 시 지오포인트 로드
  useEffect(() => {
    if (activeTab === 'map') {
      fetchGeo();
    }
  }, [activeTab, fetchGeo]);

  // 방문자 상세 데이터 가져오기
  const fetchVisitorDetails = async (opts?: { mode?: 'default' | 'realtime' }) => {
    if (detailsFetchingRef.current) return;
    detailsFetchingRef.current = true;
    const controller = new AbortController();
    setLoading(true);
    try {
      // 공통 API URL 선택 함수 사용 (api.ts의 환경별 로직 적용)
      const apiUrl = getApiUrl();
      // 방문자 상세 데이터 요청

      // 세그먼트 필터는 백엔드 통계/지도 API에서 동적으로 처리. 상세 목록은 날짜 기준만 사용
      const segFilter = '';
      
      // 기간 필터: 실시간 모드와 일반 모드 분리
      const buildDateFilter = (days: number): string => {
        const now = new Date();
        const start = new Date(now);
        start.setTime(now.getTime() - days * 24 * 60 * 60 * 1000);
        return `&filters[visitedAt][$gte]=${encodeURIComponent(start.toISOString())}&filters[visitedAt][$lte]=${encodeURIComponent(now.toISOString())}`;
      };

      let dateFilter = '';
      if (opts?.mode === 'realtime') {
        // 최근 24시간 고정
        dateFilter = buildDateFilter(1);
      } else {
        // 일반 모드: 기존 period 로직 유지
        const params: string[] = [];
        if (period === 'custom' && customDateRange.startDate && customDateRange.endDate) {
          const startISO = new Date(customDateRange.startDate).toISOString();
          const endISO = new Date(customDateRange.endDate).toISOString();
          params.push(`filters[visitedAt][$gte]=${encodeURIComponent(startISO)}`);
          params.push(`filters[visitedAt][$lte]=${encodeURIComponent(endISO)}`);
        } else if (period === '1d' || period === '7d' || period === '30d') {
          const now = new Date();
          const start = new Date(now);
          const days = period === '1d' ? 1 : period === '7d' ? 7 : 30;
          start.setTime(now.getTime() - days * 24 * 60 * 60 * 1000);
          params.push(`filters[visitedAt][$gte]=${encodeURIComponent(start.toISOString())}`);
          params.push(`filters[visitedAt][$lte]=${encodeURIComponent(now.toISOString())}`);
        }
        dateFilter = params.length ? `&${params.join('&')}` : '';
      }

      const url = `${apiUrl}/api/visitors?pagination[limit]=1000&sort=visitedAt:desc&segment=${encodeURIComponent(segment)}${segFilter}${dateFilter}`;
      if (opts?.mode === 'realtime') {
        console.debug('[realtime] visitors GET', { url, segment });
      }
      const response = await fetch(url , { signal: controller.signal });
      
      if (response.ok) {
        const result = await response.json();
        // 방문자 상세 데이터 결과 처리
        
        // API 응답 구조 검증
        if (!result || !Array.isArray(result.data)) {
          console.warn('예상하지 못한 API 응답 구조:', result);
          setVisitorDetails([]);
          setVisitorSessions([]);
          return;
        }
        
        // 실시간 모드에서 0건이면 7일로 한 번 더 재조회 (fallback)
        if (opts?.mode === 'realtime' && (!result || !Array.isArray(result.data) || result.data.length === 0)) {
          try {
            const fbUrl = `${apiUrl}/api/visitors?pagination[limit]=1000&sort=visitedAt:desc&segment=${encodeURIComponent(segment)}${segFilter}${buildDateFilter(7)}`;
            console.debug('[realtime] visitors fallback GET', { url: fbUrl, segment });
            const fallbackRes = await fetch(fbUrl, { signal: controller.signal });
            if (fallbackRes.ok) {
              const fb = await fallbackRes.json();
              if (fb && Array.isArray(fb.data)) {
                result.data = fb.data;
              }
            }
          } catch {}
        }

        let details: VisitorDetail[] = result.data
          .filter((item: any) => item && item.id)
          .map((item: any) => {
            const a = item.attributes ? item.attributes : item;
            return {
              id: item.id,
              ipAddress: a.ipAddress || a.ipaddress || '알 수 없음',
              userAgent: a.userAgent || a.useragent || '알 수 없음',
              referrer: a.referrer || '',
              page: a.page || '/',
              visitedAt: a.visitedAt || new Date().toISOString(),
              sessionId: a.sessionId || `unknown-${item.id}`,
              country: a.country,
              city: a.city,
              region: a.region,
              countryCode: a.countryCode,
              latitude: a.latitude,
              longitude: a.longitude,
              timezone: (a as any).timezone,
              isp: (a as any).isp,
              ownerNote: (a as any).ownerNote ?? null,
              ownerTag: (a as any).ownerTag ?? null,
            } as VisitorDetail;
          });

        // 세그먼트 필터링은 백엔드 결과를 신뢰 (ownerIpAllowlist 기준)

        // 상태 반영
        console.debug('[realtime] mapped details', { segment, count: details.length, sample: details.slice(0,3).map(d=>d.ipAddress) });
        setVisitorDetails(details);

        // 세션별로 그룹화
        const sessionMap = new Map<string, VisitorSession>();
        
        details.forEach(visit => {
          // 필수 필드 검증
          if (!visit.sessionId || !visit.ipAddress || !visit.visitedAt) {
            console.warn('유효하지 않은 방문 데이터 건너뜀:', visit);
            return;
          }

          if (!sessionMap.has(visit.sessionId)) {
            sessionMap.set(visit.sessionId, {
              sessionId: visit.sessionId,
              ipAddress: visit.ipAddress,
              visits: [],
              firstVisit: visit.visitedAt,
              lastVisit: visit.visitedAt,
              pageCount: 0,
              userAgent: visit.userAgent || '알 수 없음',
              country: visit.country || '',
              city: visit.city || '',
            });
          }
          
          const session = sessionMap.get(visit.sessionId);
          if (!session) {
            console.warn('세션을 찾을 수 없음:', visit.sessionId);
            return;
          }

          session.visits.push(visit);
          session.pageCount = session.visits.length;
          
          // 첫 방문과 마지막 방문 시간 업데이트
          try {
            if (new Date(visit.visitedAt) < new Date(session.firstVisit)) {
              session.firstVisit = visit.visitedAt;
            }
            if (new Date(visit.visitedAt) > new Date(session.lastVisit)) {
              session.lastVisit = visit.visitedAt;
            }
          } catch (dateError) {
            console.warn('날짜 파싱 오류:', visit.visitedAt, dateError);
          }
        });
        
        const sessions = Array.from(sessionMap.values()).sort((a: VisitorSession, b: VisitorSession) => 
          new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
        );
        
        // 세션별 그룹화 완료
        
        setVisitorSessions(sessions);
      }
    } catch (error) {
      console.error('방문자 상세 조회 실패:', error);
    } finally {
      setLoading(false);
      detailsFetchingRef.current = false;
    }
  };

  // 요청 중복 방지용 ref 및 디바운스 타이머
  const requestKeyRef = useRef<string>('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailsFetchingRef = useRef<boolean>(false);
  const geoFetchingRef = useRef<boolean>(false);

  // 탭/세그먼트/기간 변경 시 단일 갱신 + 디바운스 + 딱 1회 호출
  useEffect(() => {
    const key = `${activeTab}|${segment}|${period}|${customDateRange.startDate}|${customDateRange.endDate}`;
    if (requestKeyRef.current === key) return;
    requestKeyRef.current = key;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (activeTab === 'map') {
        fetchGeo();
        fetchVisitorDetails(); // 지도 탭의 "장소별 분석" 카드가 visitorDetails를 사용
      } else if (activeTab === 'realtime') {
        fetchVisitorDetails({ mode: 'realtime' });
      }
      // 나머지 탭(overview/sessions/pages)은 useVisitorStats 훅 데이터로 충분
    }, 150);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [activeTab, segment, period, customDateRange.startDate, customDateRange.endDate]);
  return (
  <>
  {/* 상단 메인 탭은 일자검색/배너 아래로 이동됨 */}

  {/* 필터 바: 기간 선택만 유지 */}
  <div className="mt-4 mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={() => handlePeriodChange('1d')} className={`px-3 py-1.5 rounded border text-sm ${period==='1d' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}>1일</button>
      <button onClick={() => handlePeriodChange('7d')} className={`px-3 py-1.5 rounded border text-sm ${period==='7d' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}>7일</button>
      <button onClick={() => handlePeriodChange('30d')} className={`px-3 py-1.5 rounded border text-sm ${period==='30d' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}>30일</button>
      <div className="flex items-center gap-1 text-sm">
        <input type="date" value={customDateRange.startDate} onChange={(e)=>setCustomDateRange(v=>({...v,startDate:e.target.value}))} className="px-2 py-1 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" />
        <span className="text-gray-500">~</span>
        <input type="date" value={customDateRange.endDate} onChange={(e)=>setCustomDateRange(v=>({...v,endDate:e.target.value}))} className="px-2 py-1 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" />
        <button onClick={applyCustomRange} className="ml-2 px-3 py-1.5 rounded bg-blue-600 text-white">적용</button>
      </div>
    </div>
  </div>

  {/* 선택한 기간 표시 배너 */}
  {(() => {
    const start = customDateRange.startDate ? new Date(customDateRange.startDate) : null;
    const end = customDateRange.endDate ? new Date(customDateRange.endDate) : null;
    const diffDays = (s: Date, e: Date) => Math.floor((Date.UTC(e.getFullYear(), e.getMonth(), e.getDate()) - Date.UTC(s.getFullYear(), s.getMonth(), s.getDate())) / (1000*60*60*24)) + 1;
    return (
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm">
          <span className="inline-flex items-center">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18"/><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="8" width="18" height="13" rx="2" ry="2"/></svg>
            선택한 기간 :
          </span>
          {start && end ? (
            <>
              <span className="font-medium">{`${format(start, 'yyyy-MM-dd')} ~ ${format(end, 'yyyy-MM-dd')}`}</span>
              <span className="text-xs text-blue-500">({diffDays(start, end)}일)</span>
            </>
          ) : (
            <span className="font-medium">기간을 선택하세요</span>
          )}
        </div>
      </div>
    );
  })()}

  {/* 메인 탭: 개요/세션/페이지/실시간/지도 (기간 배너 아래) */}
  <div className="border-b border-gray-200 dark:border-gray-700">
    <nav className="-mb-px flex space-x-8 overflow-x-auto">
      {[
        { key: 'overview', label: '개요' },
        { key: 'sessions', label: '세션 분석' },
        { key: 'pages', label: '페이지 분석' },
        { key: 'realtime', label: '실시간' },
        { key: 'map', label: '지도' },
      ].map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key as any)}
          className={`py-2 px-2 border-b-2 font-medium transition text-sm sm:text-base ${
            activeTab === tab.key
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <span className="whitespace-nowrap break-keep tracking-tight">{tab.label}</span>
        </button>
      ))}
    </nav>
  </div>

  {/* 세그먼트 탭: 모든 메인 탭에서 공통 노출 (개요 전용에서 전역으로 변경) */}
  <div className="mb-4 mt-4 overflow-x-auto">
    <nav className="flex gap-6 border-b border-gray-200 dark:border-gray-700 min-w-[320px]">
      {[
        { key: 'all', label: '전체' },
        { key: 'general', label: '일반' },
        { key: 'owner', label: 'OWNER' },
      ].map((seg) => (
        <button
          key={seg.key}
          onClick={() => setSegment(seg.key as any)}
          className={`relative -mb-px py-2 px-1 text-sm sm:text-base whitespace-nowrap transition-colors ${
            segment === seg.key
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <span className="px-1 whitespace-nowrap break-keep tracking-tight">{seg.label}</span>
          <span className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full transition-all ${segment === seg.key ? 'bg-blue-600 dark:bg-blue-400' : 'bg-transparent'}`}/>
        </button>
      ))}
    </nav>
  </div>

  {/* 장소별 분석 + 지도 - 지도 탭에서만 표시 */}
  {activeTab === 'map' && (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">장소별 분석</h3>
        {(() => {
          const countryCount: Record<string, number> = {};
          const cityCount: Record<string, number> = {};
          const timezoneCount: Record<string, number> = {};
          const ispCount: Record<string, number> = {};
          visitorDetails.forEach(v => {
            const country = v.country || 'Unknown';
            const city = v.city || 'Unknown';
            const tz = (v as any).timezone || 'Unknown';
            const isp = (v as any).isp || 'Unknown';
            countryCount[country] = (countryCount[country] || 0) + 1;
            cityCount[city] = (cityCount[city] || 0) + 1;
            timezoneCount[tz] = (timezoneCount[tz] || 0) + 1;
            ispCount[isp] = (ispCount[isp] || 0) + 1;
          });
          const top = (obj: Record<string, number>, n=5) => Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,n);
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded border dark:border-gray-700">
                <div className="font-medium mb-2">국가 Top5</div>
                <ul className="space-y-1 text-sm">
                  {top(countryCount).map(([k,v])=> (<li key={k} className="flex justify-between"><span>{k}</span><span className="text-gray-500">{v}</span></li>))}
                </ul>
              </div>
              <div className="p-4 rounded border dark:border-gray-700">
                <div className="font-medium mb-2">도시 Top5</div>
                <ul className="space-y-1 text-sm">
                  {top(cityCount).map(([k,v])=> (<li key={k} className="flex justify-between"><span>{k}</span><span className="text-gray-500">{v}</span></li>))}
                </ul>
              </div>
              <div className="p-4 rounded border dark:border-gray-700">
                <div className="font-medium mb-2">타임존 Top5</div>
                <ul className="space-y-1 text-sm">
                  {top(timezoneCount).map(([k,v])=> (<li key={k} className="flex justify-between"><span>{k}</span><span className="text-gray-500">{v}</span></li>))}
                </ul>
              </div>
              <div className="p-4 rounded border dark:border-gray-700">
                <div className="font-medium mb-2">ISP Top5</div>
                <ul className="space-y-1 text-sm">
                  {top(ispCount).map(([k,v])=> (<li key={k} className="flex justify-between"><span>{k}</span><span className="text-gray-500">{v}</span></li>))}
                </ul>
              </div>
            </div>
          );
        })()}

        <h3 className="text-lg font-semibold">지도</h3>
        {/* 지도 영역 */}
        <div className="w-full h-[420px] rounded overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {geoLoading ? (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">지도 데이터를 불러오는 중…</div>
          ) : geoPoints.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">표시할 위치 데이터가 없습니다</div>
          ) : (
            <PigeonMap
              provider={osm}
              defaultCenter={[
                Number.isFinite(geoPoints[0]?.lat) ? geoPoints[0].lat : 36.5,
                Number.isFinite(geoPoints[0]?.lng) ? geoPoints[0].lng : 127.8,
              ]}
              defaultZoom={4}
            >
              {geoPoints.map((p, idx) => (
                <PigeonMarker key={`${p.lat},${p.lng}-${idx}`} anchor={[p.lat, p.lng]} width={32} />
              ))}
            </PigeonMap>
          )}
        </div>
      </div>
      )}

      {/* 개요 탭 */}
      {activeTab === 'overview' && (
        <>
          {!stats || (stats.totalVisitors === 0 && stats.uniqueVisitors === 0) ? (
            // 빈 데이터 상태 UI
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                방문자 데이터가 없습니다
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                선택한 기간 ({customDateRange.startDate} ~ {customDateRange.endDate})에 방문자가 없습니다.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handlePeriodChange('7d')}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  7일 기간으로 보기
                </button>
                <button
                  onClick={() => handlePeriodChange('30d')}
                  className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  30일 기간으로 보기
                </button>
              </div>
            </div>
          ) : stats && (
        <div className="space-y-6">
          {/* 주요 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">총 방문수</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.totalVisitors}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">고유 방문자</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.uniqueVisitors}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">활성 세션</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats.totalSessions || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">평균 페이지뷰</h3>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                {stats.avgPageViews || 0}
              </p>
            </div>
          </div>

          {/* 브라우저 & OS 통계 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">브라우저별 방문</h3>
              <div className="space-y-3">
                {(stats.browserStats || []).map((browserStat) => (
                  <div key={browserStat.browser} className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">{browserStat.browser}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${browserStat.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-8 text-right">{browserStat.visits}</span>
                    </div>
                  </div>
                ))}
                {(!stats.browserStats || stats.browserStats.length === 0) && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">데이터가 없습니다</p>
                )}
                
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">운영체제별 방문</h3>
              <div className="space-y-3">
                {(stats.osStats || []).map((osStat) => (
                  <div key={osStat.os} className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">{osStat.os}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${osStat.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-8 text-right">{osStat.visits}</span>
                    </div>
                  </div>
                ))}
                {(!stats.osStats || stats.osStats.length === 0) && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">데이터가 없습니다</p>
                )}
              </div>
            </div>
          </div>

          {/* 페이지별 통계 */}
          {stats.pageStats && stats.pageStats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">인기 페이지</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 text-gray-700 dark:text-gray-300 font-medium">페이지</th>
                      <th className="text-right py-3 text-gray-700 dark:text-gray-300 font-medium">방문수</th>
                      <th className="text-right py-3 text-gray-700 dark:text-gray-300 font-medium">고유 방문자</th>
                      <th className="text-right py-3 text-gray-700 dark:text-gray-300 font-medium">비율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.pageStats.slice(0, 10).map((page, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 text-gray-900 dark:text-gray-100 font-mono text-xs">
                          {page.page.length > 40 ? `${page.page.substring(0, 40)}...` : page.page}
                        </td>
                        <td className="py-3 text-right text-gray-700 dark:text-gray-300">{page.visits}</td>
                        <td className="py-3 text-right text-gray-700 dark:text-gray-300">{page.unique_visitors}</td>
                        <td className="py-3 text-right text-gray-500 dark:text-gray-400">
                          {((page.visits / stats.totalVisitors) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        )}
        </>
      )}

      {/* 세션 분석 탭 */}
      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">사용자 세션 분석</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              각 사용자의 방문 경로와 행동 패턴을 분석합니다
            </p>
          </div>
          <div className="p-6">
            {(!stats?.sessionStats || stats.sessionStats.length === 0) ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">세션 데이터가 없습니다</p>
            ) : (
              <div className="space-y-4">
                {stats.sessionStats.slice(0, 20).map((session) => (
                <div key={session.sessionId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {session.ipAddress}
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                          세션 ID: {session.sessionId.substring(0, 8)}...
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {session.userAgent ? parseBrowser(session.userAgent) : 'Unknown'} • {session.userAgent ? parseOS(session.userAgent) : 'Unknown'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {session.pageViews}회 방문 • {session.uniquePages}페이지
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(session.firstVisit).toLocaleString('ko-KR')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        세션 시간: {Math.round(session.duration / 1000 / 60)}분
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">방문 경로:</h4>
                    <div className="flex flex-wrap gap-1">
                      {(session.pages || []).map((page: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded font-mono">
                            {page.length > 20 ? `${page.substring(0, 20)}...` : page}
                          </span>
                          {index < (session.pages || []).length - 1 && (
                            <span className="mx-1 text-gray-400">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 페이지 분석 탭 */}
      {activeTab === 'pages' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">페이지별 상세 분석</h3>
          </div>
          <div className="p-6">
            {!stats || !stats.pageStats || stats.pageStats.length === 0 ? (
              // 빈 데이터 상태 UI
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  페이지 분석 데이터가 없습니다
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  선택한 기간에 페이지 방문 기록이 없습니다.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handlePeriodChange('7d')}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    7일 기간으로 보기
                  </button>
                  <button
                    onClick={() => handlePeriodChange('30d')}
                    className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    30일 기간으로 보기
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.pageStats.map((page, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 font-mono text-sm">
                        {page.page}
                      </h4>
                      <div className="flex gap-4 text-sm">
                        <span className="text-blue-600 dark:text-blue-400">
                          {page.visits} 방문
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          {page.unique_visitors} 고유 방문자
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" 
                        style={{ width: `${(page.visits / stats.totalVisitors) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      전체 방문의 {((page.visits / stats.totalVisitors) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 실시간 탭 */}
      {activeTab === 'realtime' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">최근 방문자</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              최근 24시간 내 방문 기록 (데이터가 없으면 7일 내 기록 표시)
            </p>
          </div>
          <div className="p-6">
            {/* 실시간 상태 정보 */}
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  실시간 모니터링 활성화
                </span>
                <span className="text-xs text-green-600 dark:text-green-400">
                  • 총 {visitorDetails.length}개의 방문 기록
                </span>
              </div>
            </div>
            
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">로딩 중...</span>
              </div>
            )}
            
            {!loading && (
              <div className="space-y-3">
                {visitorDetails.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 dark:text-gray-500 mb-2">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">방문자 데이터가 없습니다</p>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const groupedVisitors = groupVisitorsByIP(visitorDetails);
                      const totalVisits = visitorDetails.length;
                      const uniqueIPs = groupedVisitors.length;
                      
                      return (
                        <>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex justify-between items-center">
                            <span>총 {totalVisits}개의 방문 기록</span>
                            <span>{uniqueIPs}명의 고유 방문자</span>
                          </div>
                          
                          {groupedVisitors.map(({ ip, visits, latestVisit }) => {
                            const isExpanded = expandedIPs.has(ip);
                            const visitCount = visits.length;
                            
                            return (
                              <div key={ip} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                {/* 아코디언 헤더 */}
                                <button
                                  onClick={() => toggleIPExpansion(ip)}
                                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex justify-between items-center"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <div className="text-left">
                                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                        <span>{ip}</span>
                                        {(latestVisit.ownerTag || segment === 'owner') && (
                                          <span className="px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-800 text-[11px] font-semibold border border-yellow-200">
                                            OWNER
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {parseBrowser(latestVisit.userAgent)} • {parseOS(latestVisit.userAgent)}
                                      </div>
                                      {latestVisit.ownerNote && (
                                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">메모: {latestVisit.ownerNote}</div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <div className="text-sm text-gray-700 dark:text-gray-300">
                                        {visitCount}회 방문
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        최근: {new Date(latestVisit.visitedAt).toLocaleString('ko-KR')}
                                      </div>
                                    </div>
                                    
                                    <svg
                                      className={`w-5 h-5 text-gray-400 transition-transform ${
                                        isExpanded ? 'rotate-180' : ''
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </button>
                                
                                {/* 아코디언 내용 */}
                                {isExpanded && (
                                  <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
                                    <div className="p-4 space-y-3">
                                      {visits.map((visit, index) => (
                                        <div key={visit.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded">
                                          <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <div className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                                              {visit.page || '/'}
                                            </div>
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(visit.visitedAt).toLocaleString('ko-KR')}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
  </>
  );
}
