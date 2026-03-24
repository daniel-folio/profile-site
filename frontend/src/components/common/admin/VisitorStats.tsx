'use client';

import { useState } from 'react';
import { useVisitorStats } from '@/hooks/useVisitorTracking';

// 방문자 통계 대시보드 컴포넌트
export function VisitorStats() {
  const [period, setPeriod] = useState<'1d' | '7d' | '30d'>('7d');
  const { stats, loading, error, refetch } = useVisitorStats(period);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">방문자 통계</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">방문자 통계</h2>
        <div className="text-red-500 dark:text-red-400">
          <p>통계를 불러오는 중 오류가 발생했습니다: {error}</p>
          <button 
            onClick={refetch}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">방문자 통계</h2>
        <div className="flex gap-2">
          {(['1d', '7d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-sm transition ${
                period === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {p === '1d' ? '1일' : p === '7d' ? '7일' : '30일'}
            </button>
          ))}
        </div>
      </div>

      {stats && (
        <div className="space-y-6">
          {/* 전체 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">총 방문수</h3>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalVisitors}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">고유 방문자</h3>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.uniqueVisitors}</p>
            </div>
          </div>

          {/* 페이지별 통계 */}
          {stats.pageStats && stats.pageStats.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">페이지별 방문 통계</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 text-gray-700 dark:text-gray-300">페이지</th>
                      <th className="text-right py-2 text-gray-700 dark:text-gray-300">방문수</th>
                      <th className="text-right py-2 text-gray-700 dark:text-gray-300">고유 방문자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.pageStats.map((page, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 text-gray-900 dark:text-gray-100">{page.page}</td>
                        <td className="py-2 text-right text-gray-700 dark:text-gray-300">{page.visits}</td>
                        <td className="py-2 text-right text-gray-700 dark:text-gray-300">{page.unique_visitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 일별 통계 */}
          {stats.dailyStats && stats.dailyStats.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">일별 방문 통계</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 text-gray-700 dark:text-gray-300">날짜</th>
                      <th className="text-right py-2 text-gray-700 dark:text-gray-300">방문수</th>
                      <th className="text-right py-2 text-gray-700 dark:text-gray-300">고유 방문자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.dailyStats.map((day, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 text-gray-900 dark:text-gray-100">
                          {new Date(day.date).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="py-2 text-right text-gray-700 dark:text-gray-300">{day.visits}</td>
                        <td className="py-2 text-right text-gray-700 dark:text-gray-300">{day.unique_visitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            마지막 업데이트: {new Date().toLocaleString('ko-KR')}
          </div>
        </div>
      )}
    </div>
  );
}
