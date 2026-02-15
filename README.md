# OpenClaw Dashboard (Cloudflare Workers 版)

> 基于 [FSZJ/Openclaw-Jarvis-dashboard](https://github.com/FSZJ/Openclaw-Jarvis-dashboard) 重构
> **完全使用 TypeScript + Hono.js**，无需 Python

## 架构

- **前端**: Vue 3 + Vite
- **后端**: Hono.js (Cloudflare Workers)
- **存储**: Cloudflare KV

## 快速部署

### 前置要求

```bash
# 安装 Node.js 和 npm
# 安装 Wrangler CLI
npm install -g wrangler
```

### 部署步骤

```bash
# 1. 克隆并进入目录
git clone https://github.com/0xCryptoZen/openclaw-dashboard-cf.git
cd openclaw-dashboard-cf
git checkout workers-fullstack

# 2. 登录 Cloudflare
wrangler login

# 3. 创建 KV 命名空间
wrangler kv:namespace create DASHBOARD

# 4. 部署
chmod +x deploy.sh
./deploy.sh
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动 Workers 后端
npm run dev

# 启动前端开发
cd frontend
npm run dev
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 根路径 |
| GET | `/health` | 健康检查 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/verify` | 验证 token |
| GET | `/api/status` | 系统状态 |
| GET | `/api/todos` | 获取待办 |
| POST | `/api/todos` | 创建待办 |
| GET | `/api/usage` | 模型用量 |
| GET | `/api/integrations/models` | 集成配置 |

## 环境变量

通过 `wrangler secret put` 设置：

```bash
wrangler secret put JWT_SECRET
wrangler secret put MINIMAX_API_KEY
wrangler secret put MINIMAX_GROUP_ID
wrangler secret put OPENCLAW_STATUS
```

## 推送系统状态

由于 Workers 是无状态的，需要外部推送状态：

```javascript
// 示例：推送状态
fetch('https://your-worker.workers.dev/api/status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SECRET'
  },
  body: JSON.stringify({
    gateway: { running: true },
    cpu: 45,
    memory: 62,
    agents: [],
    channels: []
  })
});
```

## 技术栈

- [Hono](https://hono.dev/) - 轻量级 Web 框架
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge Computing
- [Cloudflare KV](https://developers.cloudflare.com/kv/) - 键值存储
- [Cloudflare Pages](https://pages.cloudflare.com/) - 静态站点托管
