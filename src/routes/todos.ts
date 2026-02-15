import { Hono } from 'hono';
import type { Env } from '../types/index.js';

const todos = new Hono();

// 内存存储
let todosList: any[] = [];
let nextId = 1;

// 获取所有待办
todos.get('/', async (c) => {
  // 尝试从 KV 加载
  if (c.env.DASHBOARD) {
    try {
      const cached = await c.env.DASHBOARD.get('todos');
      if (cached) {
        todosList = JSON.parse(cached);
        if (todosList.length > 0) {
          nextId = Math.max(...todosList.map(t => t.id)) + 1;
        }
      }
    } catch (e) {
      console.error('KV error:', e);
    }
  }
  
  return c.json(todosList);
});

// 创建待办
todos.post('/', async (c) => {
  const body = await c.req.json();
  
  const newTodo = {
    id: nextId++,
    text: body.text || '',
    done: false,
    createdAt: body.createdAt || new Date().toISOString()
  };
  
  todosList.push(newTodo);
  
  // 保存到 KV
  if (c.env.DASHBOARD) {
    await c.env.DASHBOARD.put('todos', JSON.stringify(todosList));
  }
  
  return c.json({ success: true, todo: newTodo });
});

// 完成待办
todos.post('/:id/complete', async (c) => {
  const id = parseInt(c.req.param('id'));
  
  const todo = todosList.find(t => t.id === id);
  if (todo) {
    todo.done = !todo.done;
    
    if (c.env.DASHBOARD) {
      await c.env.DASHBOARD.put('todos', JSON.stringify(todosList));
    }
  }
  
  return c.json({ success: true });
});

// 删除待办
todos.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  
  todosList = todosList.filter(t => t.id !== id);
  
  if (c.env.DASHBOARD) {
    await c.env.DASHBOARD.put('todos', JSON.stringify(todosList));
  }
  
  return c.json({ success: true });
});

export default todos;
