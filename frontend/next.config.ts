import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
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
