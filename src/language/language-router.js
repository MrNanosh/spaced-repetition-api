const express = require('express');
const LanguageService = require('./language-service');
const {
  requireAuth
} = require('../middleware/jwt-auth');
const jsonParser = express.json();

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
  jsonParser,
  async (req, res, next) => {
    const headId = req.language.head;
    const lang = req.language.id;
    const db = req.app.get('db');
    //take the guess off of the res.body
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
    let correctAnswer = await LanguageService.getCorrectAnswer(
      db,
      headId
    );
    correctAnswer =
      correctAnswer.translation;
    //update appropriate values in the database

    let {
      total_score
    } = await LanguageService.getUsersLanguage(
      db,
      req.user.id
    );

    const headWord = await LanguageService.getWordById(
      db,
      headId
    );
    let nextWord = headWord;
    const tail = await LanguageService.getTail(
      db,
      lang
    );
    let correctCount;
    let incorrectCount;

    //compare the values
    if (guess === correctAnswer) {
      try {
        let {
          memory_value,
          correct_count,
          incorrect_count
        } = headWord;
        //update fields for correct answers
        let updateFields = {
          memory_value:
            2 * memory_value,
          correct_count: ++correct_count,
          next: null //put to the end
        };

        await LanguageService.updateWord(
          db,
          headId,
          updateFields
        );

        await LanguageService.updateWord(
          db,
          tail.id,
          { next: headId }
        );
        total_score++;
        correctCount = correct_count;
        incorrectCount = incorrect_count;
      } catch (error) {}
    } else {
      //if they get the answer wrong
      nextWord = await LanguageService.getWordById(
        db,
        nextWord.next
      );
      let {
        incorrect_count,
        correct_count,
        memory_value,
        id
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
        incorrect_count: ++incorrect_count,
        next: nextWord.next //change head to point to next of the old next word
      };
      await LanguageService.updateWord(
        db,
        headId,
        updateFieldsOfOldHead
      );
      correctCount = correct_count;
      incorrectCount = incorrect_count;
    }

    //update the total score and the head
    await LanguageService.updateLanguage(
      db,
      lang,
      {
        total_score,
        head: headWord.next
      }
    );

    //respond with the correct count and incorrect count and total score, and maybe correct answer
    res.json({
      correctCount,
      incorrectCount,
      totalScore: total_score,
      correctAnswer
    });
  }
);

module.exports = languageRouter;
