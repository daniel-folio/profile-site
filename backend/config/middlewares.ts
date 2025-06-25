export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'] ,
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'], // 여기에 Cloudinary 주소 추가
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'], // 여기에 Cloudinary 주소 추가
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];