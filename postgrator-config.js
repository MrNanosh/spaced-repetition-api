require('dotenv').config();

module.exports = {
  "migrationsDirectory": "migrations",
  "driver": "pg",
<<<<<<< HEAD
  "host": process.env.MIGRATION_DB_HOST,
  "port": process.env.MIGRATION_DB_PORT,
  "database": process.env.MIGRATION_DB_NAME,
  "username": process.env.MIGRATION_DB_USER,
  "password": process.env.MIGRATION_DB_PASS
}
=======
  "host": process.env.MIGRATION_DATABASE_HOST,
  "port": process.env.MIGRATION_DATABASE_PORT,
  "database": process.env.MIGRATION_DATABASE_NAME,
  "username": process.env.MIGRATION_DATABASE_USER,
  "password": process.env.MIGRATION_DATABASE_PASS,
  "connectionString":
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_DATABASE_URL
      : process.env.DATABASE_URL,
  ssl: !!process.env.SSL
};
>>>>>>> 8e37aab5e108ff55cef20713c1f8226d0bb348e0
