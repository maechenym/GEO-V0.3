import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"
import { format, subDays } from "date-fns"

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
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || "2025-10-31"
    const endDate = searchParams.get("endDate") || "2025-11-06"
    const productId = searchParams.get("productId")

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

    const response: VisibilityData = {
      visibility,
      reach,
      rank,
      focus,
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

