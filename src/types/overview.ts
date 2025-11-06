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

export interface OverviewData {
  kpis: OverviewKPI[]
  brandInfluence: {
    current: number
    previousPeriod: number
    changeRate: number
    trend: BrandInfluenceData[]
  }
  ranking: CompetitorRanking[]
}
export interface OverviewQueryParams {
  start?: string
  end?: string
}


