module.exports = {
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  PORT: process.env.PORT || 8000,
  NODE_ENV:
    process.env.NODE_ENV ||
    'development',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://dunder-mifflin@localhost/spaced_repetition',
  JWT_SECRET:
    process.env.JWT_SECRET ||
    'supersmellystinkyfishfeetandcheese',
  JWT_EXPIRY:
    process.env.JWT_EXPIRY || '3h',
  migrationsDirectory: 'migrations',
  driver: 'pg',
  connectionString:
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_DATABASE_URL
      : process.env.DATABASE_URL,
  ssl: !!process.env.SSL
};
