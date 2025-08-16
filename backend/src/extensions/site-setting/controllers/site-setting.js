'use strict';

/**
 * site-setting controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::site-setting.site-setting', ({ strapi }) => ({
  // 기존 컨트롤러 메서드 오버라이드
  async find(ctx) {
    // 기본 find 동작 수행
    const { data, meta } = await super.find(ctx);
    
    // 커스텀 필터링 또는 데이터 변환 로직 추가 가능
    return { data, meta };
  },

  // 공개 설정 조회 (패스워드 제외)
  async getPublicSettings(ctx) {
    try {
      const settings = await strapi.entityService.findMany('api::site-setting.site-setting', {
        fields: ['enableVisitorTracking', 'siteName', 'siteDescription', 'siteUsed', 'maxVisitorsPerDay']
      });

      ctx.body = {
        data: settings || {
          enableVisitorTracking: true,
          siteName: null,
          siteDescription: null,
          siteUsed: true,
          maxVisitorsPerDay: 10000
        }
      };
    } catch (error) {
      ctx.throw(500, 'Failed to fetch public settings');
    }
  },

  // 관리자 패스워드 검증
  async validateAdminPassword(ctx) {
    try {
      const { password } = ctx.request.body;
      
      if (!password) {
        return ctx.badRequest('Password is required');
      }

      const settings = await strapi.entityService.findMany('api::site-setting.site-setting', {
        fields: ['adminPassword']
      });

      if (!settings || !settings.adminPassword) {
        return ctx.unauthorized('Admin password not configured');
      }

      // 패스워드 비교 (Strapi의 password 필드는 자동으로 해시됨)
      const isValid = await strapi.plugins['users-permissions'].services.user.validatePassword(
        password,
        settings.adminPassword
      );

      if (isValid) {
        ctx.body = { 
          success: true,
          message: 'Password validated successfully'
        };
      } else {
        ctx.unauthorized('Invalid password');
      }
    } catch (error) {
      ctx.throw(500, 'Failed to validate password');
    }
  }
}));
