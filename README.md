# ⚡ ApplyBot — AI Job Application System

An AI-powered job application bot built with React. Upload your resume, match it to job listings across multiple portals, auto-enhance it per role, generate cover letters, and track all applications.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Add your API key to `.env`

**Option A — Using OpenAI (ChatGPT):**
```
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```
Get your key at: https://platform.openai.com/api-keys

**Option B — Using Anthropic (Claude):**
```
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```
Get your key at: https://console.anthropic.com

### 3. Start the app
```bash
npm start
```

The app opens at **http://localhost:3000**

---

## 🤖 Switching Between AI Providers

### Using OpenAI (ChatGPT)
- File: `src/api/claude.js` uses `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4o`
- Add `REACT_APP_OPENAI_API_KEY` to your `.env`
- Requires a paid OpenAI account with billing set up

### Using Anthropic (Claude)
- Switch back by replacing the API call in `src/api/claude.js`
- Model: `claude-sonnet-4-20250514`
- Add `REACT_APP_ANTHROPIC_API_KEY` to your `.env`
- Get key at: https://console.anthropic.com

---

## 📁 Project Structure

```
applybot/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── claude.js          # AI API calls (OpenAI or Claude)
│   ├── components/
│   │   ├── JobApplierBot.js   # Root orchestrator
│   │   ├── Dashboard.js       # Upload + stats + quick apply
│   │   ├── JobBoard.js        # Browse + filter jobs
│   │   ├── AIEnhancer.js      # Resume enhancer + cover letter
│   │   ├── Tracker.js         # Application tracker
│   │   └── ApplyPanel.js      # Apply modal
│   ├── data/
│   │   └── jobs.js            # Mock job listings
│   ├── styles/
│   │   └── theme.js           # Shared CSS + color utils
│   ├── App.js
│   ├── index.js
│   └── index.css
├── .env                       # 🔑 Add your API key here (never commit this!)
├── .gitignore
└── package.json
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **Resume Upload** | Upload `.txt`, `.md` or paste resume text |
| **Resume Analysis** | AI-powered career insights and improvement tips |
| **Job Matching** | Score resume vs. each job (0-100%) with reasoning |
| **Resume Enhancement** | Rewrite resume tailored to a specific job |
| **Cover Letter Gen** | Generate a personalized cover letter per role |
| **Multi-Portal Support** | LinkedIn, Indeed, Glassdoor, Wellfound |
| **Application Tracker** | Track submitted applications with timestamps |

---

## 🚢 Deploying to Vercel

1. Push code to GitHub
2. Go to **vercel.com** → Import your repo
3. Set **Root Directory** to `applybot`
4. Add Environment Variable:
   - For OpenAI: `REACT_APP_OPENAI_API_KEY` = `your key`
   - For Claude: `REACT_APP_ANTHROPIC_API_KEY` = `your key`
5. Click **Deploy** ✅

---

## 🔧 Git Workflow

```bash
# Always pull before making changes
git pull origin main

# Add your changed file
git add src/api/claude.js

# Commit
git commit -m "your message here"

# Push
git push origin main
```

---

## ⚠️ Important Notes

- The apply flow is **simulated** — wire up Playwright for real automation
- Never commit your `.env` file — it is in `.gitignore` by default
- OpenAI requires a **paid account** with billing enabled
- Claude API requires an **Anthropic account** at console.anthropic.com
