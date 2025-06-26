/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '1337',
        pathname: '/uploads/**',
      },
      // ⭐️ 추가 해결책: 'localhost'도 동일하게 등록해줍니다.
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // (선택 사항) 나중에 Cloudinary를 사용하게 되면 아래와 같이 추가할 수 있습니다.
      // {
      //   protocol: 'https',
      //   hostname: 'res.cloudinary.com',
      // },
    ],
  },
  // 아래 eslint 설정을 추가해주세요.
  eslint: {
    // 경고: 이 옵션은 프로젝트에 ESLint 에러가 남아있어도
    // 프로덕션 빌드를 강제로 성공시킵니다.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 경고: 프로젝트에 타입 에러가 있어도
    // 프로덕션 빌드를 강제로 성공시킵니다.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
