# OpenClaw Dashboard - Cloudflare 部署指南

## 概述

本项目已重构为支持部署到 Cloudflare：
- **前端**: Cloudflare Pages (Vue + Vite)
- **后 Workers (Fast端**: CloudflareAPI 适配版)

## 快速部署

### 1. 安装依赖

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 2. 创建 KV 命名空间

```bash
wrangler kv:namespace create DASHBOARD
wrangler kv:namespace create DASHBOARD --env production
```

将返回的 `id` 添加到 `wrangler.toml`。

### 3. 部署

```bash
# 方式一：使用部署脚本
chmod +x deploy-cf.sh
./deploy-cf.sh

# 方式二：手动部署

# 前端
cd frontend
npm run build
cd ..
npx wrangler pages deploy frontend/dist --project-name=openclaw-dashboard

# 后端
npx wrangler deploy
```

## 环境变量

### Workers 环境变量

```bash
# 认证
wrangler secret put JWT_SECRET

# MiniMax API (可选)
wrangler secret put MINIMAX_API_KEY
wrangler secret put MINIMAX_GROUP_ID
wrangler secret put MINIMAX_QUOTA_URL

# 系统状态 (由外部系统推送)
wrangler secret put OPENCLAW_STATUS
```

### 推送系统状态

由于 Cloudflare Workers 是无状态的，需要外部系统推送状态：

```python
import requests

# 推送状态到 Workers
requests.post(
    "https://your-worker.workers.dev/internal/status",
    json={
        "gateway": {"running": True},
        "cpu": 45,
        "memory": 62,
        "agents": [...],
        "channels": [...]
    },
    headers={"Authorization": "Bearer YOUR_SECRET_KEY"}
)
```

## 架构说明

```
用户请求
    │
    ▼
┌─────────────────┐
│  Cloudflare     │
│  Pages (前端)    │
│  Vue + Vite     │
└────────┬────────┘
         │ /api/*
         ▼
┌─────────────────┐
│  Cloudflare     │
│  Workers (后端) │
│  FastAPI        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Cloudflare     │
│  KV Storage     │
└─────────────────┘
```

## 限制说明

1. **WebSocket**: Cloudflare Workers 原生不支持 WebSocket，需要使用 Durable Objects
2. **psutil**: 不可用，系统状态需外部推送
3. **文件存储**: 需使用 KV 或 R2
4. **执行时间**: Workers 有 CPU 时间限制 (10ms 免费的，50ms 付费)

## 本地开发

```bash
# 启动前端开发
cd frontend
npm run dev

# 启动 Workers 本地测试
wrangler dev cloudflare_app.py
```

## 原版部署 (本地/Railway)

如需保留原版部署方式：

```bash
# 本地
pip install -r requirements.txt
python server.py

# Railway (推荐)
# 1.  Fork 项目
# 2.  在 Railway 创建新项目
# 3.  关联 GitHub 仓库
# 4.  设置环境变量
```
