# Camp-Management

Digitale Multi-Camp Management Platform für CVJM Dobelmühle & Partner.

Ersetzt Papier-Freizeitpass, dezentrale Excel-Listen und manuelle Zahlungsverfolgung durch
eine zentrale, self-hosted Plattform mit dynamisch konfigurierbaren Anmeldeformularen,
Finanzmanagement und Eltern-Portal.

## Status

Phase 0 (Fundament) – siehe `Camp-Management-Solo-Roadmap.md` für den vollständigen Plan.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Query, React Hook Form, Zod
- **Backend:** Node.js 20, Express, TypeScript, Prisma, PostgreSQL 15
- **Infra:** Docker Compose, Redis, JWT Auth

## Quickstart

```bash
cp .env.example .env
docker compose up --build
```

Backend läuft auf http://localhost:4000, Frontend auf http://localhost:5173.

## Struktur

```
backend/    Express API + Prisma Schema
frontend/   React App
```
