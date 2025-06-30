export default (plugin) => {
  // CLOUDINARY_FOLDER 값에 따라 접두사 결정
  const folder = process.env.CLOUDINARY_FOLDER || '';
  let envPrefix = '';
  if (folder.includes('dev')) {
    envPrefix = 'dev_';
  } else if (folder.includes('prod')) {
    envPrefix = 'prod_';
  } else {
    envPrefix = 'else_'; // 기본값
  }

  const originalUpload = plugin.controllers.upload.upload;

  plugin.controllers.upload.upload = async (ctx) => {
    const files: any = ctx.request.files;

    if (files) {
      Object.values(files).forEach((file: any) => {
        if (!file.name.startsWith(envPrefix)) {
          file.name = `${envPrefix}${file.name}`;
        }
      });
    }

    return await originalUpload(ctx);
  };

  return plugin;
};
