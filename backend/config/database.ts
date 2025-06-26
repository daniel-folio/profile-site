import path from 'path';

export default ({ env }) => {
  // 프로덕션 환경(Render)에서는 PostgreSQL(Neon)을 사용합니다.
  if (env('NODE_ENV') === 'production') {
    return {
      connection: {
        client: 'postgres',
        connection: {
          connectionString: env('DATABASE_URL'),
          ssl: { rejectUnauthorized: false },
        },
        debug: false,
      },
    };
  }
  // 그 외, 로컬 개발 환경에서는 SQLite를 사용합니다.
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