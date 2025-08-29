// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // 방문자 API에 대한 퍼블릭 권한 자동 설정
    try {
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (publicRole) {
        const permissions = await strapi
          .query('plugin::users-permissions.permission')
          .findMany({
            where: {
              role: publicRole.id,
              action: ['api::visitor.visitor.create', 'api::visitor.visitor.find', 'api::visitor.visitor.getStats'],
            },
          });

        // 방문자 create 권한 설정
        const createPermission = permissions.find(p => p.action === 'api::visitor.visitor.create');
        if (createPermission && !createPermission.enabled) {
          await strapi
            .query('plugin::users-permissions.permission')
            .update({
              where: { id: createPermission.id },
              data: { enabled: true },
            });
          console.log('✅ 방문자 create 권한이 활성화되었습니다.');
        }

        // 방문자 find 권한 설정 (통계용)
        const findPermission = permissions.find(p => p.action === 'api::visitor.visitor.find');
        if (findPermission && !findPermission.enabled) {
          await strapi
            .query('plugin::users-permissions.permission')
            .update({
              where: { id: findPermission.id },
              data: { enabled: true },
            });
          console.log('✅ 방문자 find 권한이 활성화되었습니다.');
        }

        // 방문자 getStats 권한 설정 (통계 API용)
        const getStatsPermission = permissions.find(p => p.action === 'api::visitor.visitor.getStats');
        if (getStatsPermission && !getStatsPermission.enabled) {
          await strapi
            .query('plugin::users-permissions.permission')
            .update({
              where: { id: getStatsPermission.id },
              data: { enabled: true },
            });
          console.log('✅ 방문자 getStats 권한이 활성화되었습니다.');
        }
      }
    } catch (error) {
      console.error('방문자 API 권한 설정 중 오류:', error);
    }

    // 전역 헬스 체크 라우트 등록 (/healthz)
    try {
      strapi.server.routes([
        {
          method: 'GET',
          path: '/git-wakeupbot',
          handler: (ctx: any) => {
            ctx.status = 200;
            ctx.body = { ok: true };
          },
          config: { auth: false },
        },
        {
          method: 'GET',
          path: '/cron-job',
          handler: (ctx: any) => {
            ctx.status = 200;
            ctx.body = { ok: true };
          },
          config: { auth: false },
        },
        {
          method: 'HEAD',
          path: '/uptimerobot',
          handler: (ctx: any) => {
            ctx.status = 200;
          },
          config: { auth: false },
        },
      ]);
      try { strapi.log.info('✅ Global /healthz route registered (GET/HEAD)'); } catch {}
    } catch (e) {
      try { strapi.log.warn('⚠️ Failed to register /healthz route'); } catch {}
    }
  },
};
