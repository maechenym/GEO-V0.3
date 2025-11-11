/**
 * Overview 页面数据类型定义
 */

export interface OverviewKPI {
  name: "Reach" | "Rank" | "Focus" | "Sentiment" | "Visibility"
  value: number
  delta: number
  unit: string
  description: string
}

export interface BrandInfluenceData {
  date: string // YYYY-MM-DD
  brandInfluence: number
}

export interface CompetitorRanking {
  rank: number
  name: string
  score: number
  delta: number
  isSelf: boolean
}

export interface OverviewSource {
  domain: string
  mentionCount: number
  mentionShare: number
  mentionsSelf: boolean
}

export interface OverviewTopic {
  topic: string
  mentionCount: number
  mentionShare: number
}

export interface OverviewData {
  kpis: OverviewKPI[]
  brandInfluence: {
    current: number
    previousPeriod: number
    changeRate: number
    trend: BrandInfluenceData[]
  }
  ranking: CompetitorRanking[]
  sources: OverviewSource[]
  topics: OverviewTopic[]
  competitorTrends?: Record<string, BrandInfluenceData[]>
  // 实际日期范围（API返回的数据日期范围，已调整）
  actualDateRange?: {
    start: string // YYYY-MM-DD
    end: string // YYYY-MM-DD
  }
}
export interface OverviewQueryParams {
  start?: string
  end?: string
}


