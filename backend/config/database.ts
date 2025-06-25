export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      connectionString: env('DATABASE_URL'),
      ssl: {
        rejectUnauthorized: false, // Neon DB와 같은 클라우드 DB 연결에 필요
      },
    },
    debug: false,
  },
});