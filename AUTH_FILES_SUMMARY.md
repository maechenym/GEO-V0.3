# 注册登录页与鉴权流 - 文件结构树与代码汇总

## 📁 完整文件结构树

```
GEO V0.2/
├── src/
│   ├── types/
│   │   └── auth.ts                           ✨ 新增：Auth API 类型定义（Zod schemas）
│   │
│   ├── store/
│   │   ├── auth.store.ts                     ✨ 新增：认证 Store（token, profile, isNew）
│   │   └── useAuthStore.ts                   ⚠️  旧文件（保留，建议后续删除）
│   │
│   ├── mocks/
│   │   ├── handlers.ts                       ✨ 新增：MSW Mock Handlers
│   │   ├── browser.ts                        ✨ 新增：MSW Browser Worker 设置
│   │   └── index.ts                          📄 已存在
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   └── form-message.tsx             ✨ 新增：表单错误消息组件
│   │   ├── auth-guard.tsx                    🔄 更新：使用新 auth store
│   │   └── providers.tsx                      🔄 更新：集成 MSW
│   │
│   ├── services/
│   │   └── api.ts                            🔄 更新：401 重定向路径修正
│   │
│   └── app/(auth)/
│       ├── login/
│       │   └── page.tsx                      🔄 更新：Magic Link + Google 登录
│       │
│       ├── signup/
│       │   └── page.tsx                      🔄 更新：Magic Link + Google 注册
│       │
│       └── auth/
│           ├── check-inbox/
│           │   └── page.tsx                  ✨ 新增：Magic Link 发送成功页面
│           │
│           ├── callback/
│           │   └── page.tsx                  ✨ 新增：Magic Link 验证回调
│           │
│           └── google/
│               ├── page.tsx                  ✨ 新增：Google 登录确认页
│               └── callback/
│                   └── page.tsx              ✨ 新增：Google 登录回调
│
├── package.json                              🔄 更新：添加 msw 依赖
├── .env.example                              🔄 更新：添加 NEXT_PUBLIC_USE_MOCK
├── AUTH_IMPLEMENTATION.md                    ✨ 新增：实现文档与自测清单
└── AUTH_FILES_SUMMARY.md                     ✨ 本文件
```

## 🔑 关键文件代码清单

### 1. 类型定义 (`src/types/auth.ts`)
- ✅ 所有 API 响应的 Zod schemas
- ✅ TypeScript 类型导出
- ✅ 包含：SignupResponse, LoginResponse, MagicLinkResponse, SessionResponse 等

### 2. Auth Store (`src/store/auth.store.ts`)
- ✅ Zustand store with persist
- ✅ state: token, profile, isNew, isLoading
- ✅ actions: loginWithToken, loadProfile, logout, setToken, setProfile, setIsNew

### 3. MSW Handlers (`src/mocks/handlers.ts`)
- ✅ POST /api/auth/signup
- ✅ POST /api/auth/login
- ✅ POST /api/auth/magic-link
- ✅ GET /api/auth/magic-link/verify
- ✅ GET /api/auth/session
- ✅ POST /api/auth/logout
- ✅ GET /api/auth/google/callback

### 4. 页面组件

#### `/login` 页面
- ✅ Email 输入（Zod 邮箱校验）
- ✅ Login 按钮（POST /api/auth/login）
- ✅ Send Magic Link 按钮（POST /api/auth/magic-link）
- ✅ Continue with Google 按钮
- ✅ 已登录自动重定向
- ✅ 表单验证与错误提示

#### `/signup` 页面
- ✅ Email 输入（Zod 邮箱校验）
- ✅ Sign up 按钮（POST /api/auth/signup）
- ✅ Send Magic Link 按钮
- ✅ Continue with Google 按钮
- ✅ 已登录自动重定向
- ✅ isNew=true 优先跳转 onboarding

#### `/auth/check-inbox` 页面
- ✅ H1: "Check your inbox"
- ✅ P: "We've sent a magic link to your email address."
- ✅ Go back 按钮（链接到 /login）

#### `/auth/callback` 页面
- ✅ 从 searchParams 获取 token
- ✅ 调用 GET /api/auth/magic-link/verify
- ✅ 成功后写入 token → loadProfile → 跳转
- ✅ 失败显示错误与 "Resend magic link"
- ✅ Suspense 包装（useSearchParams）

#### `/auth/google` 页面
- ✅ 显示 "Sign in with Google" 标题
- ✅ "Confirm sign in with Google" 按钮
- ✅ 点击跳转到 /auth/google/callback?code=mock

#### `/auth/google/callback` 页面
- ✅ 从 searchParams 读取 code
- ✅ 调用 GET /api/auth/google/callback?code=mock
- ✅ 成功后写入 token → loadProfile → 跳转
- ✅ Suspense 包装

### 5. 路由守卫 (`src/components/auth-guard.tsx`)
- ✅ 未登录访问受保护页面 → 重定向 /login
- ✅ 已登录访问 /login|/signup → 重定向 /overview
- ✅ 无品牌用户强制 onboarding
- ✅ 已完成 onboarding 不允许访问 onboarding 页面

## 🎯 实现完成度

### ✅ 已完成功能

1. **页面创建**
   - ✅ 登录页（/login）
   - ✅ 注册页（/signup）
   - ✅ Check Inbox 页（/auth/check-inbox）
   - ✅ Magic Link 回调页（/auth/callback）
   - ✅ Google 登录确认页（/auth/google）
   - ✅ Google 登录回调页（/auth/google/callback）

2. **认证功能**
   - ✅ Magic Link 登录流程
   - ✅ Google 登录流程（模拟）
   - ✅ 邮箱密码登录（可选占位）
   - ✅ 表单验证（Zod + RHF）
   - ✅ Token 管理与持久化

3. **状态管理**
   - ✅ Zustand Auth Store
   - ✅ Profile 加载
   - ✅ isNew 标识
   - ✅ hasBrand 检查

4. **路由守卫**
   - ✅ 未登录保护
   - ✅ 已登录重定向
   - ✅ Onboarding 强制流程

5. **Mock 与开发工具**
   - ✅ MSW Handlers
   - ✅ 环境变量开关
   - ✅ 错误处理

6. **UI/UX**
   - ✅ 表单验证反馈
   - ✅ 加载状态
   - ✅ 错误提示
   - ✅ 键盘导航
   - ✅ A11y 支持

## 📝 运行与测试

详见 `AUTH_IMPLEMENTATION.md` 文档中的：
- 运行说明
- 自测清单
- API Mock 说明
- 注意事项

## 🔄 下一步建议

1. **删除旧文件**：`src/store/useAuthStore.ts`（已被 `auth.store.ts` 替代）
2. **更新引用**：检查是否有其他地方引用旧的 `useAuthStore`
3. **真实 API 对接**：关闭 MSW 后对接真实后端
4. **Magic Link 实现**：后端生成真实的 JWT token
5. **Google OAuth**：配置真实的 Google OAuth Client ID

