# SwipeX Interview Assistant

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rishimanjunath15/SwipeX)

A beginner-friendly, AI-powered full-stack interview platform that automatically conducts technical interviews using Gemini AI.

## 🌟 Features

- **AI-Powered Resume Parsing**: Automatically extracts candidate information from PDF/DOCX resumes
- **Dynamic Question Generation**: Creates contextual interview questions based on candidate profile
- **Real-time Evaluation**: Instant feedback and scoring using Gemini AI
- **Interview Progress Tracking**: Resume incomplete sessions with redux-persist
- **Comprehensive Dashboard**: View all candidates and detailed interview reports

## 🚀 Quick Deploy

### Deploy Frontend to Vercel

1. Fork/Clone this repository
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your repository
4. Set **Root Directory** to `client`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.vercel.app`
6. Deploy!

### Deploy Backend to Vercel

1. Create a new project on [Vercel Dashboard](https://vercel.com/new)
2. Import the same repository
3. Set **Root Directory** to `server`
4. Add environment variables:
   - `GEMINI_MODEL=gemini-2.5-pro`
   - `GEMINI_API_KEY=your_actual_key`
   - `MONGODB_URI=your_mongodb_uri`
   - `CLIENT_URL=https://your-frontend-url.vercel.app`
   - `PORT=4000`
5. Deploy!

**After both are deployed:** Update the frontend's `VITE_API_URL` with your backend URL and redeploy.

## 🛠️ Tech Stack

**Frontend:** React, Redux Toolkit, TailwindCSS, Vite  
**Backend:** Node.js, Express, MongoDB  
**AI:** Google Gemini AI  

## 📋 Environment Variables

### Backend (.env in server/)
```env
GEMINI_MODEL=gemini-1.5-flash
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
PORT=4000
```

### Frontend (Optional - for production)
```env
VITE_API_URL=https://your-backend-url.com
```

## 🔧 Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rishimanjunath15/SwipeX.git
cd SwipeX
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Configure environment variables**
```bash
# Copy example env file
cp .env.example server/.env

# Edit server/.env with your actual credentials
```

4. **Start development servers**
```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 📦 Project Structure

```
SwipeX/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   └── lib/
│   └── package.json
├── server/          # Express backend
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── package.json
└── README.md
```

## 🎯 How to Use

### For Candidates
1. Upload your resume (PDF or DOCX)
2. Provide any missing information
3. Answer 6 interview questions
4. View your results and feedback

### For Interviewers
1. Click the "Interviewer" tab
2. View all completed interviews
3. Click "View Details" to see full Q&A and feedback

## 🔐 Security

- Never commit `.env` files
- Rotate API keys regularly
- Use different keys for development and production
- Enable IP whitelisting in MongoDB Atlas

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

**Rishi Manjunath**

- GitHub: [@rishimanjunath15](https://github.com/rishimanjunath15)

## 🙏 Acknowledgments

- Google Gemini AI for powering the interview intelligence
- MongoDB Atlas for database services
- Vercel for hosting

---

**⚠️ Important**: Get your own API keys before deploying:
- [Gemini API Key](https://makersuite.google.com/app/apikey)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)