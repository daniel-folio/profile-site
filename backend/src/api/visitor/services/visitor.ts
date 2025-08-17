/**
 * visitor service
 */

import { factories } from '@strapi/strapi';

// NOTE: 타입 충돌을 피하기 위해 any 캐스팅을 사용합니다. (Strapi 타입 정의 버전차 보정)
export default factories.createCoreService('api::visitor.visitor' as any, ({ strapi }: any) => ({
  // 간단한 메모리 캐시 (TTL)
  __geoCache: new Map<string, { data: any; exp: number }>(),

  // IP 주소로부터 지역 정보 추출 (무료 API, ipapi.co) + 캐시
  async getLocationFromIP(ipAddress: string) {
    try {
      const now = Date.now();
      const ttlMs = 24 * 60 * 60 * 1000; // 24h

      // 로컬/사설 IP는 조회하지 않음
      const isPrivate =
        ipAddress === '127.0.0.1' ||
        ipAddress === '::1' ||
        ipAddress.startsWith('10.') ||
        ipAddress.startsWith('192.168.') ||
        ipAddress.startsWith('172.16.') ||
        ipAddress.startsWith('172.17.') ||
        ipAddress.startsWith('172.18.') ||
        ipAddress.startsWith('172.19.') ||
        ipAddress.startsWith('172.2') ||
        ipAddress.startsWith('169.254.') ||
        ipAddress.startsWith('100.64.');

      if (isPrivate) {
        return {
          continent: 'Local',
          countryCode: '',
          country: 'Local',
          region: '',
          regionCode: '',
          city: 'Local',
          district: '',
          latitude: null,
          longitude: null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
          asn: '',
          isp: 'Local',
        };
      }

      const cached = this.__geoCache.get(ipAddress);
      if (cached && cached.exp > now) return cached.data;

      // ipapi.co 무료 엔드포인트 (키 없이 사용 가능, 제한 존재)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const url = `https://ipapi.co/${encodeURIComponent(ipAddress)}/json/`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`GeoIP fetch failed: ${res.status}`);
      const j: any = await res.json();

      const data = {
        continent: j.continent_code || '',
        countryCode: j.country_code || '',
        country: j.country_name || '',
        region: j.region || j.region_code || '',
        regionCode: j.region_code || '',
        city: j.city || '',
        district: '',
        latitude: typeof j.latitude === 'number' ? j.latitude : parseFloat(j.latitude) || null,
        longitude: typeof j.longitude === 'number' ? j.longitude : parseFloat(j.longitude) || null,
        timezone: j.timezone || '',
        asn: (j.asn || '').toString(),
        isp: j.org || j.org_name || '',
      };

      this.__geoCache.set(ipAddress, { data, exp: now + ttlMs });
      return data;
    } catch (error) {
      console.error('IP 지역 정보 조회 오류:', error);
      return {
        continent: '',
        countryCode: '',
        country: 'Unknown',
        region: '',
        regionCode: '',
        city: 'Unknown',
        district: '',
        latitude: null,
        longitude: null,
        timezone: '',
        asn: '',
        isp: '',
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
