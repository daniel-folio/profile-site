/**
 * visitor controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::visitor.visitor', ({ strapi }) => ({
  // 방문자 정보 기록
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // IP 주소 추출 (프록시 환경 고려)
      const ipAddress = ctx.request.ip || 
                       ctx.request.headers['x-forwarded-for'] || 
                       ctx.request.headers['x-real-ip'] || 
                       ctx.ip || 
                       '127.0.0.1';

      // User-Agent 정보
      const userAgent = ctx.request.headers['user-agent'];
      
      // Referrer 정보
      const referrer = ctx.request.headers['referer'] || ctx.request.headers['referrer'];

      // 방문자 데이터 생성
      const visitorData = {
        ...data,
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        userAgent,
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
      const allVisitors = await strapi.entityService.findMany('api::visitor.visitor', {
        filters: dateFilter,
        fields: ['ipAddress', 'page', 'visitedAt', 'userAgent', 'sessionId'],
      });

      console.log('📊 조회된 방문자 데이터:', allVisitors?.length || 0, '건');

      // 고유 IP 주소 계산 및 추가 분석 데이터
      const uniqueIPs = new Set();
      const pageStatsMap = new Map();
      const dailyStatsMap = new Map();
      const sessionStatsMap = new Map();
      const browserStatsMap = new Map();
      const osStatsMap = new Map();

      allVisitors?.forEach(visitor => {
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

        // 브라우저 통계 (User-Agent에서 추출)
        if (visitor.userAgent) {
          let browser = 'Unknown';
          const ua = visitor.userAgent.toLowerCase();
          if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
          else if (ua.includes('firefox')) browser = 'Firefox';
          else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
          else if (ua.includes('edg')) browser = 'Edge';
          else if (ua.includes('opera')) browser = 'Opera';

          if (!browserStatsMap.has(browser)) {
            browserStatsMap.set(browser, { browser, visits: 0, uniqueIPs: new Set() });
          }
          const browserStats = browserStatsMap.get(browser);
          browserStats.visits++;
          if (visitor.ipAddress) {
            browserStats.uniqueIPs.add(visitor.ipAddress);
          }
        }

        // 운영체제 통계 (User-Agent에서 추출)
        if (visitor.userAgent) {
          let os = 'Unknown';
          const ua = visitor.userAgent.toLowerCase();
          if (ua.includes('windows')) os = 'Windows';
          else if (ua.includes('mac os x') || ua.includes('macintosh')) os = 'macOS';
          else if (ua.includes('linux')) os = 'Linux';
          else if (ua.includes('android')) os = 'Android';
          else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

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
