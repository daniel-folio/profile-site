export default ({ env }) => ({
    upload: {
      config: {
        provider: 'cloudinary',
        providerOptions: {
          cloud_name: env('CLOUDINARY_NAME'),
          api_key: env('CLOUDINARY_KEY'),
          api_secret: env('CLOUDINARY_SECRET'),
          folder: env('CLOUDINARY_FOLDER'), // ⭐️ 개발용 이미지 폴더를 추가합니다.
        },
        actionOptions: {
          upload: {},
          delete: {},
        },
      },
    },
  });
