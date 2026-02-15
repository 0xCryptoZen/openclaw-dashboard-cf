// Cloudflare Pages 函数 - API 代理
// 创建 functions/api/[...].js 来代理 API 请求到 Workers

export async function onRequest(context) {
  const { request, env } = context;
  
  // 获取 API 请求并转发到 Workers 后端
  const url = new URL(request.url);
  const apiPath = url.pathname.replace('/api', '');
  
  // 假设 Workers 部署在同一个账户下
  const workersUrl = `https://openclaw-dashboard.workers.dev${apiPath}${url.search}`;
  
  const response = await fetch(workersUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });
  
  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  });
}
