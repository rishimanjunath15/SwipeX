import express from 'express';
import multer from 'multer';
import path from 'path';
import mammoth from 'mammoth';
import fs from 'fs';
import { extractFields } from '../services/geminiService.js';
import { PdfReader } from 'pdfreader';

const router = express.Router();

// Configure multer for file uploads
// Use memory storage for serverless environments (Vercel)
const storage = process.env.NODE_ENV === 'production' 
  ? multer.memoryStorage() 
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/');
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
      },
    });

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.docx') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * Extract text from PDF file
 * Supports both file path (local) and buffer (serverless)
 */
async function extractPdfText(source) {
  return new Promise((resolve, reject) => {
    let text = '';
    const reader = new PdfReader();
    
    // Check if source is a buffer or file path
    if (Buffer.isBuffer(source)) {
      reader.parseBuffer(source, (err, item) => {
        if (err) {
          reject(err);
        } else if (!item) {
          resolve(text);
        } else if (item.text) {
          text += item.text + ' ';
        }
      });
    } else {
      reader.parseFileItems(source, (err, item) => {
        if (err) {
          reject(err);
        } else if (!item) {
          resolve(text);
        } else if (item.text) {
          text += item.text + ' ';
        }
      });
    }
  });
}

/**
 * Extract text from DOCX file
 * Supports both file path (local) and buffer (serverless)
 */
async function extractDocxText(source) {
  if (Buffer.isBuffer(source)) {
    const result = await mammoth.extractRawText({ buffer: source });
    return result.value;
  } else {
    const result = await mammoth.extractRawText({ path: source });
    return result.value;
  }
}

/**
 * POST /api/upload-resume
 * Accepts resume file (PDF or DOCX), extracts text, and uses Gemini to parse fields
 */
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded. Please upload a resume.',
      });
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    // In production (Vercel), use buffer; in development, use file path
    const fileSource = req.file.buffer || req.file.path;
    const isBuffer = Buffer.isBuffer(fileSource);

    let resumeText = '';

    try {
      // Extract text based on file type
      if (fileExt === '.pdf') {
        resumeText = await extractPdfText(fileSource);
      } else if (fileExt === '.docx') {
        resumeText = await extractDocxText(fileSource);
      }

      // Clean up the uploaded file (only for disk storage)
      if (!isBuffer && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      if (!resumeText || resumeText.trim().length === 0) {
        return res.status(400).json({
          error: "Couldn't read the resume. Try another copy or paste the text manually.",
        });
      }
    } catch (extractError) {
      // Clean up file if extraction fails (only for disk storage)
      if (!isBuffer && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      console.error('Text extraction error:', extractError);
      return res.status(400).json({
        error: "Couldn't read the resume. Try another copy or paste the text manually.",
      });
    }

    // Call Gemini to extract fields
    try {
      const geminiResponse = await extractFields(resumeText);
      
      // Return the response with resume text for future use
      res.json({
        ...geminiResponse,
        resumeText: resumeText,
      });
    } catch (geminiError) {
      console.error('Gemini service error:', geminiError);
      return res.status(503).json({
        error: 'AI service unavailable. Please try again in a moment.',
      });
    }

  } catch (error) {
    console.error('Upload resume error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.message === 'Only PDF and DOCX files are allowed') {
      return res.status(400).json({
        error: 'Only PDF/DOCX allowed. Please upload a supported resume.',
      });
    }
    
    res.status(500).json({
      error: 'Failed to process resume. Please try again.',
    });
  }
});

export default router;
