module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV:
    process.env.NODE_ENV ||
    'development',
  DB_URL:
    process.env.DB_URL ||
    'postgresql://dunder-mifflin@localhost/spaced_repetition',
  JWT_SECRET:
    process.env.JWT_SECRET ||
    'supersmellystinkyfishfeetandcheese',
  JWT_EXPIRY:
<<<<<<< HEAD
    process.env.JWT_EXPIRY || '3h'
=======
    process.env.JWT_EXPIRY || '3h',
 
>>>>>>> 8e37aab5e108ff55cef20713c1f8226d0bb348e0
};
