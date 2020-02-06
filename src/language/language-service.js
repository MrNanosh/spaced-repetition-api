const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where(
        'language.user_id',
        user_id
      )
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });
  },

  getLanguageHead(db, head_id) {
    return db
      .from('word as w')
      .join(
        'language as l',
        'l.head',
        '=',
        'w.id'
      )
      .select(
        'w.original as nextWord', //nextWord
        'w.correct_count as wordCorrectCount', //wordCorrectCount
        'w.incorrect_count as wordIncorrectCount', //wordIncorrectCount
        'l.total_score as totalScore' //totalScore needed from language
      )
      .where({ 'w.id': head_id })
      .first();
  },
  getCorrectAnswer(db, head_id) {
    return db('word')
      .where({ id: head_id })
      .select('translation')
      .first();
  },
  getTail(db, language_id) {
    return db('word')
      .where({
        language_id,
        next: null
      })
      .first();
  },
  getWordById(db, id) {
    return db('word')
      .where({ id })
      .first();
  },
  updateWord(db, id, wordToUpdate) {
    return db('words')
      .where({ id })
      .update(wordToUpdate);
  },
  updateLanguage(
    db,
    id,
    fieldsToUpdate
  ) {
    return db('language')
      .where({ id })
      .update(fieldsToUpdate);
  }
};

module.exports = LanguageService;
