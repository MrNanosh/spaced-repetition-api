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
      .where({ 'w.id': head_id });
  }
};

module.exports = LanguageService;
