# 项目结构

```
GEO V0.2/
├── .husky/                    # Git hooks
│   ├── commit-msg             # Commit message linting
│   └── pre-commit             # Pre-commit linting
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (public)/          # 公共路由组
│   │   │   └── public/
│   │   │       └── page.tsx
│   │   ├── (auth)/            # 认证路由组
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (app)/             # 受保护应用路由组
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   ├── globals.css        # 全局样式 + Tailwind + 主题变量
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/
│   │   ├── ui/                # shadcn/ui 组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── label.tsx
│   │   └── providers.tsx       # React Query Provider
│   ├── services/
│   │   └── api.ts             # Axios 实例 + 拦截器（401处理）
│   ├── store/
│   │   └── useAuthStore.ts    # Zustand 状态管理
│   ├── types/
│   │   └── index.ts           # TypeScript 类型定义
│   ├── mocks/
│   │   └── index.ts           # Mock 数据
│   └── lib/
│       └── utils.ts           # 工具函数（cn helper）
├── .eslintrc.json             # ESLint 配置
├── .eslintignore              # ESLint 忽略文件
├── .prettierrc                # Prettier 配置
├── .prettierignore            # Prettier 忽略文件
├── .gitignore                 # Git 忽略文件
├── commitlint.config.js       # Commitlint 配置（Conventional Commits）
├── components.json            # shadcn/ui 配置
├── next.config.js             # Next.js 配置
├── package.json               # 依赖和脚本
├── postcss.config.js          # PostCSS 配置
├── tailwind.config.ts         # Tailwind CSS 配置（品牌色 #0000D2）
├── tsconfig.json              # TypeScript 配置
├── .env.example               # 环境变量示例
├── README.md                  # 项目文档
└── PROJECT_STRUCTURE.md       # 本文件
```

## 主要特性

### 路由组织
- `(public)/*` - 无需认证的公共页面
- `(auth)/*` - 认证相关页面（登录、注册等）
- `(app)/*` - 需要认证的应用页面（受保护路由）

### 核心功能
- ✅ Axios 实例配置了请求/响应拦截器
- ✅ 401 错误自动处理（清除 token 并跳转登录）
- ✅ Zustand store 持久化存储
- ✅ React Query 全局配置
- ✅ react-hook-form + Zod 表单验证示例

### 样式系统
- Tailwind CSS 配置了品牌主色 `#0000D2`
- 支持浅色/深色主题切换
- shadcn/ui 组件系统

