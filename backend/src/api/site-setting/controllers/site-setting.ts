/**
 * site-setting controller
 */

import { factories } from '@strapi/strapi'

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
    
    const actualData = await strapi.entityService.findOne('api::site-setting.site-setting', 1);
    console.log('🔍 업데이트 후 실제 DB 데이터:', JSON.stringify(actualData, null, 2));
    
    return result;
  },
  // 공개 설정 조회 (패스워드 제외)
  async find(ctx) {
    try {
      // singleType이므로 findOne 사용
      let settings = await strapi.entityService.findOne('api::site-setting.site-setting', 1, {
        fields: ['enableVisitorTracking', 'siteName', 'siteDescription', 'siteUsed', 'maxVisitorsPerDay']
      });

      // 데이터가 없으면 기본값으로 생성 (패스워드는 제외)
      if (!settings) {
        settings = await strapi.entityService.create('api::site-setting.site-setting', {
          data: {
            enableVisitorTracking: true,
            siteName: 'Developer Portfolio',
            siteDescription: 'Personal portfolio website',
            siteUsed: true,
            maxVisitorsPerDay: 10000
          }
        });
      }

      return {
        data: settings || {
          enableVisitorTracking: true,
          siteName: null,
          siteDescription: null,
          siteUsed: true,
          maxVisitorsPerDay: 10000
        }
      };
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

      // singleType이므로 findOne 사용
      const settings = await strapi.entityService.findOne('api::site-setting.site-setting', 1, {
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
      const existingSettings = await strapi.entityService.findMany('api::site-setting.site-setting');
      
      if (existingSettings) {
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
}));
