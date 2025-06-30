export default (plugin) => {
  // CLOUDINARY_FOLDER 값에 따라 접두사 결정
  const folder = process.env.CLOUDINARY_FOLDER || '';
  let envPrefix = '';
  if (folder.includes('dev')) {
    envPrefix = 'dev_';
  } else if (folder.includes('prod')) {
    envPrefix = 'prod_';
  } else {
    envPrefix = 'else_';
  }
  console.log('[Upload] CLOUDINARY_FOLDER:', folder);
  console.log('[Upload] envPrefix:', envPrefix);

  // upload 컨트롤러가 존재하는지 확인
  if (!plugin.controllers || !plugin.controllers.upload || typeof plugin.controllers.upload.upload !== 'function') {
    console.error('[Upload] plugin.controllers.upload.upload is undefined!');
    return plugin;
  }

  const originalUpload = plugin.controllers.upload.upload;

  plugin.controllers.upload.upload = async (ctx) => {
    const files: any = ctx.request.files;
    console.log('[Upload] files:', files);

    if (files) {
      Object.values(files).forEach((file: any) => {
        console.log('[Upload] before:', file.name);
        if (envPrefix && !file.name.startsWith(envPrefix)) {
          file.name = `${envPrefix}${file.name}`;
        }
        console.log('[Upload] after:', file.name);
      });
    }

    return await originalUpload(ctx);
  };

  return plugin;
};
