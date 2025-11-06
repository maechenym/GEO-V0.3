# API 对接配置说明

## 🚀 快速切换到真实 API

### 步骤 1：修改 `.env.local`

编辑 `.env.local` 文件，设置：

```env
# 关闭 MSW Mock
NEXT_PUBLIC_USE_MOCK=false

# 设置你的真实 API 地址
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
```

### 步骤 2：重启服务器

```bash
# 在终端按 Ctrl+C 停止服务器
# 然后重新启动
npm run dev
```

## 📋 需要的信息

### 1. API 基础地址
你的后端 API 的完整地址，例如：
- `https://api.example.com/api`
- `https://backend.yourapp.com/v1`  
- `http://localhost:8080/api`

### 2. 需要实现的 API 端点

你的后端必须实现以下 7 个端点：

#### ✅ 1. 注册
```
POST /api/auth/signup
Body: { "email": "user@example.com" }
Response: { "ok": true, "token": "jwt_token", "isNew": true }
```

#### ✅ 2. 登录
```
POST /api/auth/login
Body: { "email": "user@example.com" }
Response: { "ok": true, "token": "jwt_token", "isNew": false }
```

#### ✅ 3. 发送 Magic Link
```
POST /api/auth/magic-link
Body: { "email": "user@example.com" }
Response: { "ok": true }
```

#### ✅ 4. 验证 Magic Link
```
GET /api/auth/magic-link/verify?token=xxx
Response: { "ok": true, "token": "jwt_token", "isNew": false }
```

#### ✅ 5. 获取用户资料
```
GET /api/auth/session
Header: Authorization: Bearer {token}
Response: { "ok": true, "profile": { "id": "u_1", "email": "...", "hasBrand": false } }
```

#### ✅ 6. 登出
```
POST /api/auth/logout
Header: Authorization: Bearer {token}
Response: { "ok": true }
```

#### ✅ 7. Google 登录回调
```
GET /api/auth/google/callback?code=xxx
Response: { "ok": true, "token": "jwt_token", "isNew": false }
```

## 📝 响应格式要求

### 成功响应格式
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isNew": true,  // 可选
  "profile": {    // 可选
    "id": "u_123",
    "email": "user@example.com",
    "hasBrand": false
  }
}
```

### 错误响应格式
```json
{
  "ok": false,
  "error": "Error code",
  "message": "Detailed error message"
}
```

## 🔒 CORS 配置

如果你的 API 在不同域名，后端必须配置 CORS：

```javascript
// Express.js 示例
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

## ✅ 测试清单

对接完成后，测试以下流程：

- [ ] 注册：输入邮箱 → Sign up → 成功
- [ ] 登录：输入邮箱 → Login → 成功
- [ ] Magic Link：发送 → 收到验证链接 → 点击验证 → 成功
- [ ] Google 登录：点击按钮 → 授权 → 回调 → 成功
- [ ] 获取用户资料：登录后自动加载
- [ ] 登出：点击登出 → token 清除

## 🔍 调试技巧

1. **打开浏览器开发者工具**（F12）
2. **查看 Network 标签**：检查 API 请求和响应
3. **查看 Console 标签**：查看错误日志
4. **检查请求 URL**：确认是否发送到正确的地址
5. **检查响应状态码**：200 = 成功，404 = 端点不存在，401 = 未授权

## 💡 示例配置

### 开发环境
```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### 生产环境
```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com/api
```

---

**注意**：修改 `.env.local` 后必须重启开发服务器才能生效！

