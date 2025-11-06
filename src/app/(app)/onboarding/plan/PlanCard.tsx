"use client"

import { Check } from "lucide-react"

/**
 * Plan Card 组件
 * 
 * 显示试用清单
 */
export function PlanCard() {
  const features = [
    {
      title: "7 天全功能免费试用",
      description: "体验所有核心功能",
    },
    {
      title: "1 个产品",
      description: "监测一个产品的 AI 搜索表现",
    },
    {
      title: "5 个竞品监测",
      description: "追踪最多 5 个竞争对手",
    },
    {
      title: "50 个 AI 查询额度",
      description: "每月可使用 50 个 AI 查询",
    },
    {
      title: "邀请奖励",
      description: "每成功邀请一家企业客户注册，赠送 7 天试用期",
    },
  ]

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-6">试用包含</h2>
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{feature.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

