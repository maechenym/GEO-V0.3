# GEO - AI-Powered Brand Visibility & Analytics Platform

<div align="center">

![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**一个现代化的 AI 驱动品牌影响力分析与竞品追踪平台**

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [技术栈](#-技术栈) • [项目结构](#-项目结构)

</div>

---

## 📖 项目简介

GEO (ximu) 是一个基于 Next.js 14 构建的现代化品牌影响力分析平台，帮助品牌和产品团队实时追踪市场可见度、情绪分析、竞品动态和用户意图。平台提供直观的数据可视化和深度分析，助力数据驱动的商业决策。

### 核心价值

- 🎯 **实时品牌影响力追踪** - 多维度 KPI 指标监控
- 📊 **智能数据分析** - AI 驱动的情绪、意图和来源分析
- 🔍 **竞品对比分析** - 深度竞品追踪和对比
- 👥 **团队协作** - 多用户权限管理和团队协作
- 🌐 **多语言支持** - 英文/繁体中文双语界面

---

## ✨ 功能特性

### 🔐 认证与用户管理
- ✅ 邮箱密码注册/登录
- ✅ Google OAuth 登录
- ✅ Magic Link 无密码登录
- ✅ 用户会话管理
- ✅ 基于 `hasBrand` 的智能路由跳转

### 📈 数据分析模块

#### Overview（概览）
- **KPI 指标卡片**：Reach、Rank、Focus、Sentiment、Brand Influence、Visibility
- **时间范围筛选**：1/7/14/30 天、自定义日期范围
- **趋势图表**：多维度数据可视化
- **环比分析**：自动计算增长/下降趋势

#### Insights（深度分析）
- **Visibility（可见度分析）**：品牌曝光度和市场可见度追踪
- **Sentiment（情绪分析）**：正面/负面/中性情绪分布
- **Sources（来源分析）**：数据来源渠道分析
- **Intent（意图分析）**：用户搜索意图洞察

### 🏢 品牌与产品管理
- ✅ 品牌信息管理
- ✅ 产品列表管理（增删改查）
- ✅ 产品分类管理
- ✅ 产品激活/停用状态控制
- ✅ 目标用户画像（Personas）管理
- ✅ 竞品（Competitors）管理

### 👥 团队协作
- ✅ 团队成员邀请
- ✅ 角色权限管理（Admin/Viewer）
- ✅ 团队成员列表管理

### 🎨 用户体验
- ✅ 响应式设计（移动端/桌面端）
- ✅ 深色/浅色主题支持
- ✅ 流畅的页面动画（Framer Motion）
- ✅ 实时表单验证
- ✅ Toast 通知系统
- ✅ 加载状态和错误处理

### 🚀 Onboarding 流程
- ✅ 品牌和产品信息录入
- ✅ 等待列表（Waitlist）管理
- ✅ 智能路由跳转（根据用户状态）

---

## 🛠️ 技术栈

### 核心框架
- **Next.js 14.2** - React 框架（App Router）
- **TypeScript 5.4** - 类型安全
- **React 18.2** - UI 库

### 样式与 UI
- **Tailwind CSS 3.4** - 实用优先的 CSS 框架
- **shadcn/ui** - 高质量 React 组件库
- **Radix UI** - 无样式、可访问的组件原语
- **Framer Motion** - 动画库
- **Lucide React** - 图标库

### 状态管理与数据
- **Zustand 4.5** - 轻量级状态管理（持久化存储）
- **React Query (TanStack Query) 5.28** - 服务端状态管理
- **React Hook Form 7.51** - 表单管理
- **Zod 3.23** - 模式验证

### 数据可视化
- **Recharts 3.3** - 图表库

### 开发工具
- **MSW 2.0** - API Mock（Mock Service Worker）
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Husky** - Git Hooks
- **Commitlint** - 提交信息规范

### 支付集成
- **Stripe** - 支付处理

---

## 📦 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn

### 安装步骤

```bash
# 克隆项目
git clone <repository-url>
cd GEO-V0.4

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，设置以下变量：
# NEXT_PUBLIC_USE_MOCK=true  # 使用 Mock 数据（开发模式）

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 可用脚本

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 检查代码格式
npm run format:check
```

---

## 📁 项目结构

```
GEO-V0.4/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/             # 需要认证的应用页面
│   │   │   ├── overview/      # 概览页面
│   │   │   ├── insights/      # 分析页面（visibility, sentiment, sources, intent）
│   │   │   ├── onboarding/    # 新手引导流程
│   │   │   ├── settings/      # 设置页面（产品、计划、团队）
│   │   │   └── profile/       # 用户资料
│   │   ├── (auth)/            # 认证相关页面
│   │   │   ├── login/         # 登录页
│   │   │   ├── signup/        # 注册页
│   │   │   └── auth/          # OAuth 回调
│   │   ├── (public)/          # 公共页面
│   │   └── api/               # API 路由
│   ├── components/            # React 组件
│   │   ├── ui/               # shadcn/ui 基础组件
│   │   ├── products/         # 产品相关组件
│   │   ├── overview/         # 概览相关组件
│   │   └── ...
│   ├── store/                # Zustand 状态管理
│   ├── hooks/                # 自定义 Hooks
│   ├── services/             # API 服务
│   ├── types/                # TypeScript 类型定义
│   ├── lib/                  # 工具函数
│   └── mocks/                # MSW Mock 数据
├── public/                   # 静态资源
├── data/                     # 数据文件
└── scripts/                  # 脚本文件
```

---

## 🔧 环境变量

在 `.env.local` 文件中配置：

```env
# Mock 模式开关
NEXT_PUBLIC_USE_MOCK=true

# Stripe 配置（生产环境）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret

# 其他环境变量...
```

---

## 🧪 测试账号

### 可直接进入 Overview 的账号
- **邮箱**: `test@example.com`
- **密码**: 任意（Mock 模式下不验证）
- **说明**: 该账号已预配置品牌和产品数据，登录后直接进入概览页面

### 新用户流程
- 使用其他邮箱注册（如 `new@example.com`）
- 注册后进入 Onboarding 流程
- 填写品牌和产品信息
- 加入等待列表（Waitlist）

---

## 🎨 设计系统

### 品牌色
- **主色**: `#0000D2` (ximu Blue)
- **支持**: Tailwind CSS 自定义主题

### UI 组件
- 基于 **shadcn/ui** 构建
- 完全可定制
- 支持深色/浅色主题
- 响应式设计

---

## 📚 核心功能说明

### 路由保护
- 使用 `AuthGuard` 组件保护需要认证的路由
- 根据 `profile.hasBrand` 自动跳转：
  - `hasBrand=false` → `/onboarding/brand`
  - `hasBrand=true` → `/overview`

### 数据 Mock
- 开发环境使用 MSW (Mock Service Worker) 模拟 API
- 支持完整的用户流程测试
- 预配置测试数据

### 状态持久化
- 使用 Zustand + persist 中间件
- 用户认证状态、品牌信息等自动持久化
- 支持 localStorage

---

## 🚀 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署

### 其他平台

```bash
# 构建
npm run build

# 启动生产服务器
npm run start
```

---

## 📝 开发规范

### 提交规范
使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

### 代码风格
- 使用 ESLint 和 Prettier
- 提交前自动格式化（Husky + lint-staged）
- TypeScript 严格模式

---

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 📞 联系方式

- **项目名称**: GEO (ximu)
- **版本**: 0.3.0
- **品牌色**: #0000D2

---

<div align="center">

**Built with ❤️ using Next.js 14**

</div>
