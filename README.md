# EchoVerse AI

> **The Urdu-first AI Voice Content Platform** — Turn Words Into Worlds

[![CI](https://github.com/your-org/echoverse-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/echoverse-ai/actions/workflows/ci.yml)
[![Android](https://github.com/your-org/echoverse-ai/actions/workflows/android.yml/badge.svg)](https://github.com/your-org/echoverse-ai/actions/workflows/android.yml)

## Overview

EchoVerse AI is an enterprise-grade AI content creation platform focused on voice, podcast, story, video, and reels generation — with native Urdu, Hindi, English, and Arabic support.

| Studio | Status | Description |
|--------|--------|-------------|
| Voice Studio | ✅ | TTS, multi-speaker, SSML, batch generation |
| Voice Cloning | ✅ | Custom voice cloning via ElevenLabs |
| Podcast Studio | ✅ | Multi-host/guest dialogue generation |
| Story Studio | ✅ | AI story generation with character voices |
| Audiobook Studio | ✅ | Chapter-based narration |
| SSML Studio | ✅ | Advanced SSML editor with preview |
| Emotion Engine | ✅ | Emotional voice synthesis with sliders |
| Video Studio | ✅ | Script-to-video generation |
| Reels Generator | ✅ | TikTok / Shorts / Reels pipeline |
| Voice Brand Kits | ✅ | Brand voice management |
| Team Collaboration | ✅ | Multi-user workspace system |
| Analytics | ✅ | Usage tracking and charts |

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS v3
- **Mobile**: Capacitor 6, Android native
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth + Storage)
- **AI Services**: ElevenLabs, OpenAI, Deepgram, Anthropic (provider-agnostic)
- **State**: Zustand
- **Animations**: Framer Motion
- **Charts**: Recharts
- **CI/CD**: GitHub Actions

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/your-org/echoverse-ai.git
cd echoverse-ai
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in your Supabase URL, keys, and AI provider keys

# 3. Run database migrations
# Via Supabase dashboard or supabase CLI:
# supabase db push

# 4. Start development server
npm run dev
# → http://localhost:3000
```

## Environment Variables

See [.env.example](.env.example) for the complete list. Minimum required:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ELEVENLABS_API_KEY=
OPENAI_API_KEY=
```

## Android Build

```bash
# Debug APK (local development)
npm run build           # Build web assets
npx cap sync android    # Sync to Android project
npm run android:debug   # Build debug APK

# Release APK (requires keystore)
npm run android:build   # Produces app-release.apk
npm run android:aab     # Produces app-release.aab (Play Store)
```

**CI/CD Android**: Push to `main` or create a `v*` tag to trigger the automated release workflow. Keystore must be stored as `ANDROID_KEYSTORE_BASE64` in GitHub Secrets.

## Database Migrations

Run in order against your Supabase project:

```
supabase/migrations/
├── 001_initial.sql          # Core tables: profiles, projects, voices, etc.
├── 002_missing_tables.sql   # usage_logs, api_keys, notifications, team_members
└── 003_teams_audit_flags.sql # workspaces, invitations, audit_logs, feature_flags
```

## GitHub Actions Required Secrets

| Secret | Purpose |
|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase key |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded .jks file |
| `ANDROID_KEY_ALIAS` | Keystore key alias |
| `ANDROID_KEY_PASSWORD` | Keystore key password |
| `ANDROID_STORE_PASSWORD` | Keystore store password |

## Project Structure

```
echoverse-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (sign in/up)
│   │   ├── (dashboard)/        # Protected studio pages
│   │   └── api/                # API routes
│   ├── components/             # Reusable UI components
│   │   ├── layout/             # Sidebar, TopBar, BottomNav
│   │   ├── ui/                 # Design system primitives
│   │   ├── voice/              # Voice-specific components
│   │   └── studio/             # Studio editor components
│   ├── lib/
│   │   ├── ai/                 # AI provider abstraction layer
│   │   │   └── providers/      # ElevenLabs, OpenAI, Deepgram
│   │   └── supabase.ts         # Supabase client + services
│   ├── stores/                 # Zustand state management
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript types
├── android/                    # Capacitor Android project
├── supabase/migrations/        # SQL migrations
├── .github/workflows/          # CI/CD pipelines
├── tests/                      # Vitest unit tests
└── public/                     # Static assets + PWA manifest
```

## Testing

```bash
npm run test            # Run unit tests
npm run test:coverage   # Coverage report
npm run test:e2e        # Playwright E2E tests (requires dev server)
```

## Deployment

### Vercel (Web)
Connect your GitHub repo to Vercel. Set all environment variables in the Vercel dashboard.

### Docker
```bash
docker build -t echoverse-ai .
docker run -p 3000:3000 --env-file .env.local echoverse-ai
```

### Self-hosted
```bash
npm run build
npm start
```

## License

Proprietary — EchoVerse AI © 2024. All rights reserved.
