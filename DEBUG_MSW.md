# MSW 调试指南

## 当前配置状态

✅ Service Worker 已生成：`public/mockServiceWorker.js`
✅ Handlers 已配置：`src/mocks/handlers.ts`
✅ 环境变量：`NEXT_PUBLIC_USE_MOCK=true`

## 调试步骤

### 1. 检查浏览器控制台

打开开发者工具（F12），查看 Console，应该看到：
```
✅ MSW enabled - All API requests will be mocked
```

如果没有看到，检查是否有错误信息。

### 2. 检查 Service Worker

在浏览器开发者工具中：
1. 打开 **Application** 标签（Chrome）或 **Storage** 标签（Firefox）
2. 点击 **Service Workers**
3. 应该看到 `mockServiceWorker.js` 已注册并激活

### 3. 检查网络请求

在 **Network** 标签中：
1. 发送一个请求（如注册）
2. 请求应该被标记为 **(from ServiceWorker)** 或 **(MSW)**
3. 状态码应该是 **200**，不是 **404**

### 4. 如果仍然 404

可能的原因：
1. **Service Worker 未注册**：刷新页面，等待几秒后再试
2. **路径不匹配**：检查 handlers 中的路径是否正确
3. **环境变量未生效**：重启服务器

### 5. 强制重新注册 Service Worker

1. 打开开发者工具
2. Application → Service Workers
3. 点击 **Unregister**（如果有）
4. 刷新页面（硬刷新：Cmd+Shift+R 或 Ctrl+Shift+R）

## 测试方法

在注册页输入任何邮箱地址：
- `test@example.com`
- `user@test.com`
- `anything@email.com`

都应该成功，不会出现 404。

## 如果 MSW 仍然不工作

临时解决方案：修改 handlers 路径为绝对路径匹配

检查 `src/mocks/handlers.ts` 中的路径：
- 应该使用 `*/api/auth/signup`（通配符模式）
- 或者使用 `/api/auth/signup`（相对路径）

