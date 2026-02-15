"""
OpenClaw Dashboard - Cloudflare Workers 版本
"""
import os
import json
from typing import Any, Optional

# Cloudflare Workers 环境适配
class CloudflareEnv:
    """Cloudflare 环境变量封装"""
    
    @staticmethod
    def get(key: str, default: Any = None) -> str:
        return os.environ.get(key, default)
    
    @staticmethod
    def get_int(key: str, default: int = 0) -> int:
        try:
            return int(os.environ.get(key, default))
        except (ValueError, TypeError):
            return default


# 配置 - 从环境变量读取
class Config:
    """Cloudflare 版配置"""
    
    # Server config
    SERVER_HOST = "0.0.0.0"
    SERVER_PORT = int(CloudflareEnv.get("SERVER_PORT", "8787"))
    
    # Minimax
    MINIMAX_API_KEY = CloudflareEnv.get("MINIMAX_API_KEY")
    MINIMAX_API_BASE = CloudflareEnv.get("MINIMAX_API_BASE", "https://www.minimaxi.com")
    MINIMAX_GROUP_ID = CloudflareEnv.get("MINIMAX_GROUP_ID")
    MINIMAX_QUOTA_URL = CloudflareEnv.get("MINIMAX_QUOTA_URL")
    MINIMAX_USAGE_IS_REMAINING = CloudflareEnv.get("MINIMAX_USAGE_IS_REMAINING", "0") == "1"
    
    # JWT config
    JWT_SECRET = CloudflareEnv.get("JWT_SECRET", "cf-workers-secret-change-me")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
    
    # Cloudflare KV bindings (通过 global 注入)
    KV: Any = None
    
    # 状态缓存
    STATUS_CACHE_TTL = 10
    
    @classmethod
    def init_kv(cls, kv):
        """初始化 KV binding"""
        cls.KV = kv


# 导入原有模块（需要适配）
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager


# 状态收集器 - Cloudflare 版本
class StatusCollectorCF:
    """Cloudflare 版本的 StatusCollector - 从环境变量/API 获取状态"""
    
    _status_cache: Optional[dict] = None
    _status_cache_ts: float = 0
    
    @classmethod
    def get_status(cls) -> dict:
        """从环境变量获取系统状态"""
        import time
        current_time = time.time()
        
        # 缓存检查
        if cls._status_cache and (current_time - cls._status_cache_ts) < Config.STATUS_CACHE_TTL:
            return cls._status_cache
        
        # 从环境变量读取状态
        status_json = os.environ.get("OPENCLAW_STATUS", "{}")
        try:
            cls._status_cache = json.loads(status_json)
        except:
            cls._status_cache = {
                "gateway": {"running": False, "message": "Not configured"},
                "cpu": 0,
                "memory": 0,
                "agents": [],
                "channels": []
            }
        
        cls._status_cache_ts = current_time
        return cls._status_cache


# 简单的内存存储（生产环境建议用 KV）
class MemoryStore:
    """简单的内存存储，用于 Cloudflare Workers"""
    
    _data: dict = {
        "users": {"admin": {"username": "admin", "password_hash": "", "must_change_password": True}},
        "integrations": {},
        "todos": []
    }
    
    @classmethod
    async def get(cls, key: str) -> Optional[dict]:
        return cls._data.get(key)
    
    @classmethod
    async def set(cls, key: str, value: dict):
        cls._data[key] = value
    
    @classmethod
    async def save(cls):
        """持久化到 KV"""
        if Config.KV:
            for key, value in cls._data.items():
                await Config.KV.put(key, json.dumps(value))


# 创建 FastAPI 应用
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("OpenClaw Dashboard starting on Cloudflare Workers")
    yield
    print("OpenClaw Dashboard shutting down")


app = FastAPI(
    title="OpenClaw Dashboard",
    description="OpenClaw Dashboard for Cloudflare Workers",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============= API 路由 =============

@app.get("/")
async def root():
    """Dashboard 入口"""
    return {
        "message": "OpenClaw Dashboard API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "platform": "cloudflare-workers"}


# 状态 API
@app.get("/api/status")
async def get_status():
    """获取系统状态"""
    return StatusCollectorCF.get_status()


# 认证 API (简化版)
@app.post("/api/auth/login")
async def login(request: Request):
    """登录"""
    body = await request.json()
    username = body.get("username")
    password = body.get("password")
    
    users = await MemoryStore.get("users")
    user = users.get(username)
    
    if user and user.get("password") == password:  # 简化：生产环境用 hash
        token = f"cf_{username}_{int(__import__('time').time())}"
        return {"token": token, "username": username}
    
    return JSONResponse({"error": "Invalid credentials"}, status_code=401)


@app.get("/api/auth/verify")
async def verify_token(request: Request):
    """验证 token"""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if token.startswith("cf_"):
        return {"valid": True, "username": token.split("_")[1]}
    return JSONResponse({"error": "Invalid token"}, status_code=401)


# 待办 API
@app.get("/api/todos")
async def get_todos():
    """获取待办"""
    return await MemoryStore.get("todos") or []


@app.post("/api/todos")
async def create_todo(request: Request):
    """创建待办"""
    body = await request.json()
    todos = await MemoryStore.get("todos") or []
    todos.append({
        "id": len(todos) + 1,
        "text": body.get("text", ""),
        "done": False,
        "created_at": body.get("created_at")
    })
    await MemoryStore.set("todos", todos)
    await MemoryStore.save()
    return {"success": True}


@app.delete("/api/todos/{todo_id}")
async def delete_todo(todo_id: int):
    """删除待办"""
    todos = await MemoryStore.get("todos") or []
    todos = [t for t in todos if t.get("id") != todo_id]
    await MemoryStore.set("todos", todos)
    await MemoryStore.save()
    return {"success": True}


# 模型用量 API (简化版)
@app.get("/api/usage")
async def get_usage():
    """获取模型用量"""
    return {
        "minimax": {"used": 0, "quota": 0},
        "openai": {"requests": 0},
        "gemini": {"status": "ok"},
        "glm": {"status": "ok"}
    }


@app.post("/api/usage/config")
async def update_usage_config(request: Request):
    """更新用量配置"""
    body = await request.json()
    integrations = await MemoryStore.get("integrations") or {}
    integrations["usage"] = body
    await MemoryStore.set("integrations", integrations)
    await MemoryStore.save()
    return {"success": True}


# ============= Workers HTTP Handler =============

async def on_fetch(request, env):
    """Cloudflare Workers HTTP 处理"""
    
    # 初始化 KV
    if env.get("DASHBOARD"):
        Config.init_kv(env["DASHBOARD"])
    
    # 处理请求
    return await app.asgi_handler(request)
