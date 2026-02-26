# TeleFlow

Telecoms reseller onboarding portal for ITC Telecoms.

**Live:** https://teleflow-production.up.railway.app

## Stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Companies House API
- Zen API (mock → live when credentials added)
- GoCardless (DD mandates)
- ConnectWise REST API
- Supabase
- Resend (email)
- Railway (hosting)

## Setup
```bash
cp .env.example .env.local
npm install
npm run dev
```
