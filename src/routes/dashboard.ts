import { Hono } from 'hono';

const dashboard = new Hono();

// 获取仪表盘数据
dashboard.get('/', async (c) => {
  const light = c.req.query('light') === '1';
  
  const data = {
    summary: {
      totalAgents: 0,
      activeChannels: 0,
      pendingTasks: 0
    },
    recentTasks: [],
    systemHealth: {
      gateway: 'unknown',
      cpu: 0,
      memory: 0
    }
  };
  
  if (light) {
    return c.json(data.summary);
  }
  
  return c.json(data);
});

export default dashboard;
