/**
 * visitor router
 */

export default {
  routes: [
    // 커스텀 통계 라우트 (먼저 정의해야 함)
    {
      method: 'GET',
      path: '/visitors/stats',
      handler: 'visitor.getStats',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 지오 집계 라우트
    {
      method: 'GET',
      path: '/visitors/geo',
      handler: 'visitor.getGeo',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 기본 CRUD 라우트
    {
      method: 'POST',
      path: '/visitors',
      handler: 'visitor.create',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/visitors',
      handler: 'visitor.find',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/visitors/:id',
      handler: 'visitor.findOne',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
