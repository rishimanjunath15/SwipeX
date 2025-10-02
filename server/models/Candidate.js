import mongoose from 'mongoose';

/**
 * Candidate Schema
 * Stores all information about an interview candidate
 */
const candidateSchema = new mongoose.Schema({
  // Profile information
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: '',
  },
  designation: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  github: {
    type: String,
    default: '',
  },
  linkedin: {
    type: String,
    default: '',
  },
  
  // Resume text (full extracted text)
  resumeText: {
    type: String,
    default: '',
  },
  
  // Pre-interview chat messages
  preInterviewChat: [{
    sender: {
      type: String,
      enum: ['ai', 'user'],
      required: true,
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Interview data
  questions: [{
    questionId: String,
    questionNumber: Number, // Sequential number (1-6)
    difficulty: String,
    question: String,
    answer: String,
    score: Number,
    feedback: String,
    timeLimit: Number,
    timeTaken: Number,
    answeredAt: Date,
  }],
  
  // Final results
  totalScore: {
    type: Number,
    default: 0,
  },
  summary: {
    type: String,
    default: '',
  },
  
  // Interview status
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress',
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  interviewStartedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
});

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;
