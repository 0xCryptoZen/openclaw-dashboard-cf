#!/bin/bash
# OpenClaw Dashboard - Cloudflare 部署脚本 (纯 JS/TS 版本)

set -e

echo "🚀 开始部署到 Cloudflare..."

# 1. 安装依赖
echo "📦 安装依赖..."
npm install

# 2. 部署前端到 Cloudflare Pages
echo "📦 部署前端..."
cd frontend
npm run build
cd ..
npx wrangler pages deploy frontend/dist --project-name=openclaw-dashboard

# 3. 部署后端到 Cloudflare Workers
echo "⚡ 部署后端..."
npx wrangler deploy

echo "✅ 部署完成!"
echo ""
echo "访问地址:"
echo "  - 前端: https://openclaw-dashboard.pages.dev"
echo "  - API:  https://openclaw-dashboard.workers.dev"
