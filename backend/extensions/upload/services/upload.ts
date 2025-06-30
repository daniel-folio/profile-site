// 커스텀 업로드 서비스 구현을 위한 코드 예시
// 위치: backend/extensions/upload/services/upload.ts

import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export default ({ strapi }) => ({
  async upload(file) {
    const folder = process.env.CLOUDINARY_FOLDER || 'default_folder';
    const tempFilePath = path.join(__dirname, '../../../tmp', file.name);

    // 파일 저장
    fs.writeFileSync(tempFilePath, Buffer.from(file.buffer));

    // 업로드
    const result = await cloudinary.v2.uploader.upload(tempFilePath, {
      folder,
    });

    // 임시 파일 삭제
    fs.unlinkSync(tempFilePath);

    return {
      url: result.secure_url,
      provider_metadata: {
        public_id: result.public_id,
        resource_type: result.resource_type,
      },
    };
  },

  async uploadStream(file) {
    const folder = process.env.CLOUDINARY_FOLDER || 'default_folder';
    if (!file || !file.stream) {
      throw new Error('No file stream provided for upload.');
    }
    return new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            provider_metadata: {
              public_id: result.public_id,
              resource_type: result.resource_type,
            },
          });
        }
      );
      file.stream.pipe(stream);
    });
  },

  async delete(file) {
    if (!file || !file.provider_metadata || !file.provider_metadata.public_id) {
      throw new Error('No public_id provided for deletion.');
    }
    return cloudinary.v2.uploader.destroy(file.provider_metadata.public_id);
  },
}); 