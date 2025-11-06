# API 对接配置指南

## 方式一：使用真实 API（关闭 MSW）

### 步骤 1：关闭 MSW

在 `.env.local` 文件中设置：

```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
NODE_ENV=production
```

### 步骤 2：配置 API 基础地址

将 `NEXT_PUBLIC_API_BASE_URL` 设置为你的真实 API 地址：

```env
# 示例
NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com/api
# 或
NEXT_PUBLIC_API_BASE_URL=https://backend.example.com/api/v1
```

### 步骤 3：重启服务器

```bash
# 停止当前服务器
# 重新启动
npm run dev
```

## 需要实现的 API 端点

你的后端需要实现以下端点：

### 1. 注册
**POST** `/api/auth/signup`
```json
请求体: { "email": "user@example.com" }
响应: { "ok": true, "token": "jwt_token_here", "isNew": true }
```

### 2. 登录
**POST** `/api/auth/login`
```json
请求体: { "email": "user@example.com" }
响应: { "ok": true, "token": "jwt_token_here", "isNew": false }
```

### 3. 发送 Magic Link
**POST** `/api/auth/magic-link`
```json
请求体: { "email": "user@example.com" }
响应: { "ok": true }
```

### 4. 验证 Magic Link
**GET** `/api/auth/magic-link/verify?token=xxx`
```json
响应: { "ok": true, "token": "jwt_token_here", "isNew": false }
```

### 5. 获取用户资料
**GET** `/api/auth/session`
```json
请求头: Authorization: Bearer {token}
响应: { "ok": true, "profile": { "id": "u_1", "email": "user@example.com", "hasBrand": false } }
```

### 6. 登出
**POST** `/api/auth/logout`
```json
请求头: Authorization: Bearer {token}
响应: { "ok": true }
```

### 7. Google 登录回调
**GET** `/api/auth/google/callback?code=xxx`
```json
响应: { "ok": true, "token": "jwt_token_here", "isNew": false }
```

## 响应格式要求

所有 API 响应都应该是 JSON 格式，并且遵循以下结构：

### 成功响应
```json
{
  "ok": true,
  "token": "...",  // 可选
  "isNew": false,  // 可选
  "profile": {...} // 可选
}
```

### 错误响应
```json
{
  "ok": false,
  "error": "Error message",
  "message": "Detailed error message" // 可选
}
```

## CORS 配置

如果你的 API 在不同域名，需要配置 CORS：

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 认证 Token

- Token 通过 `Authorization: Bearer {token}` 头部发送
- Token 存储在 localStorage 中
- 401 错误会自动清除 token 并跳转到登录页

## 环境变量说明

- `NEXT_PUBLIC_API_BASE_URL`: API 基础地址（必须以 `/api` 结尾或包含完整路径）
- `NEXT_PUBLIC_USE_MOCK`: 是否使用 MSW mock
  - `true` 或未设置：使用 MSW
  - `false`：使用真实 API

