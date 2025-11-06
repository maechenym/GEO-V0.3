# 路由跳转逻辑文档

## 页面跳转流程图

```
首页 (/)
├── "Start Free Trial" → /signup
└── "Sign In" → /login

注册 (/signup)
├── 注册成功 → /onboarding/brand（新用户默认无品牌）

登录 (/login)
├── 登录成功：
│   ├── 首次用户无品牌 → /onboarding/brand
│   └── 已有品牌 → /overview

Onboarding (/onboarding/brand)
├── 完成品牌设置 → /overview（更新 hasBrand = true）

应用区域 (所有 /app/* 路由)
├── 未登录访问 → 重定向 /login
├── 已登录但无品牌 → 强制 /onboarding/brand
└── 已完成 onboarding → 正常访问

导航交互
├── Logo 点击 → /overview
├── 用户头像 → 下拉菜单
│   ├── Profile → /profile
│   └── Logout → /login（清空状态）
```

## 路由守卫规则

### 1. 未登录访问受保护区域
- **规则**: 访问 `(app)` 路由组中的任何页面
- **动作**: 自动重定向到 `/login`
- **实现**: `AuthGuard` 组件检查 `isAuthenticated` 状态

### 2. 新用户强制 onboarding
- **规则**: 已登录但 `user.hasBrand === false`
- **动作**: 强制跳转到 `/onboarding/brand`
- **例外**: 如果已经在 `/onboarding/*` 路径中，允许访问
- **实现**: `AuthGuard` 检查用户品牌状态

### 3. 已完成 onboarding 的用户
- **规则**: `user.hasBrand === true` 且访问 `/onboarding/*`
- **动作**: 重定向到 `/overview`
- **目的**: 防止已完成流程的用户重复访问 onboarding

## useAuth Hook

提供统一的认证接口：

```typescript
const {
  // 状态
  user,           // 用户信息（包含 hasBrand）
  token,          // JWT token
  isAuthenticated, // 是否已登录
  isLoading,      // 加载状态
  
  // 方法
  login,          // 登录（自动跳转）
  signup,         // 注册（自动跳转）
  logout,         // 登出（自动跳转）
  setUser,        // 更新用户信息
} = useAuth()
```

### 登录流程

```typescript
// login 函数内部逻辑
async function login(email, password) {
  1. 调用 store.login() → 返回 { hasBrand }
  2. 根据 hasBrand 决定跳转：
     - false → /onboarding/brand
     - true  → /overview
}
```

### 注册流程

```typescript
// signup 函数内部逻辑
async function signup(email, password, name) {
  1. 调用 store.signup() → 返回 { hasBrand: false }
  2. 新用户默认无品牌，跳转到 /onboarding/brand
}
```

### 登出流程

```typescript
// logout 函数内部逻辑
function logout() {
  1. 清空 Zustand store（user, token, isAuthenticated）
  2. 清空 localStorage
  3. 跳转到 /login
}
```

## 导航交互

### Logo 点击
- **路径**: `/overview`
- **实现**: `AppHeader` 中的 `<Link href="/overview">`

### 用户菜单
- **触发**: 点击顶部右侧用户头像
- **选项**:
  - **Profile**: 跳转到 `/profile`
  - **Logout**: 调用 `useAuth().logout()` → 自动跳转到 `/login`

## 文件结构

```
src/
├── hooks/
│   └── useAuth.ts              # 认证 Hook（封装登录/注册/登出逻辑）
├── store/
│   └── useAuthStore.ts          # Zustand 状态管理（用户信息、token、品牌状态）
├── components/
│   ├── auth-guard.tsx           # 路由守卫组件
│   ├── app-header.tsx           # 顶部导航栏（Logo + 用户菜单）
│   └── app-shell.tsx            # 应用壳（Header + Sidebar + Content）
└── app/
    ├── page.tsx                 # 首页（公共展示页）
    ├── signup/page.tsx          # 注册页面
    ├── (auth)/login/page.tsx    # 登录页面
    └── (app)/
        ├── layout.tsx           # 应用主布局（使用 AppShell）
        ├── onboarding/
        │   ├── layout.tsx        # Onboarding 布局（不使用 AppShell）
        │   └── brand/page.tsx   # 品牌设置页面
        └── ...                  # 其他应用页面
```

## 注意事项

1. **onboarding 页面**不使用 `AppShell`，保持独立流程
2. **路由守卫**在根 `layout.tsx` 中通过 `AuthGuard` 统一处理
3. **品牌状态**在完成 onboarding 后更新 `user.hasBrand = true`
4. **localStorage** 存储 token 和 auth-storage（Zustand persist）

