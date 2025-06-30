export default ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
        // ⭐️ 최후의 수단: Strapi의 env() 함수 대신 Node.js의 process.env를 직접 사용합니다.
        //    이 방법은 환경 변수를 읽어오는 가장 확실하고 직접적인 방법입니다.
        folder: process.env.CLOUDINARY_FOLDER,
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
    },
  },
});