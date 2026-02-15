# OpenClaw Dashboard

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Vue](https://img.shields.io/badge/Vue-3-green)

[![Star History Chart](https://api.star-history.com/svg?repos=0xCryptoZen/openclaw-dashboard-cf&type=Date)](https://star-history.com#0xCryptoZen/openclaw-dashboard-cf)

OpenClaw Dashboard is a real-time multi-agent monitoring panel built with **Vue 3** (frontend) and **Hono.js** (backend), designed for deployment on **Cloudflare Workers** and **Cloudflare Pages**.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Real-time System Monitoring**: Gateway status, CPU, memory, and channel monitoring
- **Task Management**: Todo list with completion tracking
- **Model Usage Dashboard**: Support for MiniMax, OpenAI (GPT), Gemini, and GLM
- **API Integration**: Configure and validate API keys directly in the dashboard
- **Cloudflare Native**: Deploys entirely on Cloudflare's edge network

## Quick Start

```bash
# Clone the repository
git clone https://github.com/0xCryptoZen/openclaw-dashboard-cf.git
cd openclaw-dashboard-cf

# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Create KV namespace
npx wrangler kv namespace create DASHBOARD

# Deploy
npm run deploy
```

## Architecture

```
┌─────────────────────────────────────────┐
│           Cloudflare Pages              │
│              (Vue 3 UI)                 │
└──────────────────┬──────────────────────┘
                   │ /api/*
                   ▼
┌─────────────────────────────────────────┐
│         Cloudflare Workers               │
│            (Hono.js API)                 │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│           Cloudflare KV                 │
│          (Data Storage)                 │
└─────────────────────────────────────────┘
```

## Installation

### Prerequisites

- Node.js >= 18
- npm or pnpm
- Cloudflare account

### Frontend Setup

```bash
cd frontend
npm install
npm run dev    # Development
npm run build  # Production build
```

### Backend Setup

```bash
npm install
```

## Configuration

### Environment Variables

Set these via `wrangler secret put`:

```bash
wrangler secret put JWT_SECRET
wrangler secret put MINIMAX_API_KEY
wrangler secret put MINIMAX_GROUP_ID
wrangler secret put MINIMAX_QUOTA_URL
```

### KV Namespace

The project uses Cloudflare KV for data persistence:

```toml
[[kv_namespaces]]
binding = "DASHBOARD"
id = "your-kv-namespace-id"
```

## Deployment

### Deploy to Cloudflare

```bash
# Deploy Workers (backend)
npx wrangler deploy

# Deploy Pages (frontend)
npx wrangler pages deploy frontend/dist --project-name=openclaw-dashboard
```

### Using the Deploy Script

```bash
chmod +x deploy.sh
./deploy.sh
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/verify` | Verify token |
| GET | `/api/status` | System status |
| GET | `/api/todos` | List todos |
| POST | `/api/todos` | Create todo |
| GET | `/api/usage` | Model usage stats |
| GET | `/api/integrations/models` | Get integrations |

## Development

```bash
# Start Workers dev server
npm run dev

# Start frontend dev server
cd frontend
npm run dev

# TypeScript check
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ using Cloudflare Workers + Vue 3
