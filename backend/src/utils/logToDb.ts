/**
 * logToDb — DB에 에러/경고 로그를 기록하는 유틸리티
 *
 * 사용법:
 *   import { logToDb } from '../utils/logToDb';
 *   await logToDb(strapi, { level: 'error', source: 'visitor/create', message: '...', stack: err.stack });
 *
 * 주의: DB 저장 실패 시 silent fail. 로깅이 원래 비즈니스 로직을 절대 방해하지 않습니다.
 */

interface LogEntry {
  level: 'warn' | 'error' | 'fatal';
  source?: string;
  message: string;
  stack?: string;
  meta?: Record<string, any>;
}

export async function logToDb(strapi: any, entry: LogEntry): Promise<void> {
  try {
    await strapi.entityService.create('api::app-log.app-log', {
      data: {
        level: entry.level,
        source: entry.source ?? 'unknown',
        message: truncate(entry.message, 5000),
        stack: entry.stack ? truncate(entry.stack, 10000) : null,
        meta: entry.meta ?? null,
        occurredAt: new Date(),
      },
    });
  } catch {
    // DB 저장 실패 시 silent — 로그를 남기려다 원래 로직을 해치면 안 된다
  }
}

/** 문자열 길이 제한 (DB 부하 방지) */
function truncate(str: string, maxLen: number): string {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…(truncated)' : str;
}
