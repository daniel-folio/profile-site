/**
 * app-log custom routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/app-logs',
      handler: 'app-log.find',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/app-logs/stats',
      handler: 'app-log.getStats',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/app-logs/cleanup',
      handler: 'app-log.cleanup',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
