import path from 'path';

export default ({ env }) => {
  // ⭐️ 로컬 환경에서는 SQLite를, 프로덕션 환경에서는 PostgreSQL을 사용합니다.
  if (env('NODE_ENV') === 'production') {
    // Render와 같은 프로덕션 환경 설정ㅁ
    return {
      connection: {
        client: 'postgres',
        connection: {
          connectionString: env('DATABASE_URL'),
          ssl: {
            rejectUnauthorized: env.bool('DATABASE_SSL_SELF_SIGNED', true) ? false : true,
          }
        },
        debug: false,
      },
    };
  }

  // 로컬 개발 환경 설정 (기존과 동일)
  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };
};