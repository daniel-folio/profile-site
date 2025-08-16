/**
 * visitor service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::visitor.visitor', ({ strapi }) => ({
  // IP 주소로부터 지역 정보 추출 (간단한 구현)
  async getLocationFromIP(ipAddress: string) {
    try {
      // 실제 운영 환경에서는 IP 지역 정보 API 사용 (예: ipapi.co, geoip 등)
      // 여기서는 기본 구현만 제공
      if (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress.startsWith('192.168.')) {
        return {
          country: 'Local',
          city: 'Local',
        };
      }
      
      // 외부 IP인 경우 기본값 반환 (실제로는 GeoIP API 호출)
      return {
        country: 'Unknown',
        city: 'Unknown',
      };
    } catch (error) {
      console.error('IP 지역 정보 조회 오류:', error);
      return {
        country: 'Unknown',
        city: 'Unknown',
      };
    }
  },

  // 세션 ID 생성
  generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  // 방문자 데이터 정리 (오래된 데이터 삭제)
  async cleanupOldVisitors(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // deleteMany 대신 직접 DB 쿼리 사용
      const deletedCount = await strapi.db.query('api::visitor.visitor').deleteMany({
        where: {
          visitedAt: {
            $lt: cutoffDate,
          },
        },
      });

      console.log(`${deletedCount}개의 오래된 방문자 기록을 삭제했습니다.`);
      return deletedCount;
    } catch (error) {
      console.error('방문자 데이터 정리 오류:', error);
      throw error;
    }
  },
}));
