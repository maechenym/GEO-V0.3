# 快速对接真实 API 指南

## 方式一：对接真实 API（推荐）

### 1. 修改 `.env.local` 文件

```bash
# 关闭 MSW，使用真实 API
NEXT_PUBLIC_USE_MOCK=false

# 设置你的真实 API 地址
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
```

### 2. 重启服务器

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

## 需要准备的信息

### API 基础地址
你的后端 API 的完整地址，例如：
- `https://api.example.com/api`
- `https://backend.yourapp.com/v1`
- `http://localhost:8080/api`

### 需要实现的 API 端点

你的后端需要实现以下端点：

| 方法 | 路径 | 请求体 | 响应 |
|------|------|--------|------|
| POST | `/api/auth/signup` | `{"email": "user@example.com"}` | `{"ok": true, "token": "...", "isNew": true}` |
| POST | `/api/auth/login` | `{"email": "user@example.com"}` | `{"ok": true, "token": "...", "isNew": false}` |
| POST | `/api/auth/magic-link` | `{"email": "user@example.com"}` | `{"ok": true}` |
| GET | `/api/auth/magic-link/verify?token=xxx` | - | `{"ok": true, "token": "...", "isNew": false}` |
| GET | `/api/auth/session` | Header: `Authorization: Bearer {token}` | `{"ok": true, "profile": {"id": "...", "email": "...", "hasBrand": false}}` |
| POST | `/api/auth/logout` | Header: `Authorization: Bearer {token}` | `{"ok": true}` |
| GET | `/api/auth/google/callback?code=xxx` | - | `{"ok": true, "token": "...", "isNew": false}` |

## 响应格式示例

### 成功响应
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isNew": true,
  "profile": {
    "id": "u_123",
    "email": "user@example.com",
    "hasBrand": false
  }
}
```

### 错误响应
```json
{
  "ok": false,
  "error": "Invalid email",
  "message": "Please provide a valid email address"
}
```

## CORS 配置

如果你的 API 在不同域名，后端需要配置 CORS：

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 快速测试

对接完成后，你可以：

1. 访问 `/signup` 页面
2. 输入邮箱地址
3. 点击 "Sign up"
4. 查看网络请求是否成功（F12 → Network）

如果仍有 404，检查：
- API 地址是否正确
- 后端是否已实现相应端点
- CORS 是否配置正确

