'use client';

import { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'pages' | 'realtime'>('overview');
  const [visitorDetails, setVisitorDetails] = useState<VisitorDetail[]>([]);
  const [visitorSessions, setVisitorSessions] = useState<VisitorSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIPs, setExpandedIPs] = useState<Set<string>>(new Set());
  
  // 사용자 정의 날짜 범위 상태 (초기값: 오늘)
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0], // 오늘
    endDate: new Date().toISOString().split('T')[0], // 오늘
  });

  const { stats, loading: statsLoading, error, refetch } = useVisitorStats(
    period, 
    period === 'custom' ? customDateRange : undefined
  );

  // 방문자 상세 데이터 가져오기
  const fetchVisitorDetails = async () => {
    setLoading(true);
    try {
      // 공통 API URL 선택 함수 사용 (api.ts의 환경별 로직 적용)
      const apiUrl = getApiUrl();
      // 방문자 상세 데이터 요청

      const response = await fetch(`${apiUrl}/api/visitors?pagination[limit]=1000&sort=visitedAt:desc`);
      
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
        
        // API 응답 구조 디버깅
        // 데이터 구조 확인
        
        const details: VisitorDetail[] = result.data
          .filter((item: any) => item && item.id) // id가 있으면 유효한 데이터
          .map((item: any) => {
            // 매핑 중인 아이템 처리
            return {
              id: item.id,
              ipAddress: item.ipAddress || '알 수 없음', // attributes 제거
              userAgent: item.userAgent || '알 수 없음',
              referrer: item.referrer || '',
              page: item.page || '/',
              visitedAt: item.visitedAt || new Date().toISOString(),
              sessionId: item.sessionId || `unknown-${item.id}`,
              country: item.country || '',
              city: item.city || '',
            };
          });
          
        // 데이터 필터링 완료
        
        setVisitorDetails(details);
        // 방문자 상세 데이터 처리 완료
        
        // 세션별로 그룹화
        const sessionMap = new Map<string, VisitorSession>();
        // 세션별 그룹화 시작
        
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
        
        const sessions = Array.from(sessionMap.values()).sort((a, b) => 
          new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
        );
        
        // 세션별 그룹화 완료
        
        setVisitorSessions(sessions);
      }
    } catch (error) {
      console.error('❌ 방문자 상세 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitorDetails();
  }, []);

  // 실시간 탭이 활성화될 때마다 데이터 새로고침
  useEffect(() => {
    if (activeTab === 'realtime') {
      // 실시간 탭 활성화 - 데이터 새로고침
      fetchVisitorDetails();
    }
  }, [activeTab]);

  // IP별 아코디언 토글 함수
  const toggleIPExpansion = (ipAddress: string) => {
    const newExpandedIPs = new Set(expandedIPs);
    if (newExpandedIPs.has(ipAddress)) {
      newExpandedIPs.delete(ipAddress);
    } else {
      newExpandedIPs.add(ipAddress);
    }
    setExpandedIPs(newExpandedIPs);
  };

  // IP별로 방문자 데이터 그룹화
  const groupVisitorsByIP = (visitors: VisitorDetail[]) => {
    const grouped = new Map<string, VisitorDetail[]>();
    visitors.forEach(visitor => {
      const ip = visitor.ipAddress;
      if (!grouped.has(ip)) {
        grouped.set(ip, []);
      }
      grouped.get(ip)!.push(visitor);
    });
    
    // IP별로 정렬하고 각 IP 내에서는 최신순으로 정렬
    return Array.from(grouped.entries())
      .map(([ip, visits]) => ({
        ip,
        visits: visits.sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()),
        latestVisit: visits.reduce((latest, visit) => 
          new Date(visit.visitedAt) > new Date(latest.visitedAt) ? visit : latest
        )
      }))
      .sort((a, b) => new Date(b.latestVisit.visitedAt).getTime() - new Date(a.latestVisit.visitedAt).getTime());
  };

  // 기간 버튼 클릭 시 날짜 범위 자동 설정
  const handlePeriodChange = (newPeriod: '1d' | '7d' | '30d') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    let startDate: string;
    
    switch (newPeriod) {
      case '1d':
        startDate = todayStr; // 오늘
        break;
      case '7d':
        startDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7일 전 (오늘 포함)
        break;
      case '30d':
        startDate = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30일 전 (오늘 포함)
        break;
      default:
        startDate = todayStr;
    }
    
    setPeriod(newPeriod);
    setCustomDateRange({
      startDate,
      endDate: todayStr
    });
  };

  // 사용자 정의 날짜 범위 적용
  const handleCustomDateApply = () => {
    setPeriod('custom');
    refetch();
    fetchVisitorDetails();
  };

  // 브라우저 정보 파싱
  const parseBrowser = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  // OS 정보 파싱
  const parseOS = (userAgent: string) => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Other';
  };

  // 브라우저별 통계
  const browserStats = visitorDetails.reduce((acc, visitor) => {
    const browser = parseBrowser(visitor.userAgent);
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // OS별 통계
  const osStats = visitorDetails.reduce((acc, visitor) => {
    const os = parseOS(visitor.userAgent);
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (statsLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="text-red-800 dark:text-red-200">
          <p>데이터를 불러오는 중 오류가 발생했습니다: {error}</p>
          <button 
            onClick={() => {
              refetch();
              fetchVisitorDetails();
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2 items-center">
            {(['1d', '7d', '30d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {p === '1d' ? '1일' : p === '7d' ? '7일' : '30일'}
              </button>
            ))}
            
            {/* 사용자 정의 날짜 입력 (인라인) */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) => {
                  setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }));
                }}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                style={{ width: '140px' }}
              />
              <span className="text-gray-500 dark:text-gray-400">~</span>
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => {
                  setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }));
                }}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                style={{ width: '140px' }}
              />
              <button
                onClick={handleCustomDateApply}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              >
                적용
              </button>
            </div>
          </div>
          
          <button
            onClick={() => {
              refetch();
              fetchVisitorDetails();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            새로고침
          </button>
        </div>

        {/* 현재 선택된 기간 표시 */}
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-200">
          📊 선택된 기간: {customDateRange.startDate} ~ {customDateRange.endDate}
          ({Math.ceil((new Date(customDateRange.endDate).getTime() - new Date(customDateRange.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}일)
          {period !== 'custom' && <span className="ml-2 text-blue-600 dark:text-blue-300">({period === '1d' ? '1일' : period === '7d' ? '7일' : '30일'} 기간)</span>}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: '개요' },
            { key: 'sessions', label: '세션 분석' },
            { key: 'pages', label: '페이지 분석' },
            { key: 'realtime', label: '실시간' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

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
                                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {ip}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {parseBrowser(latestVisit.userAgent)} • {parseOS(latestVisit.userAgent)}
                                      </div>
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
    </div>
  );
}
