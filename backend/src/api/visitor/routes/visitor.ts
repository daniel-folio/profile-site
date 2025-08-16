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
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/visitors',
      handler: 'visitor.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/visitors/:id',
      handler: 'visitor.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
