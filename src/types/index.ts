// 类型定义
export interface Env {
  DASHBOARD: KVNamespace;
  JWT_SECRET: string;
  MINIMAX_API_KEY: string;
  MINIMAX_GROUP_ID: string;
  MINIMAX_QUOTA_URL: string;
  OPENCLAW_STATUS: string;
}

export interface User {
  username: string;
  passwordHash: string;
  mustChangePassword: boolean;
}

export interface Todo {
  id: number;
  text: string;
  done: boolean;
  createdAt: string;
}

export interface Integration {
  provider: string;
  config: Record<string, string>;
}

export interface StatusData {
  gateway: {
    running: boolean;
    message?: string;
  };
  cpu: number;
  memory: number;
  agents: any[];
  channels: any[];
}

export interface JwtPayload {
  username: string;
  exp: number;
}
