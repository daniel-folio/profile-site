/**
 * visitor controller
 */

import { factories } from '@strapi/strapi';

// --- IP 유틸리티 ---
function normalizeIp(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  let ip = raw.trim();
  // XFF에 포트 포함 가능: "203.0.113.1:12345"
  if (ip.includes(':') && ip.split(':').length > 2) {
    // IPv6 (브라우저는 대개 포트를 XFF에 붙이지 않지만 방어적으로 둔다)
    // 대괄호 제거
    ip = ip.replace(/^\[/, '').replace(/\]$/, '');
  } else {
    // IPv4 with port
    ip = ip.split(':')[0];
  }
  // IPv4-mapped IPv6 ::ffff:192.0.2.1 → 192.0.2.1
  if (ip.startsWith('::ffff:')) ip = ip.substring(7);
  // IPv6 loopback ::1 → 127.0.0.1로 정규화
  if (ip === '::1') ip = '127.0.0.1';
  return ip;
}

function isPrivateOrReservedIp(ip?: string): boolean {
  if (!ip) return true;
  const ipv4 = /^\d+\.\d+\.\d+\.\d+$/.test(ip);
  if (ipv4) {
    const [a, b] = ip.split('.').map(Number);
    // loopback 127.0.0.0/8
    if (a === 127) return true;
    // private 10.0.0.0/8
    if (a === 10) return true;
    // private 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // private 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // link-local 169.254.0.0/16
    if (a === 169 && b === 254) return true;
    // CGNAT 100.64.0.0/10
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 0.0.0.0
    if (ip === '0.0.0.0') return true;
    return false;
  }
  // 간단한 IPv6 예약/사설 판별
  const lower = ip.toLowerCase();
  if (lower === '::1') return true; // loopback
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local fc00::/7
  if (lower.startsWith('fe80')) return true; // link-local fe80::/10
  return false;
}

function parseXff(header: string | string[] | undefined): string[] {
  if (!header) return [];
  const raw = Array.isArray(header) ? header.join(',') : header;
  return raw
    .split(',')
    .map((h) => normalizeIp(h))
    .filter((v): v is string => !!v);
}

// --- User-Agent 파서 (경량) ---
function parseUserAgent(uaRaw?: string) {
  const ua = (uaRaw || '').toLowerCase();
  let os = 'Unknown';
  let osVersion = '';
  let browser = 'Unknown';
  let browserVersion = '';
  let deviceType: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown' = 'unknown';

  // Device type
  if (/(googlebot|bingbot|bot|crawler|spider)/.test(ua)) deviceType = 'bot';
  else if (/(ipad|tablet)/.test(ua)) deviceType = 'tablet';
  else if (/(iphone|android|mobile)/.test(ua)) deviceType = 'mobile';
  else deviceType = 'desktop';

  // OS detection
  if (ua.includes('windows')) {
    os = 'Windows';
    const m = ua.match(/windows nt ([0-9\.]+)/);
    if (m) osVersion = m[1];
  } else if (ua.includes('mac os x') || ua.includes('macintosh')) {
    os = 'macOS';
    const m = ua.match(/mac os x ([0-9_\.]+)/);
    if (m) osVersion = m[1].replace(/_/g, '.');
  } else if (ua.includes('android')) {
    os = 'Android';
    const m = ua.match(/android ([0-9\.]+)/);
    if (m) osVersion = m[1];
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) {
    os = 'iOS';
    const m = ua.match(/os ([0-9_]+) like mac os x/);
    if (m) osVersion = m[1].replace(/_/g, '.');
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  // Browser detection (순서 중요)
  if (ua.includes('edg/')) {
    browser = 'Edge';
    const m = ua.match(/edg\/(\d+\.\d+\.\d+\.\d+|\d+\.\d+)/);
    if (m) browserVersion = m[1];
  } else if (ua.includes('opr/') || ua.includes('opera')) {
    browser = 'Opera';
    const m = ua.match(/(?:opr|opera)\/(\d+\.\d+)/);
    if (m) browserVersion = m[1];
  } else if (ua.includes('chrome/') && !ua.includes('edg')) {
    browser = 'Chrome';
    const m = ua.match(/chrome\/(\d+\.\d+\.\d+\.\d+|\d+\.\d+)/);
    if (m) browserVersion = m[1];
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Safari';
    const m = ua.match(/version\/(\d+\.\d+|\d+)/);
    if (m) browserVersion = m[1];
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox';
    const m = ua.match(/firefox\/(\d+\.\d+)/);
    if (m) browserVersion = m[1];
  }

  return { os, osVersion, browser, browserVersion, deviceType };
}

export default factories.createCoreController('api::visitor.visitor', ({ strapi }) => ({
  // 방문자 정보 기록
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // IP 주소 추출 (프록시/CDN 환경 고려)
      // 우선순위 헤더: CF-Connecting-IP > True-Client-IP > X-Real-IP > X-Forwarded-For 체인 > koa ip
      const cf = normalizeIp(ctx.request.headers['cf-connecting-ip'] as string | undefined);
      const tci = normalizeIp(ctx.request.headers['true-client-ip'] as string | undefined);
      const xri = normalizeIp(ctx.request.headers['x-real-ip'] as string | undefined);
      const xffList = parseXff(ctx.request.headers['x-forwarded-for'] as string | string[] | undefined);
      const koaIp = normalizeIp(ctx.request.ip || ctx.ip);

      const candidates = [cf, tci, xri, ...xffList, koaIp].filter((v): v is string => !!v);
      // 공인 IP(사설/예약 아님) 우선 선택
      const publicCandidate = candidates.find((ip) => !isPrivateOrReservedIp(ip));
      const ipAddress = publicCandidate || candidates[0] || '127.0.0.1';

      // User-Agent 정보 및 파싱
      const userAgent = ctx.request.headers['user-agent'];
      const uaParsed = parseUserAgent(userAgent || '');
      
      // Referrer 정보
      const referrer = ctx.request.headers['referer'] || ctx.request.headers['referrer'];

      // 방문자 데이터 생성
      const visitorData = {
        ...data,
        ipAddress,
        userAgent,
        os: uaParsed.os,
        osVersion: uaParsed.osVersion,
        browser: uaParsed.browser,
        browserVersion: uaParsed.browserVersion,
        deviceType: uaParsed.deviceType,
        referrer,
        visitedAt: new Date(),
      };

      console.log('🔍 방문자 데이터 생성:', JSON.stringify(visitorData, null, 2));

      // 중복 방문 체크 (같은 IP, 같은 페이지, 1시간 이내)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      console.log('🔍 중복 방문 체크 시작 - IP:', visitorData.ipAddress, 'Page:', visitorData.page);
      
      const existingVisit = await strapi.entityService.findMany('api::visitor.visitor', {
        filters: {
          ipAddress: visitorData.ipAddress,
          page: visitorData.page,
          visitedAt: {
            $gte: oneHourAgo,
          },
        },
        limit: 1,
      });

      console.log('🔍 기존 방문 기록 조회 결과:', existingVisit);

      // 중복 방문이 아닌 경우에만 기록
      if (!existingVisit || existingVisit.length === 0) {
        console.log('✅ 새로운 방문자 - 데이터베이스에 저장 시도');
        
        const entity = await strapi.entityService.create('api::visitor.visitor', {
          data: visitorData,
        });
        
        console.log('✅ 방문자 데이터 저장 성공:', entity);
        return this.transformResponse(entity);
      } else {
        console.log('⚠️ 중복 방문 감지 - 기존 데이터 반환');
        // 중복 방문인 경우 기존 데이터 반환
        return this.transformResponse(existingVisit[0]);
      }
    } catch (error) {
      console.error('방문자 기록 오류:', error);
      ctx.throw(500, '방문자 정보 기록에 실패했습니다.');
    }
  },

  // 방문자 통계 조회
  async getStats(ctx) {
    try {
      const { period = '7d', startDate: customStartDate, endDate: customEndDate } = ctx.query;
      
      let startDate;
      let endDate = new Date(); // 기본 종료일은 현재 시간
      
      if (period === 'custom' && customStartDate && customEndDate) {
        startDate = new Date(customStartDate as string);
        endDate = new Date(customEndDate as string);
        // 종료일을 하루의 끝으로 설정 (23:59:59)
        endDate.setHours(23, 59, 59, 999);
      } else {
        // 기본 기간 설정
        const now = new Date();
        switch (period) {
          case '1d':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
      }

      console.log('📊 통계 조회 시작:', { 
        period, 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        customRange: period === 'custom' 
      });

      // 날짜 범위 필터 설정
      const dateFilter = {
        visitedAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      // 총 방문자 수
      const totalVisitors = await strapi.entityService.count('api::visitor.visitor', {
        filters: dateFilter,
      });

      console.log('📊 총 방문자 수:', totalVisitors);

      // Strapi EntityService를 사용한 고유 방문자 수 계산
      const allVisitorsRaw = await strapi.entityService.findMany('api::visitor.visitor', {
        filters: dateFilter,
        fields: ['ipAddress', 'page', 'visitedAt', 'userAgent', 'sessionId', 'os', 'osVersion', 'browser', 'browserVersion', 'deviceType'],
      });

      const allVisitors = (allVisitorsRaw as unknown as any[]) || [];
      console.log('📊 조회된 방문자 데이터:', allVisitors.length, '건');

      // 고유 IP 주소 계산 및 추가 분석 데이터
      const uniqueIPs = new Set();
      const pageStatsMap = new Map();
      const dailyStatsMap = new Map();
      const sessionStatsMap = new Map();
      const browserStatsMap = new Map();
      const osStatsMap = new Map();

      allVisitors.forEach((visitor: any) => {
        if (visitor.ipAddress) {
          uniqueIPs.add(visitor.ipAddress);
        }

        // 페이지별 통계
        const page = visitor.page || '/';
        if (!pageStatsMap.has(page)) {
          pageStatsMap.set(page, { page, visits: 0, uniqueIPs: new Set() });
        }
        const pageStats = pageStatsMap.get(page);
        pageStats.visits++;
        if (visitor.ipAddress) {
          pageStats.uniqueIPs.add(visitor.ipAddress);
        }

        // 일별 통계
        const date = new Date(visitor.visitedAt).toISOString().split('T')[0];
        if (!dailyStatsMap.has(date)) {
          dailyStatsMap.set(date, { date, visits: 0, uniqueIPs: new Set() });
        }
        const dailyStats = dailyStatsMap.get(date);
        dailyStats.visits++;
        if (visitor.ipAddress) {
          dailyStats.uniqueIPs.add(visitor.ipAddress);
        }

        // 세션별 통계
        const sessionId = visitor.sessionId || 'unknown';
        if (!sessionStatsMap.has(sessionId)) {
          sessionStatsMap.set(sessionId, { 
            sessionId, 
            ipAddress: visitor.ipAddress,
            pages: new Set(), 
            visits: 0,
            firstVisit: visitor.visitedAt,
            lastVisit: visitor.visitedAt,
            userAgent: visitor.userAgent
          });
        }
        const sessionStats = sessionStatsMap.get(sessionId);
        sessionStats.visits++;
        sessionStats.pages.add(page);
        if (new Date(visitor.visitedAt) < new Date(sessionStats.firstVisit)) {
          sessionStats.firstVisit = visitor.visitedAt;
        }
        if (new Date(visitor.visitedAt) > new Date(sessionStats.lastVisit)) {
          sessionStats.lastVisit = visitor.visitedAt;
        }

        // 브라우저 통계 (저장 필드 우선, 없으면 UA 파싱)
        {
          let browser = (visitor as any).browser as string | undefined;
          if (!browser) {
            const ua = (visitor.userAgent || '').toLowerCase();
            if (ua.includes('edg')) browser = 'Edge';
            else if (ua.includes('opr') || ua.includes('opera')) browser = 'Opera';
            else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
            else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
            else if (ua.includes('firefox')) browser = 'Firefox';
            else browser = 'Unknown';
          }
          if (!browserStatsMap.has(browser)) {
            browserStatsMap.set(browser, { browser, visits: 0, uniqueIPs: new Set() });
          }
          const browserStats = browserStatsMap.get(browser);
          browserStats.visits++;
          if (visitor.ipAddress) {
            browserStats.uniqueIPs.add(visitor.ipAddress);
          }
        }

        // 운영체제 통계 (저장 필드 우선, 없으면 UA 파싱)
        {
          let os = (visitor as any).os as string | undefined;
          if (!os) {
            const ua = (visitor.userAgent || '').toLowerCase();
            if (ua.includes('windows')) os = 'Windows';
            else if (ua.includes('mac os x') || ua.includes('macintosh')) os = 'macOS';
            else if (ua.includes('android')) os = 'Android';
            else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) os = 'iOS';
            else if (ua.includes('linux')) os = 'Linux';
            else os = 'Unknown';
          }
          if (!osStatsMap.has(os)) {
            osStatsMap.set(os, { os, visits: 0, uniqueIPs: new Set() });
          }
          const osStats = osStatsMap.get(os);
          osStats.visits++;
          if (visitor.ipAddress) {
            osStats.uniqueIPs.add(visitor.ipAddress);
          }
        }
      });

      // 페이지별 통계 변환
      const pageStats = Array.from(pageStatsMap.values())
        .map(stat => ({
          page: stat.page,
          visits: stat.visits,
          unique_visitors: stat.uniqueIPs.size,
        }))
        .sort((a, b) => b.visits - a.visits);

      // 일별 통계 변환
      const dailyStats = Array.from(dailyStatsMap.values())
        .map(stat => ({
          date: stat.date,
          visits: stat.visits,
          unique_visitors: stat.uniqueIPs.size,
        }))
        .sort((a, b) => b.date.localeCompare(a.date));

      // 세션 통계 변환
      const sessionStats = Array.from(sessionStatsMap.values())
        .map(stat => ({
          sessionId: stat.sessionId,
          ipAddress: stat.ipAddress,
          pageViews: stat.visits,
          uniquePages: stat.pages.size,
          duration: Math.max(0, new Date(stat.lastVisit).getTime() - new Date(stat.firstVisit).getTime()),
          firstVisit: stat.firstVisit,
          lastVisit: stat.lastVisit,
          userAgent: stat.userAgent,
          pages: Array.from(stat.pages)
        }))
        .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());

      // 브라우저 통계 변환
      const browserStats = Array.from(browserStatsMap.values())
        .map(stat => ({
          browser: stat.browser,
          visits: stat.visits,
          unique_visitors: stat.uniqueIPs.size,
          percentage: totalVisitors > 0 ? Math.round((stat.visits / totalVisitors) * 100) : 0
        }))
        .sort((a, b) => b.visits - a.visits);

      // 운영체제 통계 변환
      const osStats = Array.from(osStatsMap.values())
        .map(stat => ({
          os: stat.os,
          visits: stat.visits,
          unique_visitors: stat.uniqueIPs.size,
          percentage: totalVisitors > 0 ? Math.round((stat.visits / totalVisitors) * 100) : 0
        }))
        .sort((a, b) => b.visits - a.visits);

      // 추가 집계 데이터
      const totalSessions = sessionStats.length;
      const avgPageViews = totalSessions > 0 ? Math.round((totalVisitors / totalSessions) * 10) / 10 : 0;
      const avgSessionDuration = sessionStats.length > 0 
        ? Math.round(sessionStats.reduce((sum, session) => sum + session.duration, 0) / sessionStats.length / 1000) 
        : 0;

      const result = {
        period,
        totalVisitors,
        uniqueVisitors: uniqueIPs.size,
        totalSessions,
        avgPageViews,
        avgSessionDuration,
        pageStats,
        dailyStats,
        sessionStats,
        browserStats,
        osStats,
      };

      console.log('📊 최종 통계 결과:', {
        totalVisitors: result.totalVisitors,
        uniqueVisitors: result.uniqueVisitors,
        totalSessions: result.totalSessions,
        avgPageViews: result.avgPageViews,
        avgSessionDuration: result.avgSessionDuration,
        pageStatsCount: result.pageStats.length,
        dailyStatsCount: result.dailyStats.length,
        sessionStatsCount: result.sessionStats.length,
        browserStatsCount: result.browserStats.length,
        osStatsCount: result.osStats.length,
        browserStats: result.browserStats,
        osStats: result.osStats,
      });

      return result;
    } catch (error) {
      console.error('방문자 통계 조회 오류:', error);
      ctx.throw(500, '방문자 통계 조회에 실패했습니다.');
    }
  },
}));
