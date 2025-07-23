import path from 'path';
const parse = require('pg-connection-string').parse;

export default ({ env }) => {
   // DATABASE_URL 환경 변수가 존재할 경우 (배포 서버 실행 시)
  if (env('DATABASE_URL')) {
    const config = parse(env('DATABASE_URL'));
    return {
      connection: {
        client: 'postgres',
        connection: {
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.user,
          password: config.password,
          ssl: {
            rejectUnauthorized: false,
          },
        },
        debug: false,
      },
    };
  }

  // DATABASE_URL 환경 변수가 없을 경우 (로컬 또는 빌드 시)
  // 로컬에서는 .env 파일의 SQLite 설정을, 빌드 시에는 가짜 설정으로 사용
  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: path.join(
          __dirname,
          '..',
          '..',
          env('DATABASE_FILENAME', '.tmp/data.db')
        ),
      },
      useNullAsDefault: true,
    },
  };
};