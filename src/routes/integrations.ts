import { Hono } from 'hono';
import type { Env } from '../types/index.js';

const integrations = new Hono();

// 获取集成配置
integrations.get('/models', async (c) => {
  let config: any = {};
  
  if (c.env.DASHBOARD) {
    try {
      const cached = await c.env.DASHBOARD.get('integrations');
      if (cached) {
        config = JSON.parse(cached);
      }
    } catch (e) {
      console.error('KV error:', e);
    }
  }
  
  return c.json(config.models || {});
});

// 更新集成配置
integrations.put('/models', async (c) => {
  const body = await c.req.json();
  
  if (c.env.DASHBOARD) {
    const cached = await c.env.DASHBOARD.get('integrations');
    const integrations = cached ? JSON.parse(cached) : {};
    integrations.models = body.providers;
    await c.env.DASHBOARD.put('integrations', JSON.stringify(integrations));
  }
  
  return c.json({ success: true });
});

// 验证单个模型
integrations.post('/models/:provider/validate', async (c) => {
  const provider = c.req.param('provider');
  const body = await c.req.json();
  
  // 模拟验证
  const hasKey = body.apiKey && body.apiKey.length > 0;
  
  return c.json({
    valid: hasKey,
    error: hasKey ? null : 'Missing API key'
  });
});

export default integrations;
