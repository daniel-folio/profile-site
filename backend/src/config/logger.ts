import winston from 'winston';
import SlackWebhookTransport from 'winston-slack-webhook-transport';

// 로그 포맷 정의
const { combine, timestamp, printf, colorize } = winston.format;
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// 로거 생성
const logger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // 1. 파일로 로그 기록 (에러만)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // 2. 파일로 로그 기록 (모든 레벨)
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
    // 3. 슬랙으로 알림 전송 ('error' 레벨 이상만)
    new SlackWebhookTransport({
      level: 'error',
      webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
      formatter: (info: any) => {
        const message = info.message;
        let title = '🚨 Strapi 서버 에러 발생!';
        if (message.includes('[Memory Monitor]')) {
          title = '📈 메모리 임계값 초과!';
        } else if (message.includes('[Uncaught Exception]')) {
          title = '🐞 처리되지 않은 코드 에러 발생!';
        } else if (message.includes('[Unhandled Rejection]')) {
          title = ' PROMISE 에러 발생!';
        }

        return {
          text: `${title}\n\`\`\`${message}\`\`\``,
        };
      },
    }),
  ],
  // 처리되지 않은 예외(서버 다운의 원인)를 별도 파일에 기록
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
});

// 개발 환경에서는 콘솔에도 로그를 출력
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    })
  );
}

module.exports = logger;
