# EthnicFit — AI Kurta Try-On

Monorepo with a Next.js frontend and NestJS backend.

## Structure

```
├── frontend/   Next.js 14 app (UI, pages, components)
└── backend/    NestJS API (OpenAI calls, API key kept server-side)
```

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env        # add OPENAI_API_KEY
npm install
npm run start:dev           # http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
npm install
npm run dev                         # http://localhost:3000
```
