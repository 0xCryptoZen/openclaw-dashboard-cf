import { Hono } from 'hono';
import type { Env } from '../types/index.js';

const status = new Hono();

// 状态缓存
let statusCache: any = null;
let statusCacheTime = 0;
const CACHE_TTL = 10000; // 10秒

status.get('/', async (c) => {
  const now = Date.now();
  
  // 尝试从环境变量获取状态
  const envStatus = c.env.OPENCLAW_STATUS;
  
  if (envStatus && now - statusCacheTime < CACHE_TTL) {
    try {
      statusCache = JSON.parse(envStatus);
    } catch (e) {
      // 忽略解析错误
    }
  }
  
  if (!statusCache) {
    statusCache = {
      gateway: { running: false, message: 'Not configured - set OPENCLAW_STATUS env var' },
      cpu: 0,
      memory: 0,
      agents: [],
      channels: []
    };
  }
  
  return c.json(statusCache);
});

// 轻量状态
status.get('/light', async (c) => {
  return c.json({
    gateway: { running: statusCache?.gateway?.running || false },
    cpu: statusCache?.cpu || 0,
    memory: statusCache?.memory || 0
  });
});

// WebSocket 状态流（Cloudflare Workers 需要 Durable Objects，这里返回模拟数据）
status.get('/stream', async (c) => {
  // 返回 SSE (Server-Sent Events) 用于实时更新
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      
      // 发送初始状态
      send({ type: 'status_update', payload: statusCache || {} });
      
      // 每5秒发送更新
      const interval = setInterval(() => {
        send({ type: 'status_update', payload: statusCache || {} });
      }, 5000);
      
      c.req.raw.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
});

export default status;
