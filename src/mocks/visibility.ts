import {
  VisibilityRanking,
  VisibilityDataPoint,
  VisibilityMetric,
} from "@/types/visibility"

/**
 * Simulate async loading delay
 */
export const simulateLoad = <T>(data: T, delay: number = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

/**
 * Generate dates array
 */
function generateDates(days: number): string[] {
  const today = new Date()
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d.toISOString().split("T")[0])
  }
  return dates
}

/**
 * Generate trend data
 */
function genTrend(base: number, dates: string[]): number[] {
  let cur = base
  return dates.map(() => {
    cur = Math.max(0, Math.min(100, cur + (Math.random() - 0.5) * base * 0.15))
    return Math.round(cur * 10) / 10
  })
}

/**
 * Mock brands
 */
const mockBrands = [
  "Your Brand",
  "Competitor A",
  "Competitor B",
  "Competitor C",
  "Competitor D",
  "Competitor E",
  "Competitor F",
  "Competitor G",
  "Competitor H",
  "Competitor I",
  "Competitor J",
  "Competitor K",
  "Competitor L",
  "Competitor M",
  "Competitor N",
  "Competitor O",
  "Competitor P",
  "Competitor Q",
  "Competitor R",
  "Competitor S",
  "Competitor T",
]

/**
 * Generate dates for trend data
 */
const dates = generateDates(30)

/**
 * Mock Visibility Ranking Data - Extended to 21 brands
 */
export const mockVisibilityRanking: VisibilityRanking[] = [
  {
    brand: "Your Brand",
    reach: 74.3,
    rank: 2.1,
    focus: 33.5,
    reachDelta: 2.1,
    rankDelta: -0.3,
    focusDelta: 3.8,
    isSelf: true,
  },
  {
    brand: "Competitor A",
    reach: 68.5,
    rank: 2.5,
    focus: 28.2,
    reachDelta: 1.5,
    rankDelta: -0.2,
    focusDelta: 2.1,
  },
  {
    brand: "Competitor B",
    reach: 62.3,
    rank: 3.2,
    focus: 22.8,
    reachDelta: -1.2,
    rankDelta: 0.5,
    focusDelta: -1.5,
  },
  {
    brand: "Competitor C",
    reach: 55.8,
    rank: 3.8,
    focus: 18.5,
    reachDelta: 0.8,
    rankDelta: -0.1,
    focusDelta: 1.2,
  },
  {
    brand: "Competitor D",
    reach: 48.2,
    rank: 4.5,
    focus: 15.3,
    reachDelta: -2.3,
    rankDelta: 0.8,
    focusDelta: -2.1,
  },
  {
    brand: "Competitor E",
    reach: 45.5,
    rank: 4.8,
    focus: 14.2,
    reachDelta: 1.2,
    rankDelta: -0.3,
    focusDelta: 0.8,
  },
  {
    brand: "Competitor F",
    reach: 42.3,
    rank: 5.2,
    focus: 12.8,
    reachDelta: -0.5,
    rankDelta: 0.4,
    focusDelta: -1.1,
  },
  {
    brand: "Competitor G",
    reach: 39.8,
    rank: 5.5,
    focus: 11.5,
    reachDelta: 0.6,
    rankDelta: -0.2,
    focusDelta: 0.9,
  },
  {
    brand: "Competitor H",
    reach: 36.2,
    rank: 6.1,
    focus: 10.2,
    reachDelta: -1.1,
    rankDelta: 0.6,
    focusDelta: -0.8,
  },
  {
    brand: "Competitor I",
    reach: 33.5,
    rank: 6.5,
    focus: 9.1,
    reachDelta: 0.4,
    rankDelta: -0.1,
    focusDelta: 0.5,
  },
  {
    brand: "Competitor J",
    reach: 30.8,
    rank: 7.2,
    focus: 8.3,
    reachDelta: -0.8,
    rankDelta: 0.5,
    focusDelta: -0.6,
  },
  {
    brand: "Competitor K",
    reach: 28.5,
    rank: 7.8,
    focus: 7.5,
    reachDelta: 0.3,
    rankDelta: -0.2,
    focusDelta: 0.4,
  },
  {
    brand: "Competitor L",
    reach: 25.2,
    rank: 8.5,
    focus: 6.8,
    reachDelta: -0.6,
    rankDelta: 0.7,
    focusDelta: -0.5,
  },
  {
    brand: "Competitor M",
    reach: 22.8,
    rank: 9.1,
    focus: 6.2,
    reachDelta: 0.2,
    rankDelta: -0.1,
    focusDelta: 0.3,
  },
  {
    brand: "Competitor N",
    reach: 20.5,
    rank: 9.8,
    focus: 5.8,
    reachDelta: -0.4,
    rankDelta: 0.6,
    focusDelta: -0.4,
  },
  {
    brand: "Competitor O",
    reach: 18.2,
    rank: 10.5,
    focus: 5.2,
    reachDelta: 0.1,
    rankDelta: -0.1,
    focusDelta: 0.2,
  },
  {
    brand: "Competitor P",
    reach: 16.5,
    rank: 11.2,
    focus: 4.8,
    reachDelta: -0.3,
    rankDelta: 0.5,
    focusDelta: -0.3,
  },
  {
    brand: "Competitor Q",
    reach: 14.8,
    rank: 12.1,
    focus: 4.5,
    reachDelta: 0.1,
    rankDelta: -0.1,
    focusDelta: 0.2,
  },
  {
    brand: "Competitor R",
    reach: 12.5,
    rank: 13.2,
    focus: 4.1,
    reachDelta: -0.2,
    rankDelta: 0.8,
    focusDelta: -0.2,
  },
  {
    brand: "Competitor S",
    reach: 10.8,
    rank: 14.5,
    focus: 3.8,
    reachDelta: 0.1,
    rankDelta: -0.2,
    focusDelta: 0.1,
  },
  {
    brand: "Competitor T",
    reach: 8.5,
    rank: 15.8,
    focus: 3.5,
    reachDelta: -0.1,
    rankDelta: 0.9,
    focusDelta: -0.1,
  },
]

/**
 * Mock Trend Data for Visibility (Reach + Focus)
 */
export const mockVisibilityTrend: VisibilityDataPoint[] = dates.map((date, idx) => {
  const row: VisibilityDataPoint = {
    date: date.split("-").slice(1, 3).join("/"),
  }
  mockBrands.forEach((brand, bi) => {
    const baseReach = [74.3, 68.5, 62.3, 55.8, 48.2, 45.5, 42.3, 39.8, 36.2, 33.5, 30.8, 28.5, 25.2, 22.8, 20.5, 18.2, 16.5, 14.8, 12.5, 10.8, 8.5]
    const baseFocus = [33.5, 28.2, 22.8, 18.5, 15.3, 14.2, 12.8, 11.5, 10.2, 9.1, 8.3, 7.5, 6.8, 6.2, 5.8, 5.2, 4.8, 4.5, 4.1, 3.8, 3.5]
    const reachTrend = genTrend(baseReach[bi], dates)
    const focusTrend = genTrend(baseFocus[bi], dates)
    row[brand] = reachTrend[idx] + focusTrend[idx]
  })
  return row
})

/**
 * Mock Trend Data for Reach
 */
export const mockReachTrend: VisibilityDataPoint[] = dates.map((date, idx) => {
  const row: VisibilityDataPoint = {
    date: date.split("-").slice(1, 3).join("/"),
  }
  mockBrands.forEach((brand, bi) => {
    const baseReach = [74.3, 68.5, 62.3, 55.8, 48.2, 45.5, 42.3, 39.8, 36.2, 33.5, 30.8, 28.5, 25.2, 22.8, 20.5, 18.2, 16.5, 14.8, 12.5, 10.8, 8.5]
    const trend = genTrend(baseReach[bi], dates)
    row[brand] = trend[idx]
  })
  return row
})

/**
 * Mock Trend Data for Rank
 */
export const mockRankTrend: VisibilityDataPoint[] = dates.map((date, idx) => {
  const row: VisibilityDataPoint = {
    date: date.split("-").slice(1, 3).join("/"),
  }
  mockBrands.forEach((brand, bi) => {
    const baseRank = [2.1, 2.5, 3.2, 3.8, 4.5, 4.8, 5.2, 5.5, 6.1, 6.5, 7.2, 7.8, 8.5, 9.1, 9.8, 10.5, 11.2, 12.1, 13.2, 14.5, 15.8]
    const trend = genTrend(baseRank[bi], dates)
    row[brand] = trend[idx]
  })
  return row
})

/**
 * Mock Trend Data for Focus
 */
export const mockFocusTrend: VisibilityDataPoint[] = dates.map((date, idx) => {
  const row: VisibilityDataPoint = {
    date: date.split("-").slice(1, 3).join("/"),
  }
  mockBrands.forEach((brand, bi) => {
    const baseFocus = [33.5, 28.2, 22.8, 18.5, 15.3, 14.2, 12.8, 11.5, 10.2, 9.1, 8.3, 7.5, 6.8, 6.2, 5.8, 5.2, 4.8, 4.5, 4.1, 3.8, 3.5]
    const trend = genTrend(baseFocus[bi], dates)
    row[brand] = trend[idx]
  })
  return row
})

/**
 * Get trend data by metric
 */
export const getTrendData = (metric: VisibilityMetric): VisibilityDataPoint[] => {
  switch (metric) {
    case "visibility":
      return mockVisibilityTrend
    case "reach":
      return mockReachTrend
    case "rank":
      return mockRankTrend
    case "focus":
      return mockFocusTrend
    default:
      return mockReachTrend
  }
}

/**
 * Chart Colors
 */
export const CHART_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6"]

