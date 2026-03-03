# PulsePoint — System Architecture

## Pipeline Overview

```
Input (LinkedIn URL / GitHub / Website)
       ↓
Data Harvester (BeautifulSoup + Playwright)
       ↓
NLP Analyzer (spaCy + HuggingFace)
  - Tone detection
  - Priority extraction
  - Pain point identification
  - Communication style
       ↓
Prospect Scorer (scikit-learn)
  - Response likelihood score (0-100)
  - Best send time prediction
       ↓
Message Generator (Template + LLM)
  - Personalized subject line
  - Hyper-personalized body
  - Follow-up sequence
       ↓
Output Dashboard (React.js)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/prospects/analyze | Analyze prospect profile |
| POST | /api/outreach/generate | Generate personalized message |
| POST | /api/scoring/score | Score prospect response likelihood |
| GET  | /api/prospects/sample | Get sample prospect (demo) |

## Team Task Split

| Member | Owns |
|--------|------|
| ML Engineer | ml/ — NLP, scoring, generator |
| Backend Dev | backend/ — FastAPI, routes, services |
| Frontend Dev | frontend/ — React dashboard |
| Mobile Dev | React Native app + API integration |
