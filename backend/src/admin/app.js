// 파비콘 임포트
import favicon from './extensions/favicon.png';

export default {
  config: {
    // Strapi Admin 설정
    locales: ['ko'],
    // 어드민 패널 파비콘 연결
    head: {
      favicon: favicon,
    },
  },
  bootstrap(app) {
    console.log(app);
  },
};
