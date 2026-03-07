# ⚡ ApplyBot — AI Job Application System

An AI-powered job application bot built with React + Claude API. Upload your resume, match it to job listings across multiple portals, auto-enhance it per role, generate cover letters, and track all applications.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Anthropic API key
Open the `.env` file and replace the placeholder:
```
REACT_APP_ANTHROPIC_API_KEY=your_actual_api_key_here
```
Get your key at: https://console.anthropic.com

### 3. Start the app
```bash
npm start
```

The app opens at **http://localhost:3000**

---

## 📁 Project Structure

```
applybot/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── claude.js          # All Claude API calls
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
├── .env                       # 🔑 Add your API key here
├── .gitignore
└── package.json
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **Resume Upload** | Upload `.txt`, `.md`, or paste resume text |
| **Resume Analysis** | AI-powered career insights and improvement tips |
| **Job Matching** | Score resume vs. each job (0–100%) with reasoning |
| **Resume Enhancement** | Rewrite resume tailored to a specific job |
| **Cover Letter Gen** | Generate a personalized cover letter per role |
| **Multi-Portal Support** | LinkedIn, Indeed, Glassdoor, Wellfound |
| **Application Tracker** | Track submitted applications with timestamps |

---

## 🔧 Extending the Bot

### Add real job portal integration
To connect to real portals, swap the mock data in `src/data/jobs.js` with API calls:
- **LinkedIn**: Use LinkedIn Job Search API
- **Indeed**: Use Indeed Publisher API
- **Real apply**: Integrate Playwright/Puppeteer for browser automation

### Add more AI features
All AI logic lives in `src/api/claude.js` — easy to extend with new prompts.

---

## ⚠️ Notes

- The apply flow is **simulated** (no real form submission). Wire up Playwright for real automation.
- Direct browser API calls require `anthropic-dangerous-direct-browser-access: true` header (already set).
- Never commit your `.env` file — it's in `.gitignore` by default.
