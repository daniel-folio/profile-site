module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if (
      ctx.request.files &&
      ctx.request.url.startsWith('/api/upload')
    ) {
      const folder = process.env.CLOUDINARY_FOLDER || '';
      let envPrefix = '';
      if (folder.includes('dev')) envPrefix = 'dev_';
      else if (folder.includes('prod')) envPrefix = 'prod_';
      else envPrefix = 'else_';

      strapi.log.info(`[Upload-MW] CLOUDINARY_FOLDER: ${folder}`);
      strapi.log.info(`[Upload-MW] envPrefix: ${envPrefix}`);

      Object.values(ctx.request.files).forEach((file: any) => {
        strapi.log.info(`[Upload-MW] before: ${file.name}`);
        if (!file.name.startsWith(envPrefix)) {
          file.name = `${envPrefix}${file.name}`;
        }
        strapi.log.info(`[Upload-MW] after: ${file.name}`);
      });
    }
    await next();
  };
}; 