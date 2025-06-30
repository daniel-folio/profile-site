export default ({ env }) => {
  // ⭐️ 최후의 수단 1: Render 서버 로그에 환경 변수 값을 직접 출력합니다.
  const cloudinaryFolder = env('CLOUDINARY_FOLDER');
  console.log(`[DEBUG] CLOUDINARY_FOLDER value is: ${cloudinaryFolder}`);

  return {
    upload: {
      config: {
        provider: 'cloudinary',
        providerOptions: {
          cloud_name: env('CLOUDINARY_NAME'),
          api_key: env('CLOUDINARY_KEY'),
          api_secret: env('CLOUDINARY_SECRET'),
          // ⭐️ 최후의 수단 2: 읽어온 변수 값을 사용합니다.
          ...(cloudinaryFolder && { folder: cloudinaryFolder }),
        },
        actionOptions: {
          upload: {},
          delete: {},
        },
      },
    },
  };
};