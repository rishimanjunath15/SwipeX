import express from 'express';
import Candidate from '../models/Candidate.js';
import {
  generateQuestion,
  evaluateAnswer,
  generateFinalSummary,
  askForMissingField,
} from '../services/geminiService.js';

const router = express.Router();

/**
 * POST /api/interview-action
 * Handles all interview-related actions:
 * - next_question: Generate next question
 * - submit_answer: Evaluate answer and move to next
 * - submit_field: Save missing field info
 */
router.post('/interview-action', async (req, res) => {
  try {
    const { candidateId, sessionId, action, payload } = req.body;

    // Handle different actions
    switch (action) {
      case 'submit_field':
        return handleSubmitField(req, res);
      
      case 'next_question':
        return handleNextQuestion(req, res);
      
      case 'submit_answer':
        return handleSubmitAnswer(req, res);
      
      default:
        return res.status(400).json({
          error: 'Invalid action. Use: submit_field, next_question, or submit_answer',
        });
    }
  } catch (error) {
    console.error('Interview action error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process interview action',
    });
  }
});

/**
 * Handle submission of missing field
 */
async function handleSubmitField(req, res) {
  const { payload } = req.body;
  const { fieldName, fieldValue } = payload;

  // Simply acknowledge and return success
  // The client will manage the state
  res.json({
    type: 'field_saved',
    field: fieldName,
    value: fieldValue,
    message: `Thank you for providing your ${fieldName}.`,
  });
}

/**
 * Handle generating next question
 */
async function handleNextQuestion(req, res) {
  try {
    const { payload } = req.body;
    const { questionNumber, difficulty, resumeText } = payload;

    // Generate question using Gemini
    const questionData = await generateQuestion(difficulty, questionNumber, resumeText);

    res.json({
      type: 'question',
      ...questionData,
    });
  } catch (error) {
    console.error('Generate question error:', error);
    res.status(503).json({
      error: 'AI service unavailable. Please try again in a moment.',
    });
  }
}

/**
 * Handle answer submission and evaluation
 */
async function handleSubmitAnswer(req, res) {
  try {
    const { payload } = req.body;
    const { questionId, question, answer, difficulty, isLastQuestion } = payload;

    // Evaluate the answer using Gemini
    const evaluation = await evaluateAnswer(question, answer, difficulty);

    // If this is the last question, we'll indicate to move to summary
    if (isLastQuestion) {
      res.json({
        type: 'eval',
        questionId,
        ...evaluation,
        moveToSummary: true,
      });
    } else {
      res.json({
        type: 'eval',
        questionId,
        ...evaluation,
        moveToSummary: false,
      });
    }
  } catch (error) {
    console.error('Evaluate answer error:', error);
    res.status(503).json({
      error: 'AI service unavailable. Please try again in a moment.',
    });
  }
}

/**
 * POST /api/generate-summary
 * Generate final interview summary
 */
router.post('/generate-summary', async (req, res) => {
  try {
    const { questions, candidateName } = req.body;

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        error: 'No questions provided for summary generation',
      });
    }

    // Generate final summary using Gemini
    const summary = await generateFinalSummary(questions, candidateName);

    res.json({
      type: 'final',
      ...summary,
    });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(503).json({
      error: 'AI service unavailable. Please try again in a moment.',
    });
  }
});

export default router;
