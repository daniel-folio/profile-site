/**
 * site-setting controller
 */

import { factories } from '@strapi/strapi'

// 싱글톤 안전 조회 헬퍼: 최신(updatedAt desc) 1개를 사용, 없으면 생성, 최후 id=1 조회
async function getSiteSettingSingleton(strapi: any): Promise<any> {
  try {
    const rows = await strapi.db
      .query('api::site-setting.site-setting')
      .findMany({ select: ['id', 'updatedAt'], orderBy: { updatedAt: 'desc' }, limit: 2 });
    if (Array.isArray(rows) && rows.length > 0) {
      if (rows.length > 1) {
        try { strapi.log.warn(`[site-setting/controller] duplicate records detected: ids=${rows.map((r:any)=>r.id).join(',')}`) } catch {}
      }
      return rows[0];
    }
  } catch (e) {}
  try {
    return await strapi.entityService.create('api::site-setting.site-setting', { data: {} });
  } catch (e) {
    try {
      const fb = await strapi.entityService.findOne('api::site-setting.site-setting', 1);
      if (fb) return fb;
    } catch {}
    throw e;
  }
}

export default factories.createCoreController('api::site-setting.site-setting', ({ strapi }) => ({
  // 업데이트 요청 로깅을 위한 커스텀 update 메서드
  async update(ctx) {
    console.log('🔍 Site Settings Update 요청 받음');
    console.log('🔍 Request Body:', JSON.stringify(ctx.request.body, null, 2));
    console.log('🔍 Request Params:', ctx.params);
    
    // adminPassword는 원본 그대로 저장 (사용자가 확인할 수 있도록)
    if (ctx.request.body.data && ctx.request.body.data.adminPassword) {
      const plainPassword = ctx.request.body.data.adminPassword;
      console.log('🔍 패스워드 저장 (원본):', plainPassword);
    }
    
    const result = await super.update(ctx);
    
    console.log('🔍 Update 결과:', JSON.stringify(result, null, 2));
    
    const actualId = (await getSiteSettingSingleton(strapi)).id;
    const actualData = await strapi.entityService.findOne('api::site-setting.site-setting', actualId);
    console.log('🔍 업데이트 후 실제 DB 데이터:', JSON.stringify(actualData, null, 2));
    
    return result;
  },
  // 공개 설정 조회 (패스워드 제외)
  async find(ctx) {
    try {
      const s = await getSiteSettingSingleton(strapi);
      // 특정 필드만 노출
      const data = s ? {
        enableVisitorTracking: s.enableVisitorTracking ?? true,
        siteName: s.siteName ?? null,
        siteDescription: s.siteDescription ?? null,
        siteUsed: s.siteUsed ?? true,
        maxVisitorsPerDay: s.maxVisitorsPerDay ?? 10000,
      } : {
        enableVisitorTracking: true,
        siteName: null,
        siteDescription: null,
        siteUsed: true,
        maxVisitorsPerDay: 10000,
      };
      return { data };
    } catch (error) {
      console.error('Error in site-setting find:', error);
      ctx.throw(500, 'Failed to fetch site settings');
    }
  },

  // 관리자 인증 및 전체 설정 조회
  async validatePassword(ctx) {
    try {
      const { password } = ctx.request.body;
      
      console.log('🔍 패스워드 검증 요청');
      console.log('🔍 입력된 패스워드:', password);
      
      if (!password) {
        return ctx.badRequest('Password is required');
      }

      const target = await getSiteSettingSingleton(strapi);
      const settings = await strapi.entityService.findOne('api::site-setting.site-setting', target.id, {
        fields: ['adminPassword', 'enableVisitorTracking', 'siteName', 'siteDescription', 'siteUsed', 'maxVisitorsPerDay']
      });

      console.log('🔍 DB에서 조회한 설정 데이터:', JSON.stringify(settings, null, 2));
      console.log('🔍 DB 저장된 adminPassword 해시:', settings?.adminPassword);

      if (!settings || !settings.adminPassword) {
        console.log('❌ adminPassword가 DB에 없음');
        return ctx.unauthorized('Admin password not configured');
      }

      // 패스워드 검증 - 원본 패스워드 직접 비교
      console.log('🔍 패스워드 비교 시작');
      console.log('🔍 입력 패스워드:', password);
      console.log('🔍 저장된 패스워드:', settings.adminPassword);
      
      const isValid = password === settings.adminPassword;
      console.log('🔍 패스워드 검증 결과:', isValid);

      if (!isValid) {
        console.log('❌ 패스워드 불일치');
        return ctx.unauthorized('Invalid password');
      }

      console.log('✅ 패스워드 검증 성공');
      // 패스워드 제외하고 반환
      const { adminPassword, ...result } = settings;
      return { success: true, data: result };
      
    } catch (error) {
      console.error('Error in site-setting validatePassword:', error);
      ctx.throw(500, 'Failed to validate password');
    }
  },

  // 기본 설정 생성 (초기 설정용)
  async createDefaultSettings(ctx) {
    try {
      const existing = await strapi.db.query('api::site-setting.site-setting').findMany({ limit: 1 });
      if (Array.isArray(existing) && existing.length > 0) {
        return ctx.badRequest('Settings already exist');
      }

      const defaultSettings = await strapi.entityService.create('api::site-setting.site-setting', {
        data: {
          enableVisitorTracking: true,
          siteName: 'Developer Portfolio',
          siteDescription: 'Personal portfolio website',
          siteUsed: true,
          maxVisitorsPerDay: 10000
        }
      });

      ctx.body = {
        data: defaultSettings,
        message: 'Default settings created successfully'
      };
    } catch (error) {
      console.error('Create default settings error:', error);
      ctx.throw(500, 'Failed to create default settings');
    }
  }
  ,
  // 진단: 모든 site-setting 레코드와 요약 반환
  async debugSummary(ctx) {
    const rows = await strapi.db.query('api::site-setting.site-setting').findMany({
      select: ['id', 'updatedAt', 'createdAt', 'siteName', 'enableVisitorTracking']
    });
    const details = await Promise.all(rows.map(async (r:any) => {
      const full = await strapi.entityService.findOne('api::site-setting.site-setting', r.id);
      const size = Array.isArray(full?.ownerIpAllowlist) ? full.ownerIpAllowlist.length : 0;
      return { id: r.id, createdAt: r.createdAt, updatedAt: r.updatedAt, allowSize: size };
    }));
    ctx.body = { ok: true, ids: rows.map((r:any)=>r.id), details };
  }
  ,
  // 중복 병합: 최신 1개를 남기고 ownerIpAllowlist 병합 후 나머지 삭제
  async mergeDuplicates(ctx) {
    const rows = await strapi.db
      .query('api::site-setting.site-setting')
      .findMany({ select: ['id','updatedAt'], orderBy: { updatedAt: 'desc' } });
    if (!Array.isArray(rows) || rows.length <= 1) {
      ctx.body = { ok: true, message: 'No duplicates' };
      return;
    }
    const primary = rows[0];
    const others = rows.slice(1);
    // 병합할 allowlist 수집
    const sets = [] as any[];
    for (const r of rows) {
      const full = await strapi.entityService.findOne('api::site-setting.site-setting', r.id);
      const arr = Array.isArray(full?.ownerIpAllowlist) ? full.ownerIpAllowlist : [];
      sets.push(...arr);
    }
    // 중복 ip 제거, 최근 항목 우선
    const seen = new Set<string>();
    const merged: any[] = [];
    for (const item of sets.reverse()) { // 뒤에서부터 → 최신 먼저 반영되도록
      const ip = typeof item === 'string' ? item : item?.ip;
      if (!ip || seen.has(ip)) continue;
      seen.add(ip);
      merged.push(typeof item === 'string' ? { ip: item, note: '' } : { ip, note: item?.note ?? '' });
    }
    merged.reverse();
    // 1) 기본 레코드 업데이트
    await strapi.entityService.update('api::site-setting.site-setting', primary.id, {
      data: { ownerIpAllowlist: merged }
    });
    // 2) 나머지 삭제
    for (const r of others) {
      try { await strapi.db.query('api::site-setting.site-setting').delete({ where: { id: r.id } }); } catch {}
    }
    ctx.body = { ok: true, primaryId: primary.id, deletedIds: others.map(o=>o.id), mergedCount: merged.length };
  },
  // 헬스 체크: GET/HEAD 모두 200
  async healthz(ctx) {
    // Koa는 HEAD 요청에서 body를 무시하므로 상태만 보장
    ctx.status = 200;
    if (ctx.method !== 'HEAD') {
      ctx.body = { ok: true };
    }
  }
}));
// keep file end

