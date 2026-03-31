/**
 * App Log API 헬퍼
 */
import { getApiUrl } from '@/features/common/api/api';

export interface AppLogEntry {
  id: number;
  level: 'warn' | 'error' | 'fatal';
  source: string;
  message: string;
  stack?: string | null;
  meta?: Record<string, any> | null;
  occurredAt: string;
  createdAt?: string;
}

export interface AppLogStats {
  warn: number;
  error: number;
  fatal: number;
  total: number;
  topSources: { source: string; count: number }[];
}

interface FetchLogsParams {
  page?: number;
  pageSize?: number;
  level?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

interface FetchLogsResponse {
  data: AppLogEntry[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      pageCount: number;
    };
  };
}

export async function fetchAppLogs(params: FetchLogsParams = {}): Promise<FetchLogsResponse> {
  const apiUrl = getApiUrl();
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.level) searchParams.set('level', params.level);
  if (params.keyword) searchParams.set('keyword', params.keyword);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  searchParams.set('sort', 'occurredAt:desc');

  const response = await fetch(`${apiUrl}/api/app-logs?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch logs: ${response.status}`);
  }
  return response.json();
}

export async function fetchAppLogStats(params?: { startDate?: string; endDate?: string }): Promise<{ data: AppLogStats }> {
  const apiUrl = getApiUrl();
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);

  const response = await fetch(`${apiUrl}/api/app-logs/stats?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch log stats: ${response.status}`);
  }
  return response.json();
}

export async function cleanupOldLogs(days: number = 30): Promise<{ data: { ok: boolean; deletedCount: number; cutoffDate: string; days: number } }> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/app-logs/cleanup?days=${days}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to cleanup logs: ${response.status}`);
  }
  return response.json();
}
