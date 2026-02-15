import { Hono } from 'hono';
import type { Env } from '../types/index.js';

const auth = new Hono();

// 内存存储（生产环境用 KV）
const users = new Map<string, any>([
  ['admin', { username: 'admin', password: 'admin123', mustChangePassword: true }]
]);

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 登录
auth.post('/login', async (c) => {
  const { username, password } = await c.req.json();
  
  const user = users.get(username);
  if (!user || user.password !== password) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  
  // 生成简单 token
  const token = `cf_${username}_${Date.now()}`;
  
  return c.json({
    token,
    username,
    mustChangePassword: user.mustChangePassword
  });
});

// 验证 token
auth.get('/verify', async (c) => {
  const authHeader = c.req.header('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (token.startsWith('cf_')) {
    const username = token.split('_')[1];
    return c.json({ valid: true, username });
  }
  
  return c.json({ error: 'Invalid token' }, 401);
});

// 修改密码
auth.post('/change-password', async (c) => {
  const { username, oldPassword, newPassword } = await c.req.json();
  
  const user = users.get(username);
  if (!user || user.password !== oldPassword) {
    return c.json({ error: 'Invalid current password' }, 401);
  }
  
  user.password = newPassword;
  user.mustChangePassword = false;
  users.set(username, user);
  
  return c.json({ success: true });
});

export default auth;
