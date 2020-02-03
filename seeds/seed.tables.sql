BEGIN;
TRUNCATE "word", "language", "user";
INSERT INTO "user" ("id", "username", "name", "password")
  VALUES (1, 'admin', 'jonathan Admin',
    -- password = "password"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG');
VALUES (1,
  'Spanish',
  1);
INSERT INTO "word" ("id", "language_id", "original", "translation", "next")
  VALUES (1, 1, 'hola', 'hello', 2), (2, 1, 'práctica ', 'practice', 3), (3, 1, 'desarrolladora', 'developer', 4), (4, 1, 'traducir', 'translate', 5), (5, 1, 'increíble', 'amazing', 6), (6, 1, 'casa', 'house', 7), (7, 1, 'idioma', 'language', 8), (8, 1, 'charla', 'chat', 9), (9, 1, 'fuegos artificiales', 'fireworks', 10), (10, 1, 'bicicleta', 'bicycle', NULL);
UPDATE
  "language"
SET
  head = 1
WHERE
  id = 1;
-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting

SELECT
  setval('word_id_seq', (
      SELECT
        MAX(id)
      FROM "word"));
SELECT
  setval('language_id_seq', (
      SELECT
        MAX(id)
      FROM "language"));
SELECT
  setval('user_id_seq', (
      SELECT
        MAX(id)
      FROM "user"));
COMMIT;

