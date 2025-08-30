// import type { Core } from '@strapi/strapi';
// src/index.ts
import { startMemoryMonitor } from './config/memory-monitor'; // 모니터 함수 불러오기
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

    // 전역 헬스 체크 라우트 등록
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
          method: 'GET',
          path: '/uptimerobot',
          handler: (ctx: any) => {
            ctx.status = 200;
            ctx.body = { ok: true };
          },
          config: { auth: false },
        },
        {
          method: 'GET',
          path: '/restart-server', // 재시작을 위한 경로
          handler: (ctx: any) => {
            // 쿼리 파라미터로 전달된 시크릿 키를 확인합니다.
            if (ctx.query.secret === process.env.RESTART_SECRET_KEY) {
              ctx.send({ message: 'Server restarting...' });
              strapi.log.info('🔄 Received valid restart command. Restarting server...');
              // 1초 후 프로세스를 종료하여 Render가 자동으로 재시작하도록 유도
              setTimeout(() => process.exit(0), 1000);
            } else {
              // 시크릿 키가 없거나 틀리면 403 Forbidden 에러를 보냅니다.
              ctx.forbidden('Invalid secret key.');
            }
          },
          config: { auth: false },
        },
      ]);
      try { strapi.log.info('✅ Global /healthz route registered (GET/HEAD)'); } catch {}
    } catch (e) {
      try { strapi.log.warn('⚠️ Failed to register /healthz route'); } catch {}
    }
    startMemoryMonitor(); // 애플리케이션 시작과 함께 메모리 감시 시작
  },
};
