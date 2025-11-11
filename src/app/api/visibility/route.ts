import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"
import { format, subDays } from "date-fns"

const SELF_BRAND_CANDIDATES = ["英业达", "英業達", "Your Brand", "Inventec"]
const MODEL_KEYS = ["chatgpt", "gemini", "claude"] as const

const slugify = (value: string) =>
  (() => {
    const ascii = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    if (ascii) return ascii
    const encoded = encodeURIComponent(value.toLowerCase())
    return encoded || "item"
  })()

const FALLBACK_SOURCES = [
  "wikipedia.org",
  "techradar.com",
  "forbes.com",
  "theverge.com",
  "wired.com",
  "zdnet.com",
  "cnet.com",
  "arstechnica.com",
]

const FALLBACK_TOPICS = [
  { name: "AI server infrastructure", example: "Discussions about AI server infrastructure and deployment choices." },
  { name: "Edge computing strategies", example: "Examples describing how brands approach edge computing workloads." },
  { name: "Cloud security posture", example: "Commentary on cloud security practices and safeguards." },
  { name: "Hyper-converged architecture", example: "Coverage of hyper-converged infrastructure designs and benefits." },
  { name: "Sustainability in data centers", example: "Mentions of energy efficiency and sustainability initiatives." },
  { name: "High-performance computing", example: "References to HPC workloads and performance benchmarks." },
  { name: "Telecom and 5G solutions", example: "Insights about telecom infrastructure and 5G enablement." },
  { name: "AI accelerator landscape", example: "Notes on accelerator hardware and AI chipset selections." },
]

interface RankingItem {
  brand: string
  value: number
  delta: number
  rank: number
  isSelf: boolean
}

interface TrendData {
  date: string
  [brandName: string]: string | number
}

interface HeatmapCell {
  source: string
  topic: string
  mentionRate: number
  sampleCount: number
  example: string
}

interface HeatmapTopic {
  name: string
  slug: string
}

interface HeatmapSource {
  name: string
  slug: string
}

interface VisibilityData {
  visibility: {
    ranking: RankingItem[]
    trends: TrendData[]
  }
  reach: {
    ranking: RankingItem[]
    trends: TrendData[]
  }
  rank: {
    ranking: RankingItem[]
    trends: TrendData[]
  }
  focus: {
    ranking: RankingItem[]
    trends: TrendData[]
  }
  heatmap: {
    sources: HeatmapSource[]
    topics: HeatmapTopic[]
    cells: HeatmapCell[]
  }
  actualDateRange?: {
    start: string // YYYY-MM-DD
    end: string // YYYY-MM-DD
  }
}

const resolveSelfBrandKey = (data: any): string => {
  if (!data) {
    return SELF_BRAND_CANDIDATES[0]
  }
  for (const candidate of SELF_BRAND_CANDIDATES) {
    if (data.mention_rate?.[candidate] !== undefined || data.combined_score?.[candidate] !== undefined) {
      return candidate
    }
  }
  const firstKey = Object.keys(data.mention_rate || data.combined_score || {})[0]
  return firstKey || SELF_BRAND_CANDIDATES[0]
}

const getModelData = (dayData: any, modelKey: string) => {
  if (!dayData) return null
  if (modelKey === "all") {
    return dayData.overall
  }
  return dayData[modelKey] || dayData.overall
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || "2025-10-31"
    const endDate = searchParams.get("endDate") || "2025-11-06"
    const productId = searchParams.get("productId")
    const modelParam = (searchParams.get("model") || "all").toLowerCase()
    const modelKey = MODEL_KEYS.includes(modelParam as typeof MODEL_KEYS[number]) ? modelParam : "all"

    // 读取JSON文件
    const projectRoot = process.cwd()
    // 优先从项目目录读取（生产环境可用）
    const projectDataPath = path.resolve(projectRoot, "data", "all_brands_results_20251106_075334.json")
    const jsonFilePath = path.resolve(projectRoot, "..", "all_brands_results_20251106_075334.json")
    const downloadsPath = path.resolve("/Users/yimingchen/Downloads", "all_brands_results_20251106_075334.json")
    const altPath = path.resolve(projectRoot, "documents", "all_brands_results_20251106_075334.json")
    
    let fileContents: string = ""
    let loadedPath: string | null = null
    
    // 按优先级尝试读取文件（项目目录优先，适用于生产环境）
    const pathsToTry = [
      projectDataPath,  // 1. 项目 data 目录（生产环境优先）
      downloadsPath,    // 2. Downloads文件夹（开发环境）
      jsonFilePath,     // 3. 项目上级目录
      altPath,          // 4. documents目录
    ]
    
    for (const tryPath of pathsToTry) {
      try {
        fileContents = await fs.readFile(tryPath, "utf8")
        loadedPath = tryPath
        console.log(`[Visibility API] Successfully loaded JSON from: ${tryPath}`)
        break
      } catch (error: any) {
        // 继续尝试下一个路径
        continue
      }
    }
    
    if (!loadedPath || !fileContents) {
      console.error("[Visibility API] Error reading JSON file from all paths:", pathsToTry)
      return NextResponse.json(
        { error: "Failed to read data file" },
        { status: 500 }
      )
    }

    const allData = JSON.parse(fileContents)
    
    // 确定要使用的产品名称
    let productName = "英业达 (Inventec) 机架解决方案" // 默认产品
    
    // 如果提供了productId，尝试从产品数据中获取产品名称
    if (productId) {
      try {
        // 尝试从产品API获取产品信息
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const productResponse = await fetch(`${baseUrl}/api/products/${productId}`, {
          headers: {
            "Authorization": request.headers.get("Authorization") || "",
          },
        })
        
        if (productResponse.ok) {
          const productData = await productResponse.json()
          if (productData.product && productData.product.name) {
            productName = productData.product.name
            console.log(`[Visibility API] Using product: ${productName} for productId: ${productId}`)
          }
        } else {
          console.warn(`[Visibility API] Failed to get product for ${productId}, using default`)
        }
      } catch (error) {
        console.warn(`[Visibility API] Error fetching product ${productId}:`, error)
        // 如果获取失败，使用默认产品
      }
    }
    
    const productData = allData[productName]

    if (!productData || productData.length === 0) {
      console.error(`[Visibility API] Product data not found: ${productName}`)
      console.log(`[Visibility API] Available products:`, Object.keys(allData).slice(0, 10))
      return NextResponse.json(
        { error: `Product data not found: ${productName}` },
        { status: 404 }
      )
    }

    console.log(`[Visibility API] Found ${productData.length} days of data for ${productName}`)

    // 过滤日期范围
    const filteredData = productData.filter(([date]: [string, any]) => {
      return date >= startDate && date <= endDate
    })

    if (filteredData.length === 0) {
      return NextResponse.json(
        { error: "No data for date range" },
        { status: 404 }
      )
    }

    // 判断日期范围类型
    const dateRangeDays = filteredData.length
    // 1day模式：日期范围在2天以内（包含2天），用于显示11.4和11.5的数据
    const dateDiffMs = new Date(endDate).getTime() - new Date(startDate).getTime()
    const isOneDayRange = dateRangeDays <= 2 && dateDiffMs <= 172800000 // 2天的毫秒数

    console.log(`[Visibility API] Processing data - days: ${dateRangeDays}, isOneDayRange: ${isOneDayRange}`)

    // 获取前一天的数据（用于1day模式的排名变化计算）
    let previousDayData: any = null
    if (isOneDayRange && filteredData.length > 0) {
      const latestDate = filteredData[filteredData.length - 1][0]
      const latestDateObj = new Date(latestDate)
      const previousDate = format(subDays(latestDateObj, 1), "yyyy-MM-dd")
      const previousEntry = productData.find(([date]: [string, any]) => date === previousDate)
      if (previousEntry) {
        previousDayData = previousEntry[1].overall
      }
    }

    // 计算四个指标的排名和趋势
    
    // 1. Visibility Ranking (基于combined_score)
    const calculateVisibilityRanking = (): { ranking: RankingItem[]; trends: TrendData[] } => {
      let ranking: RankingItem[] = []
      const trends: TrendData[] = []

      if (isOneDayRange) {
        // 1day模式：使用最后一天的数据
        const latestData = filteredData[filteredData.length - 1][1]
        const latestOverall = latestData.overall
        const currentScores = latestOverall.combined_score || {}
        
        // 计算当前排名
        const currentRanking = Object.entries(currentScores)
          .map(([name, score]) => ({ name, score: score as number }))
          .sort((a, b) => b.score - a.score)
          .map((item, index) => ({
            brand: item.name,
            value: parseFloat((item.score * 100).toFixed(2)), // 转换为百分比
            delta: 0,
            rank: index + 1,
            isSelf: item.name === "英业达",
          }))

        // 计算排名变化（如果有前一天数据）
        if (previousDayData && previousDayData.combined_score) {
          const previousScores = previousDayData.combined_score
          const previousRanking = Object.entries(previousScores)
            .map(([name, score]) => ({ name, score: score as number }))
            .sort((a, b) => b.score - a.score)
          
          ranking = currentRanking.map((item) => {
            const brandName = item.brand
            const previousRankIndex = previousRanking.findIndex(p => p.name === brandName)
            const previousRank = previousRankIndex !== -1 ? previousRankIndex + 1 : currentRanking.length + 1
            const rankDelta = previousRank - item.rank // 排名变化：上升为正
            
            return {
              ...item,
              delta: parseFloat(rankDelta.toFixed(0)),
            }
          })
        } else {
          ranking = currentRanking
        }

        // 趋势数据 - 1day模式：显示最后两天（11.4和11.5），如果数据不足2天则显示所有可用数据
        const dataForTrend = filteredData.slice(-Math.min(2, filteredData.length))
        dataForTrend.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          // 将日期向前减一天（后台11.5的数据代表收集到的是11.4的数据）
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayScores = dayOverall.combined_score || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseFloat(((dayScores[brandName] as number) * 100).toFixed(2))
          })
          
          trends.push(trendPoint)
        })
      } else {
        // 多天模式：计算平均值
        const scoresAccumulator: Record<string, number[]> = {}
        
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dayScores = dayOverall.combined_score || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            if (!scoresAccumulator[brandName]) {
              scoresAccumulator[brandName] = []
            }
            scoresAccumulator[brandName].push(dayScores[brandName] as number)
          })
        })

        // 计算平均得分
        const avgScores = Object.entries(scoresAccumulator)
          .map(([name, scores]) => ({
            name,
            score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
          }))
          .sort((a, b) => b.score - a.score)

        ranking = avgScores.map((item, index) => ({
          brand: item.name,
          value: parseFloat((item.score * 100).toFixed(2)),
          delta: 0, // 多天模式暂时不计算delta
          rank: index + 1,
          isSelf: item.name === "英业达",
        }))

        // 趋势数据
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          // 将日期向前减一天（后台11.6的数据代表收集到的是11.5的数据）
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayScores = dayOverall.combined_score || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseFloat(((dayScores[brandName] as number) * 100).toFixed(2))
          })
          
          trends.push(trendPoint)
        })
      }

      return { ranking, trends }
    }

    // 2. Reach Ranking (基于mention_rate)
    const calculateReachRanking = (): { ranking: RankingItem[]; trends: TrendData[] } => {
      let ranking: RankingItem[] = []
      const trends: TrendData[] = []

      if (isOneDayRange) {
        const latestData = filteredData[filteredData.length - 1][1]
        const latestOverall = latestData.overall
        const currentScores = latestOverall.mention_rate || {}
        
        const currentRanking = Object.entries(currentScores)
          .map(([name, score]) => ({ name, score: score as number }))
          .sort((a, b) => b.score - a.score)
          .map((item, index) => ({
            brand: item.name,
            value: parseFloat((item.score * 100).toFixed(2)),
            delta: 0,
            rank: index + 1,
            isSelf: item.name === "英业达",
          }))

        if (previousDayData && previousDayData.mention_rate) {
          const previousScores = previousDayData.mention_rate
          const previousRanking = Object.entries(previousScores)
            .map(([name, score]) => ({ name, score: score as number }))
            .sort((a, b) => b.score - a.score)
          
          ranking = currentRanking.map((item) => {
            const brandName = item.brand
            const previousRankIndex = previousRanking.findIndex(p => p.name === brandName)
            const previousRank = previousRankIndex !== -1 ? previousRankIndex + 1 : currentRanking.length + 1
            const rankDelta = previousRank - item.rank
            
            return {
              ...item,
              delta: parseFloat(rankDelta.toFixed(0)),
            }
          })
        } else {
          ranking = currentRanking
        }

        // 趋势数据 - 1day模式：显示最后两天
        const dataForTrend = filteredData.slice(-Math.min(2, filteredData.length))
        dataForTrend.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayScores = dayOverall.mention_rate || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseFloat(((dayScores[brandName] as number) * 100).toFixed(2))
          })
          
          trends.push(trendPoint)
        })
      } else {
        const scoresAccumulator: Record<string, number[]> = {}
        
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dayScores = dayOverall.mention_rate || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            if (!scoresAccumulator[brandName]) {
              scoresAccumulator[brandName] = []
            }
            scoresAccumulator[brandName].push(dayScores[brandName] as number)
          })
        })

        const avgScores = Object.entries(scoresAccumulator)
          .map(([name, scores]) => ({
            name,
            score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
          }))
          .sort((a, b) => b.score - a.score)

        ranking = avgScores.map((item, index) => ({
          brand: item.name,
          value: parseFloat((item.score * 100).toFixed(2)),
          delta: 0,
          rank: index + 1,
          isSelf: item.name === "英业达",
        }))

        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayScores = dayOverall.mention_rate || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseFloat(((dayScores[brandName] as number) * 100).toFixed(2))
          })
          
          trends.push(trendPoint)
        })
      }

      return { ranking, trends }
    }

    // 3. Rank Ranking (基于absolute_rank，按排名升序)
    const calculateRankRanking = (): { ranking: RankingItem[]; trends: TrendData[] } => {
      let ranking: RankingItem[] = []
      const trends: TrendData[] = []

      if (isOneDayRange) {
        const latestData = filteredData[filteredData.length - 1][1]
        const latestOverall = latestData.overall
        const currentRanks = latestOverall.absolute_rank || {}
        
        // 解析排名值
        const parseRank = (rankRaw: any): number => {
          if (typeof rankRaw === 'string') {
            const match = rankRaw.match(/^([\d.]+)/)
            return match ? parseFloat(match[1]) : 999
          } else if (typeof rankRaw === 'number') {
            return rankRaw
          }
          return 999
        }

        const currentRanking = Object.entries(currentRanks)
          .map(([name, rankRaw]) => ({ name, rank: parseRank(rankRaw) }))
          .sort((a, b) => a.rank - b.rank) // 排名越小越好，升序
          .map((item, index) => ({
            brand: item.name,
            value: parseFloat(item.rank.toFixed(1)), // 保留小数点
            delta: 0,
            rank: index + 1,
            isSelf: item.name === "英业达",
          }))

        if (previousDayData && previousDayData.absolute_rank) {
          const previousRanks = previousDayData.absolute_rank
          const previousRanking = Object.entries(previousRanks)
            .map(([name, rankRaw]) => ({ name, rank: parseRank(rankRaw) }))
            .sort((a, b) => a.rank - b.rank)
          
          ranking = currentRanking.map((item) => {
            const brandName = item.brand
            const previousRankIndex = previousRanking.findIndex(p => p.name === brandName)
            const previousRank = previousRankIndex !== -1 ? previousRankIndex + 1 : currentRanking.length + 1
            const rankDelta = previousRank - item.rank
            
            return {
              ...item,
              delta: parseFloat(rankDelta.toFixed(0)),
            }
          })
        } else {
          ranking = currentRanking
        }

        // 趋势数据 - 1day模式：显示最后两天
        const dataForTrend = filteredData.slice(-Math.min(2, filteredData.length))
        dataForTrend.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayRanks = dayOverall.absolute_rank || {}
          
          Object.keys(dayRanks).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseRank(dayRanks[brandName])
          })
          
          trends.push(trendPoint)
        })
      } else {
        const ranksAccumulator: Record<string, number[]> = {}
        
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dayRanks = dayOverall.absolute_rank || {}
          
          Object.keys(dayRanks).forEach((brandName) => {
            if (!ranksAccumulator[brandName]) {
              ranksAccumulator[brandName] = []
            }
            const rankValue = typeof dayRanks[brandName] === 'string' 
              ? parseFloat(dayRanks[brandName].match(/^([\d.]+)/)?.[1] || '999')
              : (dayRanks[brandName] as number)
            ranksAccumulator[brandName].push(rankValue)
          })
        })

        const avgRanks = Object.entries(ranksAccumulator)
          .map(([name, ranks]) => ({
            name,
            rank: ranks.reduce((sum, r) => sum + r, 0) / ranks.length,
          }))
          .sort((a, b) => a.rank - b.rank)

        ranking = avgRanks.map((item, index) => ({
          brand: item.name,
          value: parseFloat(item.rank.toFixed(1)),
          delta: 0,
          rank: index + 1,
          isSelf: item.name === "英业达",
        }))

        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayRanks = dayOverall.absolute_rank || {}
          
          Object.keys(dayRanks).forEach((brandName) => {
            const displayName = brandName
            const rankValue = typeof dayRanks[brandName] === 'string' 
              ? parseFloat(dayRanks[brandName].match(/^([\d.]+)/)?.[1] || '999')
              : (dayRanks[brandName] as number)
            trendPoint[displayName] = parseFloat(rankValue.toFixed(1))
          })
          
          trends.push(trendPoint)
        })
      }

      return { ranking, trends }
    }

    // 4. Focus Ranking (基于content_share)
    const calculateFocusRanking = (): { ranking: RankingItem[]; trends: TrendData[] } => {
      let ranking: RankingItem[] = []
      const trends: TrendData[] = []

      if (isOneDayRange) {
        const latestData = filteredData[filteredData.length - 1][1]
        const latestOverall = latestData.overall
        const currentScores = latestOverall.content_share || {}
        
        const currentRanking = Object.entries(currentScores)
          .map(([name, score]) => ({ name, score: score as number }))
          .sort((a, b) => b.score - a.score)
          .map((item, index) => ({
            brand: item.name,
            value: parseFloat((item.score * 100).toFixed(2)),
            delta: 0,
            rank: index + 1,
            isSelf: item.name === "英业达",
          }))

        if (previousDayData && previousDayData.content_share) {
          const previousScores = previousDayData.content_share
          const previousRanking = Object.entries(previousScores)
            .map(([name, score]) => ({ name, score: score as number }))
            .sort((a, b) => b.score - a.score)
          
          ranking = currentRanking.map((item) => {
            const brandName = item.brand
            const previousRankIndex = previousRanking.findIndex(p => p.name === brandName)
            const previousRank = previousRankIndex !== -1 ? previousRankIndex + 1 : currentRanking.length + 1
            const rankDelta = previousRank - item.rank
            
            return {
              ...item,
              delta: parseFloat(rankDelta.toFixed(0)),
            }
          })
        } else {
          ranking = currentRanking
        }

        // 趋势数据 - 1day模式：显示最后两天（11.4和11.5），如果数据不足2天则显示所有可用数据
        const dataForTrend = filteredData.slice(-Math.min(2, filteredData.length))
        dataForTrend.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          // 将日期向前减一天（后台11.5的数据代表收集到的是11.4的数据）
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayScores = dayOverall.content_share || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseFloat(((dayScores[brandName] as number) * 100).toFixed(2))
          })
          
          trends.push(trendPoint)
        })
      } else {
        const scoresAccumulator: Record<string, number[]> = {}
        
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dayScores = dayOverall.content_share || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            if (!scoresAccumulator[brandName]) {
              scoresAccumulator[brandName] = []
            }
            scoresAccumulator[brandName].push(dayScores[brandName] as number)
          })
        })

        const avgScores = Object.entries(scoresAccumulator)
          .map(([name, scores]) => ({
            name,
            score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
          }))
          .sort((a, b) => b.score - a.score)

        ranking = avgScores.map((item, index) => ({
          brand: item.name,
          value: parseFloat((item.score * 100).toFixed(2)),
          delta: 0,
          rank: index + 1,
          isSelf: item.name === "英业达",
        }))

        // 趋势数据
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          // 将日期向前减一天（后台11.6的数据代表收集到的是11.5的数据）
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayScores = dayOverall.content_share || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseFloat(((dayScores[brandName] as number) * 100).toFixed(2))
          })
          
          trends.push(trendPoint)
        })
      }

      return { ranking, trends }
    }

    // 计算所有指标
    const visibility = calculateVisibilityRanking()
    const reach = calculateReachRanking()
    const rank = calculateRankRanking()
    const focus = calculateFocusRanking()

    const computeHeatmap = (): VisibilityData["heatmap"] => {
      const selfSourceCounts = new Map<string, number>()
      const otherSourceCounts = new Map<string, number>()
      const sourceLabels = new Map<string, string>()

      const selfTopicCounts = new Map<string, number>()
      const otherTopicCounts = new Map<string, number>()
      const topicExamples = new Map<string, string>()

      let resolvedSelfBrand = SELF_BRAND_CANDIDATES[0]

      const extractTopic = (text: string): string => {
        if (!text) return ""
        const parts = text.split(/[：:]/)
        const candidate = parts[0]?.trim() || text.trim()
        return candidate.length > 60 ? `${candidate.slice(0, 57)}...` : candidate
      }

      const incrementCount = (map: Map<string, number>, key: string, amount = 1) => {
        map.set(key, (map.get(key) || 0) + amount)
      }

      filteredData.forEach(([date, dayData]: [string, any]) => {
        const modelData = getModelData(dayData, modelKey)
        if (!modelData) return

        const selfBrandKey = resolveSelfBrandKey(modelData)
        if (selfBrandKey) {
          resolvedSelfBrand = selfBrandKey
        }

        const brandDomains = modelData.brand_domains || {}
        Object.entries(brandDomains).forEach(([brandName, domains]: [string, any]) => {
          if (!Array.isArray(domains)) return
          domains.forEach((domain: string) => {
            const normalized = domain.trim().toLowerCase()
            if (!normalized) return
            const targetMap = brandName === resolvedSelfBrand ? selfSourceCounts : otherSourceCounts
            incrementCount(targetMap, normalized)
            if (!sourceLabels.has(normalized)) {
              sourceLabels.set(normalized, domain.trim())
            }
          })
        })

        const sentimentDetails = modelData.aggregated_sentiment_detail || {}
        Object.entries(sentimentDetails).forEach(([brandName, details]: [string, any]) => {
          const positiveAspects: string[] = Array.isArray(details?.positive_aspects) ? details.positive_aspects : []
          const negativeAspects: string[] = Array.isArray(details?.negative_aspects) ? details.negative_aspects : []
          const targetMap = brandName === resolvedSelfBrand ? selfTopicCounts : otherTopicCounts

          ;[...positiveAspects, ...negativeAspects].forEach((aspect: string) => {
            const topicName = extractTopic(aspect)
            if (!topicName) return
            incrementCount(targetMap, topicName)
            if (!topicExamples.has(topicName)) {
              topicExamples.set(topicName, aspect)
            }
          })
        })
      })

      const sortEntries = (map: Map<string, number>) =>
        Array.from(map.entries()).sort(([, a], [, b]) => b - a)

      const MIN_ITEMS = 5
      const MAX_ITEMS = 8

      const selectEntries = (
        primary: Array<[string, number]>,
        secondary: Array<[string, number]>,
        fallbackKeys: string[],
      ) => {
        const result: Array<{ key: string; count: number }> = []
        const used = new Set<string>()

        const pushEntry = (key: string, count: number) => {
          if (used.has(key)) return
          used.add(key)
          result.push({ key, count })
        }

        primary.forEach(([key, count]) => {
          if (result.length < MAX_ITEMS) {
            pushEntry(key, count)
          }
        })

        if (result.length < MIN_ITEMS) {
          secondary.forEach(([key, count]) => {
            if (result.length >= MIN_ITEMS) return
            pushEntry(key, count)
          })
        }

        if (result.length < MIN_ITEMS) {
          for (const fallbackKey of fallbackKeys) {
            if (result.length >= MIN_ITEMS) break
            pushEntry(fallbackKey, 1)
          }
        }

        return result.slice(0, MAX_ITEMS)
      }

      const rankedSelfSources = sortEntries(selfSourceCounts)
      const rankedOtherSources = sortEntries(otherSourceCounts)
      const selectedSources = selectEntries(rankedSelfSources, rankedOtherSources, FALLBACK_SOURCES)

      selectedSources.forEach(({ key }) => {
        if (!sourceLabels.has(key)) {
          sourceLabels.set(key, key)
        }
      })

      const rankedSelfTopics = sortEntries(selfTopicCounts)
      const rankedOtherTopics = sortEntries(otherTopicCounts)
      const selectedTopicsRaw = selectEntries(
        rankedSelfTopics,
        rankedOtherTopics,
        FALLBACK_TOPICS.map((topic) => topic.name),
      )

      selectedTopicsRaw.forEach(({ key }) => {
        if (!topicExamples.has(key)) {
          const fallbackTopic = FALLBACK_TOPICS.find((item) => item.name === key)
          topicExamples.set(key, fallbackTopic?.example || key)
        }
      })

      const totalSourceMentions =
        selectedSources.reduce((sum, entry) => sum + entry.count, 0) || selectedSources.length || 1
      const totalTopicMentions =
        selectedTopicsRaw.reduce((sum, entry) => sum + entry.count, 0) || selectedTopicsRaw.length || 1

      const sourcesWithShare = selectedSources.map((entry) => {
        const label = sourceLabels.get(entry.key) || entry.key
        return {
          key: entry.key,
          label,
          slug: slugify(label),
          count: entry.count,
          share: entry.count / totalSourceMentions,
        }
      })

      const topicsWithShare = selectedTopicsRaw.map((entry) => {
        const example = topicExamples.get(entry.key) || entry.key
        return {
          name: entry.key,
          slug: slugify(entry.key),
          count: entry.count,
          share: entry.count / totalTopicMentions,
          example,
        }
      })

      const cells: HeatmapCell[] = []

      sourcesWithShare.forEach((source) => {
        topicsWithShare.forEach((topic) => {
          const mentionRate = parseFloat(((source.share * topic.share) * 100).toFixed(2))
          const sampleCount = Math.max(1, Math.round((source.count + topic.count) / 2))
          cells.push({
            source: source.label,
            topic: topic.name,
            mentionRate,
            sampleCount,
            example: topic.example,
          })
        })
      })

      return {
        sources: sourcesWithShare.map(({ label, slug }) => ({ name: label, slug })),
        topics: topicsWithShare.map(({ name, slug }) => ({ name, slug })),
        cells,
      }
    }

    const heatmap = computeHeatmap()
 
    // Calculate the actual date range for display (subtract 1 day from file dates)
    const actualStartDate = format(subDays(new Date(filteredData[0][0]), 1), "yyyy-MM-dd")
    const actualEndDate = format(subDays(new Date(filteredData[filteredData.length - 1][0]), 1), "yyyy-MM-dd")

    const response: VisibilityData = {
      visibility,
      reach,
      rank,
      focus,
      heatmap,
      actualDateRange: {
        start: actualStartDate,
        end: actualEndDate,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[Visibility API] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

