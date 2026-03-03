# 🎯 PulsePoint — AI-Powered Sales Outreach Intelligence Engine

> **Team:** Singularity Clutchers
> **Hackathon:** COHERENCE 26 — MLSC VCET
> **Track:** Sales & Outreach Systems

---

## 💡 What is PulsePoint?

PulsePoint is an AI-powered outreach intelligence engine that transforms generic cold outreach into hyper-personalized, high-conversion communication — in under 30 seconds.

Most sales teams send the same cold email to hundreds of prospects and get a 2% response rate. PulsePoint analyzes a prospect's public digital footprint, identifies their communication style, priorities, and pain points — and generates a personalized message that feels like it was written by someone who spent hours researching them.

---

## 🚀 The Problem

- **92%** of cold outreach is ignored — generic messaging fails every time
- Sales reps spend **3–4 hours/day** manually researching prospects before writing
- **No tool** currently combines behavioral NLP + prospect scoring + message generation in one pipeline

---

## ✅ Our Solution

```
PROSPECT URL / NAME
       │
       ▼
┌─────────────────┐
│  DATA HARVESTER │  ← LinkedIn bio, GitHub, website scraping
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│         PULSEPOINT BRAIN        │
│                                 │
│  NLP Analyzer → Tone Profiler   │
│  Pain Point Extractor → Scorer  │
│  ↓                              │
│  Message Generation Engine      │
└────────────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│     OUTPUT      │
│                 │
│ • Prospect Score│
│ • Personalized  │
│   Outreach Msg  │
│ • Best Send Time│
│ • Follow-up Plan│
└─────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Tailwind CSS |
| Mobile | React Native |
| Backend | FastAPI (Python) |
| NLP | spaCy + HuggingFace Transformers |
| Scoring | scikit-learn |
| Database | Firebase |
| Scraping | BeautifulSoup + Playwright |

---

## 📁 Project Structure

```
COHERENCE-26_SINGULARITYCLUTCHERS/
├── frontend/          # React.js web dashboard
│   ├── src/
│   └── public/
├── backend/           # FastAPI server
│   └── app/
│       ├── routes/    # API endpoints
│       ├── models/    # Data models
│       └── services/  # Business logic
├── ml/                # AI/ML pipeline
│   ├── nlp/           # NLP & text analysis
│   ├── scoring/       # Prospect scoring model
│   └── matching/      # Message matching engine
├── data/              # Sample datasets
├── docs/              # Documentation & architecture
└── scripts/           # Setup & utility scripts
```

---

## ⚙️ Setup & Installation

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 👥 Team — Singularity Clutchers

| Member | Role |
|--------|------|
| TBD | ML Engineer — NLP & Scoring |
| TBD | Backend — FastAPI & Integrations |
| TBD | Frontend — React Dashboard |
| TBD | Mobile — React Native App |

---

## 📈 Commit History

Commits are tracked hourly from **12:00 PM Day 1 → 12:00 PM Day 2**.

---

*Built with 🔥 at COHERENCE 26 — MLSC VCET*
