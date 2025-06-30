import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'plugin::upload.upload' as any,
  ({ strapi }) => ({
    async upload(ctx) {
      const folder = process.env.CLOUDINARY_FOLDER || '';
      let envPrefix = '';
      if (folder.includes('dev')) {
        envPrefix = 'dev_';
      } else if (folder.includes('prod')) {
        envPrefix = 'prod_';
      } else {
        envPrefix = 'else_';
      }
      strapi.log.info(`[Upload] CLOUDINARY_FOLDER: ${folder}`);
      strapi.log.info(`[Upload] envPrefix: ${envPrefix}`);

      const files: any = ctx.request.files;
      strapi.log.info(`[Upload] files: ${files}`);

      if (files) {
        Object.values(files).forEach((file: any) => {
          strapi.log.info(`[Upload] before: ${file.name}`);
          if (envPrefix && !file.name.startsWith(envPrefix)) {
            file.name = `${envPrefix}${file.name}`;
          }
          strapi.log.info(`[Upload] after: ${file.name}`);
        });
      }

      // 타입 에러 완전 무시 (any로 캐스팅)
      return await (strapi.plugin('upload').controller('upload').upload as any)(ctx);
    },
  })
); 