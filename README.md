# 🚀 SwipeX - AI-Powered Interview Assistant

<div align="center">

![SwipeX Logo](https://img.shields.io/badge/SwipeX-Interview%20Assistant-blue?style=for-the-badge&logo=react&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)

*Transform the hiring process with AI-powered technical interviews*

[🌐 Live Demo](https://swipe-x-three.vercel.app) • [📖 Documentation](#-documentation) • [🚀 Quick Deploy](#-quick-deploy)

</div>

---

## ✨ What is SwipeX?

SwipeX is a **cutting-edge, AI-powered interview platform** that revolutionizes technical hiring by automating the entire interview process. Built with modern web technologies and powered by Google's Gemini AI, it conducts comprehensive technical interviews with real-time evaluation and feedback.

### � Key Highlights

- 🤖 **AI-Driven Interviews**: 6 sequential questions with theory-based evaluation
- 📄 **Smart Resume Parsing**: Automatic extraction from PDF/DOCX files
- 💬 **Interactive Chat**: Pre-interview conversation with AI assistant
- 📊 **Real-time Scoring**: Instant feedback and comprehensive evaluation
- 🔄 **Session Persistence**: Resume incomplete interviews with Redux persist
- 👥 **Dual Interface**: Separate views for candidates and interviewers
- 🗑️ **Data Management**: Full CRUD operations for candidate records

---

## �️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

### AI & Tools
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-FF6B35?style=for-the-badge&logo=multer&logoColor=white)

</div>

---

## 🚀 Quick Deploy

### One-Click Deploy to Vercel

<div align="center">

[![Deploy Frontend](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rishimanjunath15/SwipeX&root-directory=client)
[![Deploy Backend](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rishimanjunath15/SwipeX&root-directory=server)

</div>

### Manual Deploy Steps

1. **Fork & Clone**
   ```bash
   git clone https://github.com/rishimanjunath15/SwipeX.git
   cd SwipeX
   ```

2. **Deploy Backend First**
   - Set root directory to `server/`
   - Add environment variables (see [Configuration](#-configuration))

3. **Deploy Frontend**
   - Set root directory to `client/`
   - Set `VITE_API_URL` to your backend URL

---

## � Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB Atlas** account
- **Gemini API** key from [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## 🏃‍♂️ Local Development

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rishimanjunath15/SwipeX.git
   cd SwipeX
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd server
   npm install

   # Frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example server/.env

   # Edit server/.env with your credentials
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Backend (http://localhost:4000)
   cd server
   npm run dev

   # Terminal 2: Frontend (http://localhost:3000)
   cd client
   npm run dev
   ```

5. **Open Browser**
   - Navigate to `http://localhost:3000`
   - Switch to Interviewer tab to view results

---

## ⚙️ Configuration

### Backend Environment Variables (`server/.env`)

```env
# AI Configuration
GEMINI_MODEL=gemini-1.5-flash
GEMINI_API_KEY=your_gemini_api_key_here

# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# Server
PORT=4000
NODE_ENV=development

# CORS (for production)
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### Frontend Environment Variables (`client/.env`)

```env
# API Configuration (for production)
VITE_API_URL=https://your-backend-domain.vercel.app
```

---

## � Project Structure

```
SwipeX/
├── 📁 client/                    # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable UI Components
│   │   │   ├── CandidateList.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   └── ...
│   │   ├── 📁 pages/            # Main Page Components
│   │   │   ├── IntervieweePage.jsx
│   │   │   └── InterviewerPage.jsx
│   │   ├── 📁 redux/            # State Management
│   │   │   ├── store.js
│   │   │   ├── interviewSlice.js
│   │   │   └── candidateSlice.js
│   │   └── 📁 lib/              # Utilities
│   ├── package.json
│   └── vite.config.js
│
├── 📁 server/                    # Express Backend
│   ├── 📁 models/               # MongoDB Schemas
│   │   └── Candidate.js
│   ├── 📁 routes/               # API Endpoints
│   │   ├── candidates.js
│   │   ├── interviewAction.js
│   │   └── saveCandidate.js
│   ├── 📁 services/             # Business Logic
│   │   └── geminiService.js
│   ├── server.js
│   └── package.json
│
├── 📄 README.md                 # Documentation
├── 📄 vercel.json              # Deployment Config
└── 📄 .env.example            # Environment Template
```

---

## 🎯 How It Works

### For Candidates 👨‍💻

1. **📤 Upload Resume**: PDF/DOCX parsing with automatic field extraction
2. **💬 Pre-Interview Chat**: AI conversation to gather missing information
3. **❓ Answer Questions**: 6 sequential questions (Easy → Medium → Hard)
4. **📊 View Results**: Instant scoring and detailed feedback

### For Interviewers 👔

1. **📋 View Dashboard**: Complete list of all candidates
2. **👀 Detailed Reports**: Full Q&A with AI evaluation
3. **🗑️ Manage Data**: Delete candidate records as needed
4. **📈 Analytics**: Track interview completion rates

---

## 🔌 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload-resume` | Parse and extract resume data |
| `POST` | `/api/interview-action` | Handle interview actions |
| `GET` | `/api/candidates` | Get all candidates |
| `GET` | `/api/candidate/:id` | Get candidate details |
| `DELETE` | `/api/candidate/:id` | Delete candidate |
| `POST` | `/api/save-candidate` | Save completed interview |

### Interview Actions

```javascript
// Generate next question
{
  action: 'next_question',
  payload: { questionNumber: 1, difficulty: 'easy' }
}

// Submit answer
{
  action: 'submit_answer',
  payload: { questionId: 'q1', answer: '...' }
}
```

---

## 🎨 Features in Detail

### 🤖 AI-Powered Interview System
- **Contextual Questions**: Based on candidate's resume and experience
- **Progressive Difficulty**: Easy → Medium → Hard progression
- **Theory-Focused**: Emphasis on concepts over syntax
- **Real-time Evaluation**: Instant scoring and feedback

### � Data Persistence
- **Session Recovery**: Resume incomplete interviews
- **MongoDB Storage**: Complete interview data preservation
- **Redux Persist**: Local state persistence across sessions

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach
- **Dark/Light Themes**: Tailwind CSS styling
- **Smooth Animations**: Loading states and transitions
- **Accessibility**: WCAG compliant components

---

## 🔧 Development Scripts

### Frontend (`client/`)
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend (`server/`)
```bash
npm run dev      # Start with auto-reload
npm run start    # Production start
npm run test:api # Test Gemini API connection
```

---

## � Troubleshooting

### Common Issues

**❌ Gemini API Connection Failed**
```bash
# Test API connection
cd server
npm run test:api
```

**❌ MongoDB Connection Error**
- Check your `MONGODB_URI` in `.env`
- Ensure IP whitelist includes `0.0.0.0/0` for development

**❌ Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**❌ CORS Issues**
- Add your frontend URL to `CLIENT_URL` in backend `.env`
- Restart both servers after configuration changes

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write meaningful commit messages
- Test API endpoints with Postman/Insomnia
- Update documentation for new features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Copyright (c) 2025 Rishi Manjunath

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For powering intelligent interviews
- **MongoDB Atlas** - For reliable database services
- **Vercel** - For seamless deployment platform
- **Tailwind CSS** - For beautiful, responsive design
- **React Community** - For amazing developer experience

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/rishimanjunath15/SwipeX/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rishimanjunath15/SwipeX/discussions)
- **Email**: For business inquiries

---

<div align="center">

**Made with ❤️ by [Rishi Manjunath](https://github.com/rishimanjunath15)**

⭐ **Star this repo if you found it helpful!**

[⬆️ Back to Top](#-swipeX---ai-powered-interview-assistant)

</div>