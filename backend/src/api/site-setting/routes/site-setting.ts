/**
 * site-setting router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::site-setting.site-setting', {
  config: {
    find: {
      auth: false, // 공개 접근 허용
      policies: [],
      middlewares: [],
    },
    findOne: {
      auth: false,
      policies: [],
      middlewares: [],
    },
    create: {
      auth: false, // 초기 설정용
      policies: [],
      middlewares: [],
    },
    update: {
      auth: false, // Strapi Admin에서 관리
      policies: [],
      middlewares: [],
    },
    delete: {
      auth: false,
      policies: [],
      middlewares: [],
    },
  },
});
