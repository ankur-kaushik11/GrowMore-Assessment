# 🚀 GrowEasy AI-Powered CSV Importer

An intelligent, full-stack CSV importer that uses AI (OpenAI GPT-4o-mini) to automatically map and extract CRM lead data from any CSV format — no matter the column names, layout, or structure.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![Express](https://img.shields.io/badge/Express-4.x-green?logo=express) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-green?logo=openai)

## ✨ Features

- **🤖 AI-Powered Field Mapping** — Intelligently maps arbitrary CSV columns to GrowEasy CRM format using OpenAI GPT-4o-mini
- **📁 Drag & Drop Upload** — Beautiful drag & drop zone with file validation
- **📊 CSV Preview** — Responsive data table with sticky headers, horizontal/vertical scrolling
- **📈 Progress Indicators** — Real-time progress bar during AI processing
- **🔄 Retry Mechanism** — Automatic retry with exponential backoff for failed AI batches
- **📥 Export Results** — Download imported records as CSV or JSON
- **🌙 Dark Mode** — Premium dark UI with glassmorphism effects
- **🐳 Docker Ready** — Docker Compose setup for easy deployment
- **📱 Fully Responsive** — Works on desktop, tablet, and mobile

## 🏗️ Architecture

```
GrowEasy/
├── frontend/          # Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/       # Pages & layouts
│   │   ├── components/# React components
│   │   ├── lib/       # API client
│   │   └── types/     # TypeScript types
│   └── Dockerfile
├── backend/           # Express + TypeScript
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # CSV parsing & AI extraction
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Error handling
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Validation helpers
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚦 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm**
- **OpenAI API Key** — Get one at [OpenAI Platform](https://platform.openai.com/api-keys)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/groweasy-csv-importer.git
cd groweasy-csv-importer
```

### 2. Set Up the Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 3. Set Up the Frontend

```bash
cd frontend
npm install
```

### 4. Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 🐳 Docker (Alternative)

```bash
# Set your API key
export OPENAI_API_KEY=your_key_here

# Run both services
docker-compose up --build
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/upload` | Upload CSV file, returns parsed preview |
| `POST` | `/api/extract` | AI extraction on parsed records |

### POST /api/upload

**Request:** `multipart/form-data` with `file` field (CSV)

**Response:**
```json
{
  "success": true,
  "data": {
    "fileName": "leads.csv",
    "fileSize": 2048,
    "headers": ["Name", "Email", "Phone"],
    "rows": [{ "Name": "John", "Email": "john@test.com", "Phone": "9876543210" }],
    "totalRows": 100
  }
}
```

### POST /api/extract

**Request:** `application/json`
```json
{
  "headers": ["Name", "Email", "Phone"],
  "rows": [{ "Name": "John", "Email": "john@test.com", "Phone": "9876543210" }]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": [{ "name": "John", "email": "john@test.com", "mobile_without_country_code": "9876543210", ... }],
    "skipped": [],
    "totalProcessed": 1,
    "totalImported": 1,
    "totalSkipped": 0
  }
}
```

## 🤖 AI Extraction Details

The AI extraction service:

1. **Batch Processing** — Records are processed in batches of 25 for optimal performance
2. **Intelligent Mapping** — Maps arbitrary columns like "Phone Number" → `mobile_without_country_code`
3. **Status Mapping** — Converts statuses to allowed values: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE`
4. **Data Source Matching** — Only uses allowed values: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots`
5. **Multiple Contacts** — Handles multiple emails/phones by using the first and appending extras to `crm_note`
6. **Invalid Record Skipping** — Skips records without email or mobile number
7. **Retry Logic** — 3 retries with exponential backoff per batch

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Vanilla CSS (custom design system) |
| Backend | Node.js, Express, TypeScript |
| CSV Parsing | csv-parse |
| AI | OpenAI GPT-4o-mini |
| File Upload | Multer (backend), Drag & Drop API (frontend) |
| Containerization | Docker + Docker Compose |

## 📝 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ✅ | — | OpenAI API key |
| `PORT` | ❌ | `3001` | Server port |
| `FRONTEND_URL` | ❌ | `http://localhost:3000` | CORS origin |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ❌ | `http://localhost:3001/api` | Backend API URL |

## 📄 License

MIT
