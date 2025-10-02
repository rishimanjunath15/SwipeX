import { createSlice } from '@reduxjs/toolkit';

/**
 * Interview Slice
 * Manages the state of the ongoing interview session
 */
const initialState = {
  // Interview status
  status: 'idle', // 'idle', 'uploading', 'collecting-fields', 'interviewing', 'completed', 'error'
  
  // Resume data
  resumeText: '',
  
  // Questions array
  questions: [], // Array of { questionId, difficulty, question, answer, score, feedback, timeLimit, timeTaken }
  currentQuestionIndex: 0,
  
  // Current question state
  currentAnswer: '',
  timeRemaining: null, // seconds remaining for current question
  
  // Missing fields
  missingFields: [],
  
  // Final results
  totalScore: 0,
  summary: '',
  breakdown: [],
  
  // Error handling
  error: null,
  retryCount: 0,
  
  // Session tracking
  sessionId: null,
  startTime: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    // Set interview status
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    
    // Store resume text after upload
    setResumeText: (state, action) => {
      state.resumeText = action.payload;
    },
    
    // Set missing fields that need to be collected
    setMissingFields: (state, action) => {
      state.missingFields = action.payload;
    },
    
    // Remove a field from missing fields when collected
    removeFieldFromMissing: (state, action) => {
      state.missingFields = state.missingFields.filter(f => f !== action.payload);
    },
    
    // Add a new question to the array
    addQuestion: (state, action) => {
      // CRITICAL: Prevent duplicate questions
      const newQuestion = action.payload;
      const exists = state.questions.some(q => q.questionId === newQuestion.questionId);
      
      if (exists) {
        console.error('❌ Attempted to add duplicate question:', newQuestion.questionId);
        return;
      }
      
      // CRITICAL: Prevent adding more than 6 questions
      if (state.questions.length >= 6) {
        console.error('❌ Attempted to add question beyond limit. Current count:', state.questions.length);
        return;
      }
      
      console.log(`✅ Adding question ${newQuestion.questionId} to Redux (${state.questions.length + 1}/6)`);
      state.questions.push(newQuestion);
    },
    
    // Update current question answer
    setCurrentAnswer: (state, action) => {
      state.currentAnswer = action.payload;
    },
    
    // Update answer for a specific question
    updateQuestionAnswer: (state, action) => {
      const { questionId, answer, timeTaken } = action.payload;
      const question = state.questions.find(q => q.questionId === questionId);
      if (question) {
        question.answer = answer;
        question.timeTaken = timeTaken;
      }
    },
    
    // Update question with evaluation results
    updateQuestionEvaluation: (state, action) => {
      const { questionId, score, feedback } = action.payload;
      const question = state.questions.find(q => q.questionId === questionId);
      if (question) {
        question.score = score;
        question.feedback = feedback;
      }
    },
    
    // Move to next question
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < 5) { // Allow incrementing up to index 5 (6th question)
        state.currentQuestionIndex += 1;
        state.currentAnswer = '';
        state.timeRemaining = state.questions[state.currentQuestionIndex]?.timeLimit || null;
      }
    },
    
    // Set time remaining for current question
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    
    // Decrease time by 1 second (for timer ticks)
    decrementTime: (state) => {
      if (state.timeRemaining !== null && state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },
    
    // Set final results
    setFinalResults: (state, action) => {
      const { totalScore, summary, breakdown } = action.payload;
      state.totalScore = totalScore;
      state.summary = summary;
      state.breakdown = breakdown;
      state.status = 'completed';
    },
    
    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.status = 'error';
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
      if (state.status === 'error') {
        state.status = 'idle';
      }
    },
    
    // Increment retry count
    incrementRetry: (state) => {
      state.retryCount += 1;
    },
    
    // Reset retry count
    resetRetry: (state) => {
      state.retryCount = 0;
    },
    
    // Start new interview session
    startInterview: (state, action) => {
      state.sessionId = action.payload.sessionId || Date.now().toString();
      state.startTime = Date.now();
      state.status = 'interviewing';
      state.currentQuestionIndex = 0;
      state.currentAnswer = '';
    },
    
    // Reset interview (start over)
    resetInterview: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  setStatus,
  setResumeText,
  setMissingFields,
  removeFieldFromMissing,
  addQuestion,
  setCurrentAnswer,
  updateQuestionAnswer,
  updateQuestionEvaluation,
  nextQuestion,
  setTimeRemaining,
  decrementTime,
  setFinalResults,
  setError,
  clearError,
  incrementRetry,
  resetRetry,
  startInterview,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;
