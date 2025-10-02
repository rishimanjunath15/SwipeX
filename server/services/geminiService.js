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
    "phone": "phone-number or empty string",
    "designation": "Job title/role (e.g., Software Engineer, Data Scientist) or empty string",
    "location": "City, State or Country or empty string",
    "github": "GitHub profile URL or username or empty string",
    "linkedin": "LinkedIn profile URL or empty string"
  },
  "missing": ["phone","location"] OR [],
  "message": "A short conversational message to show to candidate (optional)"
}

Instructions:
- Extract name, email, phone, job title/designation, location (city/state/country)
- Look for GitHub URL or username in any format (github.com/username, @username, etc.)
- Look for LinkedIn URL or profile link
- Only include fields in "missing" array if they're truly important and not found
- For missing fields, prioritize: name, email, phone, designation
- GitHub and LinkedIn are optional, don't mark as missing unless no professional links found

Example:
Resume: "John Doe\nSenior Software Engineer\nSan Francisco, CA\njohn@example.com\n+1-555-0100\ngithub.com/johndoe\nlinkedin.com/in/johndoe"
Output: {"fields":{"name":"John Doe","email":"john@example.com","phone":"+1-555-0100","designation":"Senior Software Engineer","location":"San Francisco, CA","github":"github.com/johndoe","linkedin":"linkedin.com/in/johndoe"},"missing":[],"message":"Great! I've extracted all your information from the resume."}

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
 * @param {string} previousQuestions - Previously asked questions to avoid repetition
 * @returns {Promise<object>} - Question object
 */
export async function generateQuestion(difficulty, questionNumber, resumeText, previousQuestions = '') {
  const timeLimitMap = { easy: 30, medium: 60, hard: 90 };
  const timeLimit = timeLimitMap[difficulty] || 60;
  
  const prompt = `You are a technical interview question generator for Full Stack React/Node.js roles. Output JSON only.

Generate ONE ${difficulty} difficulty question for Question #${questionNumber}/6.

CRITICAL REQUIREMENTS:
1. The questionId MUST be EXACTLY "q${questionNumber}" (not q1, q2, etc. but the actual number ${questionNumber})
2. AVOID repeating topics from previous questions
3. Ensure each question covers a DIFFERENT area of Full Stack development

${previousQuestions ? `PREVIOUSLY ASKED QUESTIONS (DO NOT REPEAT THESE TOPICS):
${previousQuestions}

YOU MUST ASK ABOUT A COMPLETELY DIFFERENT TOPIC!` : ''}

IMPORTANT GUIDELINES:
- Focus on THEORY-BASED and CONCEPTUAL questions (70% theory, 30% simple code snippets)
- Avoid large coding tasks or complex implementations
- For code questions: ask for simple syntax, single function examples, or short code snippets only
- Keep questions clear, concise, and focused on understanding fundamentals
- Questions should test knowledge, not extensive coding ability
- DIVERSIFY TOPICS: If React was asked, try JavaScript, Node.js, APIs, CSS, etc.

QUESTION TYPES by Difficulty:
EASY (Questions 1-2):
- Basic JavaScript concepts (variables, data types, scope, functions, arrays)
- React fundamentals (components, props, state basics, JSX)
- HTML/CSS basics (selectors, box model, flexbox)
- Simple syntax questions with short code examples

MEDIUM (Questions 3-4):
- React hooks (useState, useEffect, useContext) - theory and simple usage
- Async JavaScript (promises, async/await, callbacks) - concepts
- Node.js basics (modules, npm, Express middleware, routing)
- API concepts (REST, HTTP methods, status codes)
- CSS advanced (Grid, animations, responsive design)

HARD (Questions 5-6):
- Advanced React patterns (Context API, custom hooks, performance optimization, memo)
- Database concepts (SQL vs NoSQL, indexing, relationships)
- Authentication/Security principles (JWT, OAuth, CORS, XSS)
- System design concepts (scalability, caching, load balancing)
- Node.js advanced (streams, clusters, event loop)

TOPIC VARIETY EXAMPLES:
Q1: JavaScript basics
Q2: React components
Q3: Node.js routing
Q4: CSS flexbox
Q5: Authentication (JWT)
Q6: Database optimization

Schema:
{
  "questionId": "q${questionNumber}",
  "difficulty": "${difficulty}",
  "question": "Clear, concise question focused on theory/concepts. If code is needed, ask for a SHORT snippet or syntax only.",
  "timeLimit": ${timeLimit}
}

Context (use minimally):
${resumeText.substring(0, 300)}

EXAMPLES:
Easy: {"questionId":"q1","difficulty":"easy","question":"Explain the difference between let, const, and var in JavaScript. Provide a simple example.","timeLimit":30}

Medium: {"questionId":"q3","difficulty":"medium","question":"What is Express middleware in Node.js? Explain with a simple example of how to use it.","timeLimit":60}

Hard: {"questionId":"q5","difficulty":"hard","question":"Explain the concept of JWT (JSON Web Tokens) in authentication. What are its main components and advantages?","timeLimit":90}

Generate Question #${questionNumber} with ${difficulty} difficulty on a NEW TOPIC. Return ONLY valid JSON with questionId="q${questionNumber}".`;

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
  const prompt = `You are an objective technical interview evaluator. Focus on LOGIC, UNDERSTANDING, and APPROACH. Return JSON only.

CRITICAL EVALUATION RULES:
1. IGNORE syntax errors, typos, or formatting issues completely
2. Focus ONLY on: conceptual understanding, logic, problem-solving approach, and completeness
3. Award points for correct thinking even if code has minor errors
4. Evaluate the IDEA and METHOD, not perfect syntax

Grading Rubric (total 100 points):
- Conceptual Understanding (0-40 points): Does the candidate understand the core concept?
- Logic & Approach (0-30 points): Is the reasoning and method correct?
- Completeness (0-20 points): Did they cover main points and examples?
- Explanation Clarity (0-10 points): Is the explanation clear and well-structured?

Question: ${question}
Candidate's Answer: ${answer}
Difficulty: ${difficulty}

SCORING GUIDELINES:
- 90-100: Excellent understanding with complete explanation
- 75-89: Good understanding with minor gaps
- 60-74: Acceptable understanding but missing key points
- 40-59: Partial understanding with significant gaps
- 0-39: Poor understanding or mostly incorrect

Return JSON:
{
  "score": 75,
  "feedback": "2-3 sentences: What was good, what could improve (NEVER mention syntax errors)"
}

EXAMPLE:
{"score":78,"feedback":"Solid understanding of the core concept with good examples. The explanation of the use case was clear. Could have mentioned one more scenario for completeness."}

Evaluate and return ONLY valid JSON.`;

  return callGemini(prompt);
}

/**
 * Generate final interview summary
 * @param {Array} questions - Array of question objects with scores (MUST be exactly 6 questions)
 * @param {string} candidateName - Name of the candidate
 * @returns {Promise<object>} - Final summary with total score
 */
export async function generateFinalSummary(questions, candidateName) {
  // Ensure we have exactly 6 questions for consistency
  if (questions.length !== 6) {
    console.warn(`Expected 6 questions, but received ${questions.length}`);
  }
  
  // Ensure questions have sequential IDs and proper numbering
  const questionsText = questions.map((q, index) => {
    const questionNum = index + 1;
    const difficulty = q.difficulty || (questionNum <= 2 ? 'easy' : questionNum <= 4 ? 'medium' : 'hard');
    return `Q${questionNum} (${difficulty}): ${q.score}/100 - "${q.question.substring(0, 60)}..."`;
  }).join('\n');
  
  const prompt = `You are an interview summary generator for a Full Stack React/Node.js technical interview. Return JSON only.

INTERVIEW STRUCTURE (6 Questions Total):
- Questions 1-2: EASY (Fundamentals, Basic concepts)
- Questions 3-4: MEDIUM (Intermediate concepts, Common patterns)
- Questions 5-6: HARD (Advanced topics, Complex scenarios)

Score Breakdown:
${questionsText}

Candidate: ${candidateName}
Total Questions: ${questions.length}

Calculate the AVERAGE score across ALL questions and provide a professional 3-4 sentence summary.

SCORING INTERPRETATION:
- 90-100: Exceptional technical knowledge
- 80-89: Strong performance with minor gaps
- 70-79: Good understanding, room for improvement
- 60-69: Acceptable but needs development
- Below 60: Needs significant improvement

Schema:
{
  "totalScore": 78,
  "breakdown": [{"questionId":"q1","score":85}, {"questionId":"q2","score":80}, {"questionId":"q3","score":75}, {"questionId":"q4","score":82}, {"questionId":"q5","score":70}, {"questionId":"q6","score":76}],
  "summary": "Professional 3-4 sentence summary covering: overall performance, strengths, areas for improvement, and final recommendation"
}

Example:
{"totalScore":78,"breakdown":[{"questionId":"q1","score":85},{"questionId":"q2","score":80},{"questionId":"q3","score":75},{"questionId":"q4","score":82},{"questionId":"q5","score":70},{"questionId":"q6","score":76}],"summary":"The candidate demonstrated solid understanding of fundamental React and JavaScript concepts with good problem-solving approaches. Performance was strongest in basic and intermediate questions, showing clear conceptual knowledge. Some challenges with advanced topics suggest areas for continued learning. Overall, a promising candidate with a good foundation and potential for growth."}

Return ONLY valid JSON with all ${questions.length} questions in the breakdown array.`;

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
