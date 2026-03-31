/**
 * app-log controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::app-log.app-log', ({ strapi }) => ({

  // 로그 목록 조회 (페이지네이션, 필터 지원)
  async find(ctx) {
    try {
      const {
        page = 1,
        pageSize = 50,
        level,
        source,
        keyword,
        startDate,
        endDate,
        sort = 'occurredAt:desc',
      } = ctx.query as any;

      // 필터 구성
      const filters: any = {};

      if (level) {
        // 쉼표로 구분된 복수 레벨 지원: "error,fatal"
        const levels = String(level).split(',').map(l => l.trim()).filter(Boolean);
        if (levels.length === 1) {
          filters.level = levels[0];
        } else if (levels.length > 1) {
          filters.level = { $in: levels };
        }
      }

      if (source) {
        filters.source = { $containsi: source };
      }

      if (keyword) {
        filters.$or = [
          { message: { $containsi: keyword } },
          { source: { $containsi: keyword } },
          { stack: { $containsi: keyword } },
        ];
      }

      if (startDate || endDate) {
        filters.occurredAt = {};
        if (startDate) filters.occurredAt.$gte = new Date(startDate).toISOString();
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filters.occurredAt.$lte = end.toISOString();
        }
      }

      const results = await strapi.entityService.findMany('api::app-log.app-log', {
        filters,
        sort,
        start: (Number(page) - 1) * Number(pageSize),
        limit: Number(pageSize),
      });

      // 총 건수 계산
      const total = await strapi.db
        .query('api::app-log.app-log')
        .count({ where: filters });

      return {
        data: results,
        meta: {
          pagination: {
            page: Number(page),
            pageSize: Number(pageSize),
            total,
            pageCount: Math.ceil(total / Number(pageSize)),
          },
        },
      };
    } catch (error) {
      console.error('[app-log] find error:', error);
      ctx.throw(500, 'Failed to fetch logs');
    }
  },

  // 레벨별 통계
  async getStats(ctx) {
    try {
      const { startDate, endDate } = ctx.query as any;

      const where: any = {};
      if (startDate || endDate) {
        where.occurredAt = {};
        if (startDate) where.occurredAt.$gte = new Date(startDate).toISOString();
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.occurredAt.$lte = end.toISOString();
        }
      }

      const [warnCount, errorCount, fatalCount, totalCount] = await Promise.all([
        strapi.db.query('api::app-log.app-log').count({ where: { ...where, level: 'warn' } }),
        strapi.db.query('api::app-log.app-log').count({ where: { ...where, level: 'error' } }),
        strapi.db.query('api::app-log.app-log').count({ where: { ...where, level: 'fatal' } }),
        strapi.db.query('api::app-log.app-log').count({ where }),
      ]);

      // 최근 에러 소스 Top 5
      const recentLogs = await strapi.entityService.findMany('api::app-log.app-log', {
        filters: where,
        sort: 'occurredAt:desc',
        limit: 200,
        fields: ['source', 'level'],
      });

      const sourceMap: Record<string, number> = {};
      (recentLogs as any[]).forEach(log => {
        const src = log.source || 'unknown';
        sourceMap[src] = (sourceMap[src] || 0) + 1;
      });
      const topSources = Object.entries(sourceMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([source, count]) => ({ source, count }));

      return {
        data: {
          warn: warnCount,
          error: errorCount,
          fatal: fatalCount,
          total: totalCount,
          topSources,
        },
      };
    } catch (error) {
      console.error('[app-log] getStats error:', error);
      ctx.throw(500, 'Failed to fetch log stats');
    }
  },

  // 오래된 로그 정리
  async cleanup(ctx) {
    try {
      const { days = 30 } = ctx.query as any;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(days));

      const toDelete = await strapi.db.query('api::app-log.app-log').findMany({
        where: { occurredAt: { $lt: cutoff.toISOString() } },
        select: ['id'],
      });

      let deletedCount = 0;
      for (const row of toDelete) {
        try {
          await strapi.db.query('api::app-log.app-log').delete({ where: { id: row.id } });
          deletedCount++;
        } catch { }
      }

      return {
        data: {
          ok: true,
          deletedCount,
          cutoffDate: cutoff.toISOString(),
          days: Number(days),
        },
      };
    } catch (error) {
      console.error('[app-log] cleanup error:', error);
      ctx.throw(500, 'Failed to cleanup old logs');
    }
  },
}));
