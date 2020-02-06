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
        error:
          "Missing 'guess' in request body"
      });
    }
    //get the translation  off of the head's value
    let answer = await LanguageService.getCorrectAnswer(
      db,
      headId
    );
    answer = answer.translation;
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
    let nextWord = await LanguageService.getWordById(
      db,
      headWord.next
    );
    let nextHead = nextWord;
    const tail = await LanguageService.getTail(
      db,
      lang
    );
    let wordCorrectCount;
    let wordIncorrectCount;
    let isCorrect = false;

    //compare the values
    if (guess === answer) {
      isCorrect = true;
      try {
        let {
          memory_value,
          correct_count,
          incorrect_count
        } = headWord;

        const memVal = 2 * memory_value;
        let counter = 1;

        while (
          nextWord.next &&
          counter !== memVal
        ) {
          nextWord = await LanguageService.getWordById(
            db,
            nextWord.next
          );
          console.log(counter);
          counter++;
        }
        console.log(counter);
        //update fields for correct answers
        let updateFields = {
          memory_value: memVal,
          correct_count: ++correct_count,
          next: nextWord.next //put to the end
        };

        await LanguageService.updateWord(
          db,
          headId,
          updateFields
        );

        await LanguageService.updateWord(
          db,
          nextWord.id,
          { next: headId }
        );
        total_score++;
        wordCorrectCount = correct_count;
        wordIncorrectCount = incorrect_count;
      } catch (error) {}
    } else {
      //if they get the answer wrong

      //change the next word next to head
      let updateFields = {
        next: headId //old head goes after
      };
      await LanguageService.updateWord(
        db,
        nextWord.id,
        updateFields
      );

      //update the next of the old head
      let updateFieldsOfOldHead = {
        memory_value: 1,
        incorrect_count: ++headWord.incorrect_count,
        next: nextWord.next //change head to point to next of the old next word
      };
      await LanguageService.updateWord(
        db,
        headId,
        updateFieldsOfOldHead
      );
      wordCorrectCount =
        headWord.correct_count;
      wordIncorrectCount =
        headWord.incorrect_count;
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
      wordCorrectCount:
        nextHead.correct_count,
      wordIncorrectCount:
        nextHead.incorrect_count,
      nextWord: nextHead.original,
      isCorrect,
      totalScore: total_score,
      answer
    });
  }
);

module.exports = languageRouter;
