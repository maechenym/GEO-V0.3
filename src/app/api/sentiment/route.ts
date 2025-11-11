import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"
import { format, subDays } from "date-fns"
import type { SentimentKPIs, SentimentRankingItem, SentimentTrendData, RiskTopic, SentimentData } from "@/types/sentiment"

const MODEL_KEY_MAP: Record<string, string> = {
  all: "overall",
  gpt: "chatgpt",
  gemini: "gemini",
  claude: "claude",
}

const getModelKey = (modelParam: string | null): string => {
  if (!modelParam) return "overall"
  const normalized = modelParam.toLowerCase()
  return MODEL_KEY_MAP[normalized] || "overall"
}

const getModelData = (dayData: any, modelKey: string): any => {
  if (!dayData || typeof dayData !== "object") return null
  const modelData = dayData?.[modelKey]
  if (modelData && typeof modelData === "object" && Object.keys(modelData).length > 0) {
    return modelData
  }
  return dayData?.overall || null
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || "2025-10-31"
    const endDate = searchParams.get("endDate") || "2025-11-06"
    const productId = searchParams.get("productId")
    const modelParam = searchParams.get("model")
    const modelKey = getModelKey(modelParam)

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
        console.log(`[Sentiment API] Successfully loaded JSON from: ${tryPath}`)
        break
      } catch (error: any) {
        // 继续尝试下一个路径
        continue
      }
    }
    
    if (!loadedPath || !fileContents) {
      console.error("[Sentiment API] Error reading JSON file from all paths:", pathsToTry)
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
            console.log(`[Sentiment API] Using product: ${productName} for productId: ${productId}`)
          }
        } else {
          console.warn(`[Sentiment API] Failed to get product for ${productId}, using default`)
        }
      } catch (error) {
        console.warn(`[Sentiment API] Error fetching product ${productId}:`, error)
        // 如果获取失败，使用默认产品
      }
    }
    
    const productData = allData[productName]

    if (!productData || productData.length === 0) {
      console.error(`[Sentiment API] Product data not found: ${productName}`)
      console.log(`[Sentiment API] Available products:`, Object.keys(allData).slice(0, 10))
      return NextResponse.json(
        { error: `Product data not found: ${productName}` },
        { status: 404 }
      )
    }

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

    console.log(`[Sentiment API] Processing data - days: ${dateRangeDays}, isOneDayRange: ${isOneDayRange}`)

    // Calculate KPIs
    let kpis: SentimentKPIs
    
    if (isOneDayRange) {
      // 1day mode: use latest day's data
      const latestData = filteredData[filteredData.length - 1][1]
      const modelData = getModelData(latestData, modelKey)
      
      // SOV: based on total_score
      const inventecTotalScore = modelData.total_score?.["英业达"] || 0
      const allTotalScores = Object.values(modelData.total_score || {}) as number[]
      const totalScoreSum = allTotalScores.reduce((sum, score) => sum + score, 0)
      const sov = totalScoreSum > 0 ? (inventecTotalScore / totalScoreSum) * 100 : 0
      
      // Sentiment Index: 直接使用sentiment_score（0-1范围），与overview一致
      const inventecSentimentScore = modelData.sentiment_score?.["英业达"] || 0
      const sentimentIndex = inventecSentimentScore
      
      // Positive/Neutral/Negative: estimate based on sentiment_score，确保总和为100%
      let positive = 0, neutral = 0, negative = 0
      
      if (inventecSentimentScore >= 0.7) {
        // 高sentiment: 主要是positive
        positive = Math.min(100, ((inventecSentimentScore - 0.7) / 0.3) * 60 + 40) // 40-100%
        neutral = Math.max(0, (1 - inventecSentimentScore) * 40) // 0-12%
        negative = Math.max(0, 100 - positive - neutral)
      } else if (inventecSentimentScore >= 0.3) {
        // 中等sentiment: 主要是neutral
        neutral = Math.min(100, ((inventecSentimentScore - 0.3) / 0.4) * 40 + 60) // 60-100%
        positive = Math.max(0, (inventecSentimentScore - 0.3) / 0.4 * 30) // 0-30%
        negative = Math.max(0, (0.7 - inventecSentimentScore) / 0.4 * 30) // 0-30%
        // 确保总和为100%
        const total = positive + neutral + negative
        if (total > 0) {
          positive = (positive / total) * 100
          neutral = (neutral / total) * 100
          negative = 100 - positive - neutral
        }
      } else {
        // 低sentiment: 主要是negative
        negative = Math.min(100, ((0.3 - inventecSentimentScore) / 0.3) * 60 + 40) // 40-100%
        neutral = Math.max(0, inventecSentimentScore / 0.3 * 40) // 0-40%
        positive = Math.max(0, 100 - negative - neutral)
      }
      
      kpis = {
        sov: parseFloat(sov.toFixed(1)),
        sentimentIndex: parseFloat(sentimentIndex.toFixed(4)),
        positive: parseFloat(positive.toFixed(1)),
        neutral: parseFloat(neutral.toFixed(1)),
        negative: parseFloat(negative.toFixed(1)),
      }
    } else {
      // Multi-day mode: use average of all days
      let sovSum = 0
      let sentimentIndexSum = 0
      let positiveSum = 0
      let neutralSum = 0
      let negativeSum = 0
      let dayCount = 0
      
      filteredData.forEach(([date, data]: [string, any]) => {
        const dayModelData = getModelData(data, modelKey)
        
        // SOV
        const inventecTotalScore = dayModelData.total_score?.["英业达"] || 0
        const allTotalScores = Object.values(dayModelData.total_score || {}) as number[]
        const totalScoreSum = allTotalScores.reduce((sum, score) => sum + score, 0)
        if (totalScoreSum > 0) {
          sovSum += (inventecTotalScore / totalScoreSum) * 100
        }
        
        // Sentiment Index: 直接使用sentiment_score（0-1范围），与overview一致
        const inventecSentimentScore = dayModelData.sentiment_score?.["英业达"] || 0
        sentimentIndexSum += inventecSentimentScore
        
        // Positive/Neutral/Negative
        let positive = 0, neutral = 0, negative = 0
        
        if (inventecSentimentScore >= 0.7) {
          positive = Math.min(100, ((inventecSentimentScore - 0.7) / 0.3) * 60 + 40)
          neutral = Math.max(0, (1 - inventecSentimentScore) * 40)
          negative = Math.max(0, 100 - positive - neutral)
        } else if (inventecSentimentScore >= 0.3) {
          neutral = Math.min(100, ((inventecSentimentScore - 0.3) / 0.4) * 40 + 60)
          positive = Math.max(0, (inventecSentimentScore - 0.3) / 0.4 * 30)
          negative = Math.max(0, (0.7 - inventecSentimentScore) / 0.4 * 30)
          const total = positive + neutral + negative
          if (total > 0) {
            positive = (positive / total) * 100
            neutral = (neutral / total) * 100
            negative = 100 - positive - neutral
          }
        } else {
          negative = Math.min(100, ((0.3 - inventecSentimentScore) / 0.3) * 60 + 40)
          neutral = Math.max(0, inventecSentimentScore / 0.3 * 40)
          positive = Math.max(0, 100 - negative - neutral)
        }
        
        positiveSum += positive
        neutralSum += neutral
        negativeSum += negative
        dayCount++
      })
      
      kpis = {
        sov: parseFloat((sovSum / dayCount).toFixed(1)),
        sentimentIndex: parseFloat((sentimentIndexSum / dayCount).toFixed(4)),
        positive: parseFloat((positiveSum / dayCount).toFixed(1)),
        neutral: parseFloat((neutralSum / dayCount).toFixed(1)),
        negative: parseFloat((negativeSum / dayCount).toFixed(1)),
      }
    }

    // Calculate trends (sentiment index over time)
    let trends: SentimentTrendData[]
    
    if (isOneDayRange) {
      // 1day模式：显示最后两天（11.4和11.5），如果数据不足2天则显示所有可用数据
      const dataForTrend = filteredData.slice(-Math.min(2, filteredData.length))
      trends = dataForTrend.map(([date, data]: [string, any]) => {
        const dayModelData = getModelData(data, modelKey)
        const dateObj = new Date(date)
        const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
        
        const trendPoint: SentimentTrendData = {
          date: displayDate,
        }
        
        // Add sentiment index for all brands (使用0-1范围，与overview一致)
        const sentimentScores = dayModelData.sentiment_score || {}
        Object.keys(sentimentScores).forEach((brandName) => {
          // 品牌名称映射
          let mappedName = brandName
          if (brandName === "Nfina 4408T") {
            mappedName = "英特尔"
          } else if (brandName === "Dell PowerEdge R770") {
            mappedName = "戴尔"
          }
          
          // 过滤掉原始的英特尔和戴尔（如果存在）
          if (brandName !== "英特尔" && brandName !== "戴尔") {
            const score = sentimentScores[brandName] || 0
            trendPoint[mappedName] = parseFloat(score.toFixed(4)) // 保持0-1范围
          }
        })
        
        return trendPoint
      })
    } else {
      // 多天模式：显示所有数据
      trends = filteredData.map(([date, data]: [string, any]) => {
        const dayModelData = getModelData(data, modelKey)
        const dateObj = new Date(date)
        const displayDate = format(subDays(dateObj, 1), "MM/dd")
        
        const trendPoint: SentimentTrendData = {
          date: displayDate,
        }
        
        // Add sentiment index for all brands (使用0-1范围，与overview一致)
        const sentimentScores = dayModelData.sentiment_score || {}
        Object.keys(sentimentScores).forEach((brandName) => {
          // 品牌名称映射
          let mappedName = brandName
          if (brandName === "Nfina 4408T") {
            mappedName = "英特尔"
          } else if (brandName === "Dell PowerEdge R770") {
            mappedName = "戴尔"
          }
          
          // 过滤掉原始的英特尔和戴尔（如果存在）
          if (brandName !== "英特尔" && brandName !== "戴尔") {
            const score = sentimentScores[brandName] || 0
            trendPoint[mappedName] = parseFloat(score.toFixed(4)) // 保持0-1范围
          }
        })
        
        return trendPoint
      })
    }

    // Calculate ranking (sentiment score ranking)
    let ranking: SentimentRankingItem[] = []
    
    if (isOneDayRange) {
      // 1day mode: calculate rank changes
      const latestData = filteredData[filteredData.length - 1][1]
      const latestModelData = getModelData(latestData, modelKey)
      
      // Get previous day's data for delta calculation
      const latestDate = filteredData[filteredData.length - 1][0]
      const latestDateObj = new Date(latestDate)
      const previousDate = format(subDays(latestDateObj, 1), "yyyy-MM-dd")
      
      let previousModelData: any = null
      const previousEntry = productData.find(([date]: [string, any]) => date === previousDate)
      if (previousEntry) {
        previousModelData = getModelData(previousEntry[1], modelKey)
      }
      
      // Current day rankings
      const currentSentimentScores = Object.entries(latestModelData.sentiment_score || {})
        .map(([name, score]) => {
          // 品牌名称映射
          let mappedName = name
          if (name === "Nfina 4408T") {
            mappedName = "英特尔"
          } else if (name === "Dell PowerEdge R770") {
            mappedName = "戴尔"
          }
          return { name: mappedName, score: score as number, originalName: name }
        })
        .filter((item) => {
          // 过滤掉原始的英特尔和戴尔（如果存在）
          return item.originalName !== "英特尔" && item.originalName !== "戴尔"
        })
        .sort((a, b) => b.score - a.score)
      
      // Previous day rankings (if available)
      let previousSentimentScores: Array<{ name: string; score: number }> = []
      if (previousModelData) {
        previousSentimentScores = Object.entries(previousModelData.sentiment_score || {})
          .map(([name, score]) => {
            // 品牌名称映射
            let mappedName = name
            if (name === "Nfina 4408T") {
              mappedName = "英特尔"
            } else if (name === "Dell PowerEdge R770") {
              mappedName = "戴尔"
            }
            return { name: mappedName, score: score as number, originalName: name }
          })
          .filter((item) => {
            // 过滤掉原始的英特尔和戴尔（如果存在）
            return item.originalName !== "英特尔" && item.originalName !== "戴尔"
          })
          .sort((a, b) => b.score - a.score)
      }
      
      ranking = currentSentimentScores.map((comp, index) => {
        const currentRank = index + 1
        let rankDelta = 0
        
        if (previousSentimentScores.length > 0) {
          const previousRankIndex = previousSentimentScores.findIndex(c => c.name === comp.name)
          const previousRank = previousRankIndex !== -1 ? previousRankIndex + 1 : currentSentimentScores.length + 1
          rankDelta = previousRank - currentRank
        }
        
        // 修改特定品牌的值
        let finalScore = comp.score
        if (comp.name === "华为" || comp.name === "華為") {
          finalScore = 0.96
        } else if (comp.name === "惠普" || comp.name === "HPE") {
          finalScore = 0.93
        }
        
        return {
          brand: comp.name,
          value: parseFloat(finalScore.toFixed(4)), // 保持0-1范围，与overview一致
          delta: rankDelta,
          rank: currentRank,
          isSelf: comp.name === "英业达",
        }
      })
      
      // 重新排序以确保正确的排名
      ranking.sort((a, b) => b.value - a.value)
      ranking.forEach((item, index) => {
        item.rank = index + 1
      })
    } else {
      // Multi-day mode: use average sentiment scores
      const sentimentScoresMap: Record<string, number[]> = {}
      
      filteredData.forEach(([date, data]: [string, any]) => {
        const dayModelData = getModelData(data, modelKey)
        const sentimentScores = dayModelData.sentiment_score || {}
        
        Object.keys(sentimentScores).forEach((brandName) => {
          // 品牌名称映射
          let mappedName = brandName
          if (brandName === "Nfina 4408T") {
            mappedName = "英特尔"
          } else if (brandName === "Dell PowerEdge R770") {
            mappedName = "戴尔"
          }
          
          // 过滤掉原始的英特尔和戴尔（如果存在）
          if (brandName !== "英特尔" && brandName !== "戴尔") {
            if (!sentimentScoresMap[mappedName]) {
              sentimentScoresMap[mappedName] = []
            }
            sentimentScoresMap[mappedName].push(sentimentScores[brandName])
          }
        })
      })
      
      // Calculate average sentiment scores
      const avgSentimentScores = Object.entries(sentimentScoresMap)
        .map(([name, scores]) => ({
          name,
          score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        }))
        .sort((a, b) => b.score - a.score)
      
      // Get previous period data for rank delta calculation
      const firstDate = filteredData[0][0]
      const firstDateObj = new Date(firstDate)
      
      // Calculate previous period rankings
      let previousPeriodRankings: Array<{ name: string; score: number }> = []
      const previousPeriodData = productData
        .filter(([date]: [string, any]) => {
          const d = new Date(date)
          const prevEnd = subDays(firstDateObj, 1)
          const prevStart = subDays(prevEnd, dateRangeDays - 1)
          return d >= prevStart && d <= prevEnd
        })
        .map(([date, data]: [string, any]) => data.overall.sentiment_score || {})
      
      if (previousPeriodData.length > 0) {
        const previousScoresMap: Record<string, number[]> = {}
        previousPeriodData.forEach((scores: Record<string, number>) => {
          Object.keys(scores).forEach((brandName) => {
            // 品牌名称映射
            let mappedName = brandName
            if (brandName === "Nfina 4408T") {
              mappedName = "英特尔"
            } else if (brandName === "Dell PowerEdge R770") {
              mappedName = "戴尔"
            }
            
            // 过滤掉原始的英特尔和戴尔（如果存在）
            if (brandName !== "英特尔" && brandName !== "戴尔") {
              if (!previousScoresMap[mappedName]) {
                previousScoresMap[mappedName] = []
              }
              previousScoresMap[mappedName].push(scores[brandName])
            }
          })
        })
        
        // Calculate average scores and sort by score (descending) to get rankings
        previousPeriodRankings = Object.entries(previousScoresMap)
          .map(([name, scores]) => {
            let avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length
            
            // 修改特定品牌的值
            if (name === "华为" || name === "華為") {
              avgScore = 0.96
            } else if (name === "惠普" || name === "HPE") {
              avgScore = 0.93
            }
            
            return { name, score: avgScore }
          })
          .sort((a, b) => b.score - a.score)
      }
      
      ranking = avgSentimentScores.map((comp, index) => {
        const currentRank = index + 1
        
        // 修改特定品牌的值
        let finalScore = comp.score
        if (comp.name === "华为" || comp.name === "華為") {
          finalScore = 0.96
        } else if (comp.name === "惠普" || comp.name === "HPE") {
          finalScore = 0.93
        }
        
        // Calculate rank change (delta) for multi-day mode
        let rankDelta = 0
        if (previousPeriodRankings.length > 0) {
          const previousRankIndex = previousPeriodRankings.findIndex(c => c.name === comp.name)
          const previousRank = previousRankIndex !== -1 ? previousRankIndex + 1 : avgSentimentScores.length + 1
          rankDelta = previousRank - currentRank
        }
        
        return {
          brand: comp.name,
          value: parseFloat(finalScore.toFixed(4)), // 保持0-1范围，与overview一致
          delta: rankDelta, // Rank change for multi-day mode
          rank: currentRank,
          isSelf: comp.name === "英业达",
        }
      })
      
      // 重新排序以确保正确的排名
      ranking.sort((a, b) => b.value - a.value)
      ranking.forEach((item, index) => {
        item.rank = index + 1
      })
    }

    // Extract risk topics from aggregated_sentiment_detail
    const riskTopics: RiskTopic[] = []
    const selfBrandKey = "英业达"
    
    // Collect all positive and negative aspects from all days
    const positiveAspectsMap = new Map<string, number>()
    const negativeAspectsMap = new Map<string, number>()
    
    filteredData.forEach(([date, data]: [string, any]) => {
      const dayModelData = getModelData(data, modelKey)
      const aggregated = dayModelData?.aggregated_sentiment_detail?.[selfBrandKey]
      
      if (aggregated) {
        // Extract positive aspects
        const positiveAspects = Array.isArray(aggregated.positive_aspects) ? aggregated.positive_aspects : []
        positiveAspects.forEach((aspect: string) => {
          if (aspect && typeof aspect === "string") {
            const trimmed = aspect.trim()
            if (trimmed) {
              positiveAspectsMap.set(trimmed, (positiveAspectsMap.get(trimmed) || 0) + 1)
            }
          }
        })
        
        // Extract negative aspects
        const negativeAspects = Array.isArray(aggregated.negative_aspects) ? aggregated.negative_aspects : []
        negativeAspects.forEach((aspect: string) => {
          if (aspect && typeof aspect === "string") {
            const trimmed = aspect.trim()
            if (trimmed) {
              negativeAspectsMap.set(trimmed, (negativeAspectsMap.get(trimmed) || 0) + 1)
            }
          }
        })
      }
    })
    
    // Convert to RiskTopic format (top 5 positive and top 5 negative)
    // Only process if we have aspects
    if (positiveAspectsMap.size > 0) {
      // Calculate sentiment scores based on mention count (more mentions = higher score)
      const positiveCounts = Array.from(positiveAspectsMap.values())
      const maxPositiveCount = Math.max(...positiveCounts, 1)
      
      const topPositiveAspects = Array.from(positiveAspectsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([aspect, count], index) => {
          // Calculate sentiment score based on count (normalize to 0.7-1.0 range)
          const normalizedCount = count / maxPositiveCount
          const sentiment = 0.7 + (normalizedCount * 0.3) // 0.7 to 1.0
          return {
            id: `positive_${index}_${aspect.substring(0, 10).replace(/\s/g, '_')}`,
            prompt: aspect,
            answer: "", // Not available in current data structure
            sources: count,
            sentiment: sentiment,
          }
        })
      
      riskTopics.push(...topPositiveAspects)
    }
    
    if (negativeAspectsMap.size > 0) {
      // Calculate sentiment scores based on mention count (more mentions = higher score)
      const negativeCounts = Array.from(negativeAspectsMap.values())
      const maxNegativeCount = Math.max(...negativeCounts, 1)
      
      const topNegativeAspects = Array.from(negativeAspectsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([aspect, count], index) => {
          // Calculate sentiment score based on count (normalize to -1.0 to -0.7 range)
          const normalizedCount = count / maxNegativeCount
          const sentiment = -0.7 - (normalizedCount * 0.3) // -1.0 to -0.7
          return {
            id: `negative_${index}_${aspect.substring(0, 10).replace(/\s/g, '_')}`,
            prompt: aspect,
            answer: "", // Not available in current data structure
            sources: count,
            sentiment: sentiment,
          }
        })
      
      riskTopics.push(...topNegativeAspects)
    }

    // Calculate the actual date range for display (subtract 1 day from file dates)
    const actualStartDate = format(subDays(new Date(filteredData[0][0]), 1), "yyyy-MM-dd")
    const actualEndDate = format(subDays(new Date(filteredData[filteredData.length - 1][0]), 1), "yyyy-MM-dd")

    const response: SentimentData = {
      kpis,
      trends,
      ranking,
      riskTopics,
      actualDateRange: {
        start: actualStartDate,
        end: actualEndDate,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[Sentiment API] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

