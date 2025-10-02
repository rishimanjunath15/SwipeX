import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Retry configuration for Gemini API calls
 */
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Helper function to delay execution
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic Gemini call with retry logic
 * @param {string} prompt - The prompt to send to Gemini
 * @param {number} retries - Number of retries remaining
 * @returns {Promise<object>} - Parsed JSON response from Gemini
 */
async function callGemini(prompt, retries = MAX_RETRIES) {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to extract JSON from the response
    // Sometimes Gemini wraps JSON in markdown code blocks
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error(`Gemini API error (${retries} retries left):`, error.message);
    
    if (retries > 0) {
      await delay(RETRY_DELAY);
      return callGemini(prompt, retries - 1);
    }
    
    throw new Error('AI service unavailable. Please try again in a moment.');
  }
}

/**
 * Extract fields from resume text
 * @param {string} resumeText - Full text extracted from resume
 * @returns {Promise<object>} - Extracted fields and missing field info
 */
export async function extractFields(resumeText) {
  const prompt = `You are a JSON-only extractor. Given the resume text, return JSON exactly matching the schema. Do NOT output any extra commentary.

Schema:
{
  "fields": {
    "name": "Full Name or empty string",
    "email": "email@example.com or empty string",
    "phone": "phone-number or empty string"
  },
  "missing": ["phone","email"] OR [],
  "message": "A short conversational message to show to candidate (optional)"
}

Example:
Resume: "John Doe\nSoftware Engineer\njohn@example.com"
Output: {"fields":{"name":"John Doe","email":"john@example.com","phone":""},"missing":["phone"],"message":"I found your name and email. Could you please provide your phone number?"}

Now extract from this resume:
${resumeText}

Return only valid JSON matching the schema above.`;

  return callGemini(prompt);
}

/**
 * Generate interview question based on difficulty
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @param {number} questionNumber - Question number (1-6)
 * @param {string} resumeText - Candidate's resume for context
 * @returns {Promise<object>} - Question object
 */
export async function generateQuestion(difficulty, questionNumber, resumeText) {
  const timeLimitMap = { easy: 20, medium: 60, hard: 120 };
  const timeLimit = timeLimitMap[difficulty] || 60;
  
  const prompt = `You are a concise interview question generator for Full Stack React/Node roles. Output JSON only.

Generate ONE interview question of difficulty "${difficulty}" for a Full Stack React/Node.js developer position. 

Schema:
{
  "questionId": "q${questionNumber}",
  "difficulty": "${difficulty}",
  "question": "The actual question text",
  "timeLimit": ${timeLimit}
}

Context from resume:
${resumeText.substring(0, 500)}

Example output:
{"questionId":"q1","difficulty":"easy","question":"What is the difference between let, const, and var in JavaScript?","timeLimit":20}

Generate a relevant ${difficulty} question and return only valid JSON.`;

  return callGemini(prompt);
}

/**
 * Evaluate candidate's answer to a question
 * @param {string} question - The interview question
 * @param {string} answer - Candidate's answer
 * @param {string} difficulty - Question difficulty
 * @returns {Promise<object>} - Evaluation with score and feedback
 */
export async function evaluateAnswer(question, answer, difficulty) {
  const prompt = `You are an objective grader for technical interviews. Return JSON only.

Grading Rubric (total 100 points):
- Correctness: 0-40 points
- Completeness (edge cases/examples): 0-30 points
- Clarity & Explanation: 0-20 points
- Efficiency/Best practices: 0-10 points

Question: ${question}

Candidate's Answer: ${answer}

Difficulty: ${difficulty}

Evaluate the answer and return JSON:
{
  "score": 75,
  "feedback": "Brief feedback mentioning what was good and what was missing"
}

Example:
{"score":72,"feedback":"Good conceptual understanding. Missing practical examples and edge case handling."}

Return only valid JSON with integer score (0-100) and concise feedback.`;

  return callGemini(prompt);
}

/**
 * Generate final interview summary
 * @param {Array} questions - Array of question objects with scores
 * @param {string} candidateName - Name of the candidate
 * @returns {Promise<object>} - Final summary with total score
 */
export async function generateFinalSummary(questions, candidateName) {
  const questionsText = questions.map(q => 
    `Q${q.questionId.replace('q', '')} (${q.difficulty}): ${q.score}/100`
  ).join('\n');
  
  const prompt = `You are an interview summary generator. Return JSON only.

Aggregate the following question scores into a final assessment:

${questionsText}

Candidate: ${candidateName}

Calculate the average score and provide a 3-4 sentence professional summary of the candidate's performance.

Schema:
{
  "totalScore": 78,
  "breakdown": [{"questionId":"q1","score":90}, {"questionId":"q2","score":85}, ...],
  "summary": "Professional 3-4 sentence summary of performance"
}

Example:
{"totalScore":78,"breakdown":[{"questionId":"q1","score":85},{"questionId":"q2","score":80}],"summary":"The candidate demonstrated solid understanding of fundamental concepts with good problem-solving skills. Some areas need improvement in advanced topics and optimization techniques. Overall, a promising candidate with potential for growth."}

Return only valid JSON.`;

  return callGemini(prompt);
}

/**
 * Ask for missing field in conversational way
 * @param {string} fieldName - Name of missing field
 * @param {string} resumeText - Resume context
 * @returns {Promise<object>} - Conversational prompt for the field
 */
export async function askForMissingField(fieldName, resumeText) {
  const prompt = `You are a friendly interview assistant. Generate a conversational message asking for the missing "${fieldName}" field.

Return JSON only:
{
  "field": "${fieldName}",
  "message": "Friendly conversational question asking for the field"
}

Example:
{"field":"phone","message":"I couldn't find your phone number in the resume. Could you please share it?"}

Return only valid JSON with a friendly message.`;

  return callGemini(prompt);
}
