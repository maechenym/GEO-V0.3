import { Rocket, Wrench, LineChart, HelpCircle, User, BookOpen } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface DocNavItem {
  title: string
  href: string
  icon?: LucideIcon
  children?: DocNavItem[]
}

// 导航配置 - 根据文档内容手动维护
export const docsNavigation: DocNavItem[] = [
  {
    title: "欢迎来到 ximu",
    href: "/docs",
    icon: Rocket,
    children: [
      {
        title: "关于 ximu",
        href: "/docs#关于-ximu",
      },
      {
        title: "ximu 是什么",
        href: "/docs#ximu-是什么",
      },
    ],
  },
  {
    title: "快速入门",
    href: "/docs#快速入门",
    icon: Rocket,
    children: [
      {
        title: "快速入门说明",
        href: "/docs#快速入门说明",
      },
      {
        title: "注册账号",
        href: "/docs#注册账号",
      },
      {
        title: "配置您的品牌与产品",
        href: "/docs#配置您的品牌与产品",
      },
      {
        title: "进入数据准备期",
        href: "/docs#进入数据准备期",
      },
      {
        title: "探索您的分析报告",
        href: "/docs#探索您的分析报告",
      },
    ],
  },
  {
    title: "核心功能模块详解",
    href: "/docs#核心功能模块详解",
    icon: BookOpen,
    children: [
      {
        title: "总览（Overview）",
        href: "/docs#总览overview",
      },
      {
        title: "可见度分析（Visibility）",
        href: "/docs#可见度分析visibility",
      },
      {
        title: "情绪分析（Sentiment）",
        href: "/docs#情绪分析sentiment",
      },
      {
        title: "引用来源分析（Sources）",
        href: "/docs#引用来源分析sources",
      },
      {
        title: "提示词分析（Prompt Insights）",
        href: "/docs#提示词分析prompt-insights",
      },
    ],
  },
  {
    title: "理解您的核心指标",
    href: "/docs#理解您的核心指标",
    icon: LineChart,
    children: [
      {
        title: "指标说明",
        href: "/docs#指标说明",
      },
    ],
  },
  {
    title: "账户与团队管理",
    href: "/docs#账户与团队管理",
    icon: User,
    children: [
      {
        title: "设置",
        href: "/docs#设置",
      },
      {
        title: "个人资料",
        href: "/docs#个人资料",
      },
    ],
  },
  {
    title: "常见问题解答",
    href: "/docs#常见问题解答",
    icon: HelpCircle,
    children: [
      {
        title: "FAQ",
        href: "/docs#faq",
      },
    ],
  },
  {
    title: "支持与反馈",
    href: "/docs#支持与反馈",
    icon: Wrench,
    children: [
      {
        title: "联系方式",
        href: "/docs#联系方式",
      },
    ],
  },
]

/**
 * 查找当前页面的导航项
 */
export function findCurrentNavItem(
  pathname: string,
  nav: DocNavItem[] = docsNavigation
): DocNavItem | null {
  for (const item of nav) {
    if (item.href === pathname) {
      return item
    }
    if (item.children) {
      const found = findCurrentNavItem(pathname, item.children)
      if (found) return found
    }
  }
  return null
}

/**
 * 检查路径是否激活
 */
export function isActivePath(href: string, currentPath: string): boolean {
  if (href === currentPath) return true
  if (currentPath.startsWith(href) && href !== '/docs') return true
  return false
}

