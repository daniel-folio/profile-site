'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAppLogs, fetchAppLogStats, cleanupOldLogs, AppLogEntry, AppLogStats } from '@/features/admin/api/appLog';

// 레벨 색상 설정
const LEVEL_STYLES: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  fatal: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', border: 'border-red-200 dark:border-red-800' },
  error: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-400', border: 'border-red-100 dark:border-red-900/50' },
  warn: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-400', border: 'border-amber-100 dark:border-amber-900/50' },
};

const LEVEL_BADGE: Record<string, { bg: string; text: string }> = {
  fatal: { bg: 'bg-red-600', text: 'text-white' },
  error: { bg: 'bg-red-500', text: 'text-white' },
  warn: { bg: 'bg-amber-500', text: 'text-white' },
};

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return iso;
  }
}

function timeAgo(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = now - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

/** 스택 트레이스를 보기 좋게 포맷 */
function formatStack(stack: string): string {
  // 인라인 → 줄바꿈 정리
  return stack
    .replace(/\\n/g, '\n')
    .replace(/ {4,}/g, '  ')
    .trim();
}

/** 에러 메시지에서 핵심 내용을 추출하여 읽기 쉽게 표시 */
function formatMessage(message: string): { title: string; detail: string | null } {
  // KnexTimeoutError 등 잘 알려진 패턴 처리
  if (message.includes('KnexTimeoutError')) {
    return { title: '🔴 DB 커넥션 타임아웃', detail: message };
  }
  if (message.includes('ECONNREFUSED')) {
    return { title: '🔴 DB 연결 거부', detail: message };
  }
  if (message.includes('ENOTFOUND')) {
    return { title: '🔴 호스트를 찾을 수 없음', detail: message };
  }

  // 일반 메시지: 첫 줄을 제목으로
  const lines = message.split('\n');
  const title = lines[0].length > 120 ? lines[0].slice(0, 120) + '…' : lines[0];
  const detail = lines.length > 1 ? lines.slice(1).join('\n') : null;
  return { title, detail };
}

export function LogViewer() {
  const [logs, setLogs] = useState<AppLogEntry[]>([]);
  const [stats, setStats] = useState<AppLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // 필터 상태
  const [period, setPeriod] = useState<'1d' | '7d' | '30d' | 'custom'>('1d');
  const [levelFilter, setLevelFilter] = useState<string>(''); // 빈 문자열 = 전체
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 자동 새로고침
  const [autoRefresh, setAutoRefresh] = useState(true);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // 날짜 범위
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // 정리 모달
  const [cleanupDays, setCleanupDays] = useState(30);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);

  // 키워드 디바운스
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  // 기간 변경 시 날짜 자동 설정
  const handlePeriodChange = (p: '1d' | '7d' | '30d') => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = p === '1d' ? 1 : p === '7d' ? 7 : 30;
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));
    const toStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setCustomDateRange({ startDate: toStr(start), endDate: toStr(end) });
    setPeriod(p);
    setPage(1);
  };

  // 로그 데이터 조회
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAppLogs({
        page,
        pageSize,
        level: levelFilter || undefined,
        keyword: debouncedKeyword || undefined,
        startDate: customDateRange.startDate || undefined,
        endDate: customDateRange.endDate || undefined,
      });
      setLogs(res.data);
      setTotalPages(res.meta.pagination.pageCount);
      setTotalCount(res.meta.pagination.total);
      setLastRefreshed(new Date()); // 새로고침 완료 시각 기록
    } catch (e) {
      console.error('Failed to load logs:', e);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, levelFilter, debouncedKeyword, customDateRange.startDate, customDateRange.endDate]);

  // 통계 조회
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetchAppLogStats({
        startDate: customDateRange.startDate || undefined,
        endDate: customDateRange.endDate || undefined,
      });
      setStats(res.data);
    } catch (e) {
      console.error('Failed to load stats:', e);
    } finally {
      setStatsLoading(false);
    }
  }, [customDateRange.startDate, customDateRange.endDate]);

  // 데이터 로드
  useEffect(() => {
    loadLogs();
    loadStats();
  }, [loadLogs, loadStats]);

  // 자동 새로고침 (30초)
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshRef.current = setInterval(() => {
        loadLogs();
        loadStats();
      }, 30000);
    }
    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
        autoRefreshRef.current = null;
      }
    };
  }, [autoRefresh, loadLogs, loadStats]);

  // 로그 정리
  const handleCleanup = async () => {
    if (!confirm(`${cleanupDays}일 이전의 로그를 삭제하시겠습니까?`)) return;
    setCleanupLoading(true);
    setCleanupResult(null);
    try {
      const res = await cleanupOldLogs(cleanupDays);
      setCleanupResult(`✅ ${res.data.deletedCount}건의 로그가 삭제되었습니다.`);
      loadLogs();
      loadStats();
    } catch (e) {
      setCleanupResult('❌ 로그 정리 중 오류가 발생했습니다.');
    } finally {
      setCleanupLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">전체</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsLoading ? '…' : (stats?.total ?? 0)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-800/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Warning</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{statsLoading ? '…' : (stats?.warn ?? 0)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">Error</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{statsLoading ? '…' : (stats?.error ?? 0)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-300 dark:border-red-700/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span className="text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">Fatal</span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{statsLoading ? '…' : (stats?.fatal ?? 0)}</p>
        </div>
      </div>

      {/* 에러 소스 Top 5 */}
      {stats && stats.topSources.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">발생 위치 Top 5</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topSources.map((s) => (
              <button
                key={s.source}
                onClick={() => { setKeyword(s.source); setPage(1); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <span className="font-mono">{s.source}</span>
                <span className="bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full text-[10px]">
                  {s.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 필터 바 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        {/* 기간 버튼 + 자동 새로고침 */}
        <div className="flex flex-wrap items-center gap-2">
          {(['1d', '7d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${period === p
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
            >
              {p === '1d' ? '1일' : p === '7d' ? '7일' : '30일'}
            </button>
          ))}

          <div className="flex items-center gap-1 text-sm">
            <input
              type="date"
              value={customDateRange.startDate}
              onChange={(e) => {
                setCustomDateRange((v) => ({ ...v, startDate: e.target.value }));
                setPeriod('custom');
                setPage(1);
              }}
              className="px-2 py-1.5 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm"
            />
            <span className="text-gray-400">~</span>
            <input
              type="date"
              value={customDateRange.endDate}
              onChange={(e) => {
                setCustomDateRange((v) => ({ ...v, endDate: e.target.value }));
                setPeriod('custom');
                setPage(1);
              }}
              className="px-2 py-1.5 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* ↻ 아이콘 + 마지막 새로고침 시각 (오전/오후 HH:mm:ss) */}
            <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
              <svg className={`w-3.5 h-3.5 shrink-0 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {lastRefreshed && (
                <span className="text-[11px] tabular-nums tracking-wide">
                  {(() => {
                    const kst = new Date(lastRefreshed.getTime() + 9 * 60 * 60 * 1000);
                    const p = (n: number) => String(n).padStart(2, '0');
                    const h = kst.getUTCHours();
                    const ampm = h < 12 ? '오전' : '오후';
                    const h12 = h % 12 === 0 ? 12 : h % 12;
                    return `${ampm} ${p(h12)}:${p(kst.getUTCMinutes())}:${p(kst.getUTCSeconds())}`;
                  })()}
                </span>
              )}
            </div>

            {/* 자동갱신 토글 스위치 */}
            <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
              <button
                role="switch"
                aria-checked={autoRefresh}
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoRefresh ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    autoRefresh ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              자동갱신
            </label>

            {/* 새로고침 버튼 */}
            <button
              onClick={() => { loadLogs(); loadStats(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              새로고침
            </button>
          </div>

        </div>

        {/* 레벨 필터 + 키워드 검색 */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            {[
              { key: '', label: '전체' },
              { key: 'warn', label: 'WARN' },
              { key: 'error', label: 'ERROR' },
              { key: 'fatal', label: 'FATAL' },
            ].map((lv) => (
              <button
                key={lv.key}
                onClick={() => { setLevelFilter(lv.key); setPage(1); }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${levelFilter === lv.key
                    ? lv.key === 'warn'
                      ? 'bg-amber-500 text-white'
                      : lv.key === 'error'
                        ? 'bg-red-500 text-white'
                        : lv.key === 'fatal'
                          ? 'bg-red-700 text-white'
                          : 'bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {lv.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                placeholder="메시지, 소스, 스택에서 검색..."
                className="w-full pl-9 pr-8 py-1.5 text-sm rounded-lg border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 로그 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">로그 목록</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">({totalCount}건)</span>
          </div>
        </div>

        {/* 로그 항목들 */}
        {loading && logs.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-gray-500">로그를 불러오는 중...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">로그가 없습니다</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">선택한 기간에 기록된 로그가 없습니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {logs.map((log) => {
              const style = LEVEL_STYLES[log.level] || LEVEL_STYLES.error;
              const badge = LEVEL_BADGE[log.level] || LEVEL_BADGE.error;
              const isExpanded = expandedId === log.id;
              const { title, detail } = formatMessage(log.message);

              return (
                <div key={log.id} className={`transition-colors ${isExpanded ? style.bg : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                  {/* 로그 행 (클릭 시 확장) */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3"
                  >
                    {/* 레벨 뱃지 */}
                    <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                      {log.level}
                    </span>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${style.text} break-words`}>
                        {title}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{log.source || '—'}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{formatDateTime(log.occurredAt)}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">({timeAgo(log.occurredAt)})</span>
                      </div>
                    </div>

                    {/* 펼치기 아이콘 */}
                    <svg className={`w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 확장 상세 */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      {/* 상세 메시지 */}
                      {detail && (
                        <div className="rounded-lg bg-gray-900 dark:bg-black/40 p-3 overflow-x-auto">
                          <p className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all leading-relaxed">{detail}</p>
                        </div>
                      )}

                      {/* 스택 트레이스 */}
                      {log.stack && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                            </svg>
                            Stack Trace
                          </p>
                          <div className="rounded-lg bg-gray-900 dark:bg-black/40 p-3 overflow-x-auto max-h-64 overflow-y-auto">
                            <pre className="text-[11px] text-green-400 font-mono whitespace-pre-wrap break-all leading-relaxed">{formatStack(log.stack)}</pre>
                          </div>
                        </div>
                      )}

                      {/* 메타 정보 */}
                      {log.meta && Object.keys(log.meta).length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            메타 정보
                          </p>
                          <div className="rounded-lg bg-gray-900 dark:bg-black/40 p-3 overflow-x-auto">
                            <pre className="text-[11px] text-cyan-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
                              {JSON.stringify(log.meta, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              이전
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 로그 정리 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">로그 정리</h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {[7, 30].map((d) => (
              <button
                key={d}
                onClick={() => setCleanupDays(d)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${cleanupDays === d
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                  }`}
              >
                {d}일 이전
              </button>
            ))}
          </div>
          <button
            onClick={handleCleanup}
            disabled={cleanupLoading}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
          >
            {cleanupLoading ? '정리 중...' : '로그 삭제'}
          </button>
          {cleanupResult && (
            <span className="text-sm text-gray-600 dark:text-gray-400">{cleanupResult}</span>
          )}
        </div>
      </div>
    </div>
  );
}
