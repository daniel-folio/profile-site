// src/config/memory-monitor.ts
interface StrapiLog {
  error: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
}

interface EntityService {
  findOne: (uid: string, id: string | number, options?: any) => Promise<any>;
  // 필요한 다른 메서드들도 여기에 추가할 수 있습니다.
}

interface DBQuery {
  (uid: string): {
    findOne: (params: { 
      where: { id: any },
      populate?: string[] 
    }) => Promise<any>;
  };
}

declare global {
  // eslint-disable-next-line no-var
  var strapi: {
    log: StrapiLog;
    entityService: EntityService;
    db: {
      query: DBQuery;
    };
  };
}

export const startMemoryMonitor = (strapi: any, handleFatalError: (error: Error, origin: string) => void) => {
    // Render 무료 플랜의 메모리는 512MB입니다.
    // 약 90%에 해당하는 450MB를 임계값으로 설정합니다.
    const MEMORY_LIMIT_MB = 450;
  
    // 5분마다 메모리 사용량을 체크합니다.
    const interval = setInterval(() => { // setInterval에 변수를 할당합니다.
      const memoryUsage = process.memoryUsage().rss / (1024 * 1024); // MB 단위로 변환
  
      if (memoryUsage > MEMORY_LIMIT_MB) {
        // 위험 수위 도달 시, 심각한 에러 로그를 남기고 프로세스를 종료합니다.
        clearInterval(interval); // 재시작 전, 더 이상 모니터가 실행되지 않도록 정지
        // 직접 종료하지 않고, 중앙 에러 처리 함수에 보고합니다.
      const error = new Error(
          `🚨 Memory usage high (${memoryUsage.toFixed(2)} MB). Exceeds limit of ${MEMORY_LIMIT_MB} MB. Restarting server...`
        );
        handleFatalError(error, 'Memory Monitor');
        
      } else {
        // 평소에는 조용히 현재 사용량을 추적용으로 로깅합니다 (선택 사항).
        strapi.log.info(`[Memory Monitor] Current usage: ${memoryUsage.toFixed(2)} MB`);
      }
    }, 5 * 60 * 1000); // 5분 = 5 * 60 * 1000ms
  
    strapi.log.info('✅ Intelligent memory monitor started.');
  };