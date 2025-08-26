/**
 * site-setting custom routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/site-settings/public',
      handler: 'site-setting.find',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/site-settings/validate-password',
      handler: 'site-setting.validatePassword',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/site-settings/create-default',
      handler: 'site-setting.createDefaultSettings',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/site-settings/debug-summary',
      handler: 'site-setting.debugSummary',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/site-settings/merge-duplicates',
      handler: 'site-setting.mergeDuplicates',
      config: { auth: false, policies: [], middlewares: [] },
    },
    // 편의상 GET도 지원 (브라우저로 직접 호출 가능)
    {
      method: 'GET',
      path: '/site-settings/merge-duplicates',
      handler: 'site-setting.mergeDuplicates',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
