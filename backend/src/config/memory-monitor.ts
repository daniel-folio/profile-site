// src/config/memory-monitor.ts
interface StrapiLog {
  fatal: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
}

declare global {
  // eslint-disable-next-line no-var
  var strapi: {
    log: StrapiLog;
  };
}

export const startMemoryMonitor = () => {
    // Render 무료 플랜의 메모리는 512MB입니다.
    // 약 90%에 해당하는 450MB를 임계값으로 설정합니다.
    const MEMORY_LIMIT_MB = 450;
  
    // 5분마다 메모리 사용량을 체크합니다.
    setInterval(() => {
      const memoryUsage = process.memoryUsage().rss / (1024 * 1024); // MB 단위로 변환
  
      if (memoryUsage > MEMORY_LIMIT_MB) {
        // 위험 수위 도달 시, 심각한 에러 로그를 남기고 프로세스를 종료합니다.
        strapi.log.fatal(
          `🚨 Memory usage high (${memoryUsage.toFixed(2)} MB). Exceeds limit of ${MEMORY_LIMIT_MB} MB. Restarting server...`
        );
        process.exit(1); // 프로세스 종료 -> Render가 자동으로 재시작
      } else {
        // 평소에는 조용히 현재 사용량을 추적용으로 로깅합니다 (선택 사항).
        strapi.log.info(`[Memory Monitor] Current usage: ${memoryUsage.toFixed(2)} MB`);
      }
    }, 5 * 60 * 1000); // 5분 = 5 * 60 * 1000ms
  
    strapi.log.info('✅ Intelligent memory monitor started.');
  };