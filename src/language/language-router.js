const express = require('express');
const LanguageService = require('./language-service');
const {
  requireAuth
} = require('../middleware/jwt-auth');

const languageRouter = express.Router();

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id
      );

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`
        });

      req.language = language;
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter.get(
  '/',
  async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id
      );

      res.json({
        language: req.language,
        words
      });
      next();
    } catch (error) {
      next(error);
    }
  }
);

languageRouter.get(
  '/head',
  async (req, res, next) => {
    try {
      const headId = req.language.head;
      const head = await LanguageService.getLanguageHead(
        req.app.get('db'),
        headId
      );
      res.json(head);

      next();
    } catch (error) {
      next(error);
    }
  }
);

languageRouter.post(
  '/guess',
  async (req, res, next) => {
    const headId = req.language.head;
    const lang = req.language.id;
    const db = req.app.get('db');
    //take the guess off of the res.body
    console.log(req);
    const { guess } = req.body;
    //validate
    if (!guess) {
      return res.status(400).json({
        error: {
          message: `Bad Request: doesn't have guess`
        }
      });
    }
    //get the translation  off of the head's value
    const correctAnswer = await LanguageService.getCorrectAnswer(
      db,
      headId
    );
    //update appropriate values in the database

    const {
      total_score
    } = await LanguageService.getUsersLanguage(
      db,
      req.user.id
    );

    const nextWord = await LanguageService.getWordById(
      db,
      headId
    );
    //compare the values
    if (guess === correctAnswer) {
      try {
        const tail = await LanguageService.getTail(
          db,
          lang
        );
        const {
          memory_value,
          correct_count,
          incorrect_count
        } = tail;

        //update fields for correct answers
        let updateFields = {
          memory_value:
            2 * memory_value,
          correct_count: ++correct_count,
          next: null //put to the end
        };

        await LanguageService.updateWord(
          db,
          tail.id,
          updateFields
        );
        total_score++;
      } catch (error) {}
    } else {
      //if they get the answer wrong

      const {
        incorrect_count,
        correct_count,
        memory_value,
        id,
        next
      } = nextWord;
      //change the next word next to head
      let updateFields = {
        next: headId //old head goes after
      };
      await LanguageService.updateWord(
        db,
        id,
        updateFields
      );

      //update the next of the old head
      let updateFieldsOfOldHead = {
        memory_value: 1,
        incorrect_count: ++correct_count,
        next: next //change head to point to next of the old next word
      };
      await LanguageService.updateWord(
        db,
        headId,
        updateFieldsOfOldHead
      );
    }

    //update the total score and the head
    await LanguageService.updateLanguage(
      db,
      lang,
      {
        total_score,
        head: nextWord.id
      }
    );

    //respond with the correct count and incorrect count and total score, and maybe correct answer
    res.json({
      correctCount: correct_count,
      incorrectCount: incorrect_count,
      totalScore: total_score,
      correctAnswer
    });
  }
);

module.exports = languageRouter;
