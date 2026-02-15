/**
 * OpenClaw Dashboard - Cloudflare Workers 后端
 * 使用 Hono.js 框架，完全 JavaScript/TypeScript
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { jwt } from 'hono/jwt';
import { compress } from 'hono/compress';

// 导入路由
import authRoutes from './routes/auth.js';
import statusRoutes from './routes/status.js';
import dashboardRoutes from './routes/dashboard.js';
import todosRoutes from './routes/todos.js';
import usageRoutes from './routes/usage.js';
import integrationsRoutes from './routes/integrations.js';

const app = new Hono();

// 中间件
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  credentials: true,
}));
app.use('*', compress());

// 根路由
app.get('/', (c) => c.json({
  message: 'OpenClaw Dashboard API',
  version: '1.0.0',
  platform: 'cloudflare-workers',
  docs: '/docs'
}));

app.get('/health', (c) => c.json({ 
  status: 'healthy', 
  platform: 'cloudflare-workers',
  timestamp: Date.now()
}));

// API 路由
app.route('/api/auth', authRoutes);
app.route('/api/status', statusRoutes);
app.route('/api/dashboard', dashboardRoutes);
app.route('/api/todos', todosRoutes);
app.route('/api/usage', usageRoutes);
app.route('/api/integrations', integrationsRoutes);

// 404
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

// 错误处理
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: err.message }, 500);
});

export default app;
