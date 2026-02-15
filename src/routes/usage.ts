import { Hono } from 'hono';
import type { Env } from '../types/index.js';

const usage = new Hono();

// 获取用量数据
usage.get('/', async (c) => {
  // 从 KV 获取配置
  let config: any = {};
  
  if (c.env.DASHBOARD) {
    try {
      const cached = await c.env.DASHBOARD.get('usage_config');
      if (cached) {
        config = JSON.parse(cached);
      }
    } catch (e) {
      console.error('KV error:', e);
    }
  }
  
  // 返回模拟数据（实际需要调用各提供商 API）
  return c.json({
    minimax: {
      used: 0,
      quota: 0,
      percent: 0,
      configured: !!config.minimax?.apiKey
    },
    openai: {
      requests: 0,
      configured: !!config.openai?.apiKey
    },
    gemini: {
      status: 'ok',
      configured: !!config.gemini?.apiKey
    },
    glm: {
      status: 'ok',
      configured: !!config.glm?.apiKey
    }
  });
});

// 更新用量配置
usage.post('/config', async (c) => {
  const body = await c.req.json();
  
  if (c.env.DASHBOARD) {
    await c.env.DASHBOARD.put('usage_config', JSON.stringify(body));
  }
  
  return c.json({ success: true });
});

// 验证配置
usage.post('/validate/:provider', async (c) => {
  const provider = c.req.param('provider');
  const body = await c.req.json();
  
  // 模拟验证
  const valid = body.apiKey && body.apiKey.length > 10;
  
  return c.json({
    valid,
    message: valid ? 'Connection successful' : 'Invalid API key'
  });
});

export default usage;
