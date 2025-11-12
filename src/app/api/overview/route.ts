import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"
import { format, subDays } from "date-fns"
import type {
  OverviewData,
  OverviewKPI,
  CompetitorRanking,
  BrandInfluenceData,
  OverviewSource,
  OverviewTopic,
} from "@/types/overview"

const MODEL_KEY_MAP: Record<string, string> = {
  all: "overall",
  gpt: "chatgpt",
  gemini: "gemini",
  claude: "claude",
}

const SELF_BRAND_CANDIDATES = ["英业达", "英業達", "Your Brand", "Inventec"]

const getModelKey = (modelParam: string | null): string => {
  if (!modelParam) return "overall"
  const normalized = modelParam.toLowerCase()
  return MODEL_KEY_MAP[normalized] || "overall"
}

const resolveSelfBrandKey = (source: any): string => {
  if (!source || typeof source !== "object") {
    return SELF_BRAND_CANDIDATES[0]
  }
  const mentionRateKeys = Object.keys(source.mention_rate || {})
  for (const candidate of SELF_BRAND_CANDIDATES) {
    if (mentionRateKeys.includes(candidate)) {
      return candidate
    }
  }
  return SELF_BRAND_CANDIDATES[0]
}

const getModelData = (dayData: any, modelKey: string): any => {
  if (!dayData || typeof dayData !== "object") return null
  const modelData = dayData?.[modelKey]
  if (modelData && typeof modelData === "object" && Object.keys(modelData).length > 0) {
    return modelData
  }
  return dayData?.overall || null
}

const computeTopSources = (
  filteredData: Array<[string, any]>,
  modelKey: string,
  fallbackModelKey: string,
  selfBrandKey: string
): OverviewSource[] => {
  const domainMap = new Map<
    string,
    {
      domain: string
      mentionCount: number
      mentionsSelf: boolean
    }
  >()
  let totalMentions = 0

  filteredData.forEach(([_, day]) => {
    const modelData = day?.[modelKey] ?? day?.[fallbackModelKey] ?? day?.overall
    const brandDomains = modelData?.brand_domains as Record<string, string[] | undefined>
    if (!brandDomains) return

    Object.entries(brandDomains).forEach(([brand, domains]) => {
      if (!Array.isArray(domains)) return
      domains.forEach((rawDomain) => {
        if (!rawDomain || typeof rawDomain !== "string") return
        const trimmedDomain = rawDomain.trim()
        if (!trimmedDomain) return
        const key = trimmedDomain.toLowerCase()
        const existing = domainMap.get(key)
        if (existing) {
          existing.mentionCount += 1
          if (brand === selfBrandKey) {
            existing.mentionsSelf = true
          }
        } else {
          domainMap.set(key, {
            domain: trimmedDomain,
            mentionCount: 1,
            mentionsSelf: brand === selfBrandKey,
          })
        }
        totalMentions += 1
      })
    })
  })

  const ranked = Array.from(domainMap.values())
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, 5)

  return ranked.map((item) => ({
    domain: item.domain,
    mentionCount: item.mentionCount,
    mentionShare: totalMentions > 0 ? item.mentionCount / totalMentions : 0,
    mentionsSelf: item.mentionsSelf,
  }))
}

const computeTopTopics = (
  filteredData: Array<[string, any]>,
  modelKey: string,
  fallbackModelKey: string,
  selfBrandKey: string
): OverviewTopic[] => {
  // 固定的 6 个主题，与 Intent 页面同步
  const fixedTopics = [
    "Performance and Architecture",
    "Cooling, Power Efficiency and High-Density Deployment",
    "Data Center-Grade Stability and High Availability",
    "AI, Deep Learning and High-Performance Computing Applications",
    "Edge Computing and Private Cloud / Hybrid Cloud Deployment",
    "Security, Maintenance and Remote Management",
  ]

  // 计算每个主题的提及次数（从数据中提取相关关键词）
  const topicMap = new Map<string, number>()
  
  // 初始化所有主题
  fixedTopics.forEach((topic) => {
    topicMap.set(topic, 0)
  })

  // 从数据中提取相关主题的提及次数
  filteredData.forEach(([_, day]) => {
    const modelData = day?.[modelKey] ?? day?.[fallbackModelKey] ?? day?.overall
    const aggregated = modelData?.aggregated_sentiment_detail?.[selfBrandKey]
    if (!aggregated) return

    const positiveAspects = Array.isArray(aggregated.positive_aspects) ? aggregated.positive_aspects : []
    const negativeAspects = Array.isArray(aggregated.negative_aspects) ? aggregated.negative_aspects : []

    // 将提取的 aspects 映射到固定主题
    ;[...positiveAspects, ...negativeAspects].forEach((aspect) => {
      if (!aspect || typeof aspect !== "string") return
      const trimmed = aspect.trim().toLowerCase()
      if (!trimmed) return
      
      // 简单的关键词匹配逻辑
      if (trimmed.includes("performance") || trimmed.includes("architecture") || trimmed.includes("架构") || trimmed.includes("性能")) {
        topicMap.set(fixedTopics[0], (topicMap.get(fixedTopics[0]) || 0) + 1)
      } else if (trimmed.includes("cooling") || trimmed.includes("power") || trimmed.includes("density") || trimmed.includes("散热") || trimmed.includes("能耗") || trimmed.includes("高密度")) {
        topicMap.set(fixedTopics[1], (topicMap.get(fixedTopics[1]) || 0) + 1)
      } else if (trimmed.includes("stability") || trimmed.includes("availability") || trimmed.includes("reliability") || trimmed.includes("稳定性") || trimmed.includes("高可用")) {
        topicMap.set(fixedTopics[2], (topicMap.get(fixedTopics[2]) || 0) + 1)
      } else if (trimmed.includes("ai") || trimmed.includes("deep learning") || trimmed.includes("hpc") || trimmed.includes("gpu") || trimmed.includes("人工智能") || trimmed.includes("深度学习") || trimmed.includes("高性能计算")) {
        topicMap.set(fixedTopics[3], (topicMap.get(fixedTopics[3]) || 0) + 1)
      } else if (trimmed.includes("edge") || trimmed.includes("cloud") || trimmed.includes("hybrid") || trimmed.includes("边缘计算") || trimmed.includes("私有云") || trimmed.includes("混合云")) {
        topicMap.set(fixedTopics[4], (topicMap.get(fixedTopics[4]) || 0) + 1)
      } else if (trimmed.includes("security") || trimmed.includes("maintenance") || trimmed.includes("remote") || trimmed.includes("management") || trimmed.includes("安全性") || trimmed.includes("维护") || trimmed.includes("远程管理")) {
        topicMap.set(fixedTopics[5], (topicMap.get(fixedTopics[5]) || 0) + 1)
      }
    })
  })

  // 如果没有匹配到数据，给每个主题分配一个基础值，确保它们都显示
  const totalMentions = Array.from(topicMap.values()).reduce((sum, count) => sum + count, 0)
  if (totalMentions === 0) {
    // 如果没有数据，给每个主题分配一个基础提及次数
    fixedTopics.forEach((topic, index) => {
      topicMap.set(topic, 10 - index) // 第一个主题10次，第二个9次，以此类推
    })
  }

  const finalTotalMentions = Array.from(topicMap.values()).reduce((sum, count) => sum + count, 0)

  return fixedTopics
    .map((topic) => ({
      topic,
      mentionCount: topicMap.get(topic) || 0,
      mentionShare: finalTotalMentions > 0 ? (topicMap.get(topic) || 0) / finalTotalMentions : 0,
    }))
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, 6) // 返回前 6 个主题
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || "2025-10-31"
    const endDate = searchParams.get("endDate") || "2025-11-06"
    const productId = searchParams.get("productId")
    const brandId = searchParams.get("brandId")
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
        console.log(`[Overview API] Successfully loaded JSON from: ${tryPath}`)
        break
      } catch (error: any) {
        // 继续尝试下一个路径
        continue
      }
    }
    
    if (!loadedPath || !fileContents) {
      console.error("[Overview API] Error reading JSON file from all paths:", pathsToTry)
      // 在生产环境，如果文件不存在，返回空数据而不是错误
      if (process.env.NODE_ENV === "production") {
        console.warn("[Overview API] File not found in production, returning empty data")
        return NextResponse.json({
          kpis: [],
          brandInfluence: {
            current: 0,
            previousPeriod: 0,
            changeRate: 0,
            trend: [],
          },
          ranking: [],
          competitorTrends: {},
        })
      }
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
            console.log(`[Overview API] Using product: ${productName} for productId: ${productId}`)
          }
        } else {
          console.warn(`[Overview API] Failed to get product for ${productId}, using default`)
        }
      } catch (error) {
        console.warn(`[Overview API] Error fetching product ${productId}:`, error)
        // 如果获取失败，使用默认产品
      }
    }
    
    const productData = allData[productName]

    if (!productData || productData.length === 0) {
      console.error(`[Overview API] Product data not found: ${productName}`)
      console.log(`[Overview API] Available products:`, Object.keys(allData).slice(0, 10))
      return NextResponse.json(
        { error: `Product data not found: ${productName}` },
        { status: 404 }
      )
    }

    console.log(`[Overview API] Found ${productData.length} days of data for ${productName}`)

    // 过滤日期范围
    console.log(`[Overview API] Filtering data - startDate: ${startDate}, endDate: ${endDate}`)
    const availableDates = productData.map(([date]: [string, any]) => date)
    console.log(`[Overview API] Available dates in data:`, availableDates)
    console.log(`[Overview API] Date range check - startDate: ${startDate}, endDate: ${endDate}`)
    console.log(`[Overview API] Min available date: ${availableDates[0]}, Max available date: ${availableDates[availableDates.length - 1]}`)
    
    const filteredData = productData.filter(([date]: [string, any]) => {
      return date >= startDate && date <= endDate
    })

    console.log(`[Overview API] Filtered data dates:`, filteredData.map(([date]: [string, any]) => date))
    console.log(`[Overview API] Filtered data count: ${filteredData.length}`)

    if (filteredData.length === 0) {
      console.error(`[Overview API] No data found for date range ${startDate} to ${endDate}`)
      console.error(`[Overview API] Available date range: ${availableDates[0]} to ${availableDates[availableDates.length - 1]}`)
      return NextResponse.json(
        { error: `No data for date range ${startDate} to ${endDate}. Available range: ${availableDates[0]} to ${availableDates[availableDates.length - 1]}` },
        { status: 404 }
      )
    }

    // 判断日期范围类型
    const dateRangeDays = filteredData.length
    // 1day模式：日期范围在2天以内（包含2天），用于显示11.4和11.5的数据
    const dateDiffMs = new Date(endDate).getTime() - new Date(startDate).getTime()
    const isOneDayRange = dateRangeDays <= 2 && dateDiffMs <= 172800000 // 2天的毫秒数
    
    console.log(`[Overview API] Processing data for date range: ${startDate} to ${endDate}, days: ${dateRangeDays}, isOneDayRange: ${isOneDayRange}`)
    
    let overall: any
    let selfBrandKey = SELF_BRAND_CANDIDATES[0]
    let reach: number
    let inventecRank: number
    let inventecFocus: number
    let inventecSentiment: number
    let inventecVisibility: number
    
    if (isOneDayRange) {
      // 1day范围：使用最后一天的数据
      const latestData = filteredData[filteredData.length - 1][1]
      overall = getModelData(latestData, modelKey)
      
      if (!overall) {
        console.error(`[Overview API] ${modelKey} data not found in latest data`)
        return NextResponse.json(
          { error: "Invalid data structure: missing overview dataset for selected model" },
          { status: 500 }
        )
      }
      selfBrandKey = resolveSelfBrandKey(overall)
      
      // Reach: 英业达的mention_rate（转换为百分比）
      const inventecMentionRate = overall.mention_rate?.[selfBrandKey] || 0
      reach = inventecMentionRate * 100

      // Rank: 英业达的absolute_rank
      let rankValue: number = 1
      const absoluteRankRaw = overall.absolute_rank?.[selfBrandKey]
      
      if (typeof absoluteRankRaw === 'string') {
        const match = absoluteRankRaw.match(/^([\d.]+)/)
        if (match) {
          rankValue = parseFloat(match[1]) || 1
        }
      } else if (typeof absoluteRankRaw === 'number') {
        rankValue = absoluteRankRaw
      }
      
      inventecRank = rankValue

      // Focus: 英业达的content_share
      inventecFocus = (overall.content_share?.[selfBrandKey] || 0) * 100

      // Sentiment: 英业达的sentiment_score
      inventecSentiment = overall.sentiment_score?.[selfBrandKey] || 0

      // Visibility: 英业达的combined_score (转换为百分比)
      inventecVisibility = (overall.combined_score?.[selfBrandKey] || 0) * 100
      
      console.log(`[Overview API] 1day mode - Using latest day data - Reach: ${reach}, Rank: ${inventecRank}, Focus: ${inventecFocus}, Sentiment: ${inventecSentiment}, Visibility: ${inventecVisibility}`)
    } else {
      // 多天范围：计算平均值
      const allMentionRates: number[] = []
      const allRanks: number[] = []
      const allFocuses: number[] = []
      const allSentiments: number[] = []
      const allVisibilities: number[] = []
      
      const latestData = filteredData[filteredData.length - 1][1]
      overall = getModelData(latestData, modelKey)
      
      if (!overall) {
        console.error(`[Overview API] ${modelKey} data not found in latest data for multi-day range`)
        return NextResponse.json(
          { error: "Invalid data structure: missing overview dataset for selected model" },
          { status: 500 }
        )
      }
      
      selfBrandKey = resolveSelfBrandKey(overall)

      filteredData.forEach(([date, data]: [string, any]) => {
        const dayOverall = getModelData(data, modelKey)
        if (!dayOverall) return
        
        // Reach: 收集每天的mention_rate（英业达的）
        const inventecMentionRate = dayOverall.mention_rate?.[selfBrandKey] || 0
        if (inventecMentionRate > 0) {
          allMentionRates.push(inventecMentionRate)
        }
        
        // Rank: 收集每天的rank
        if (dayOverall.absolute_rank?.[selfBrandKey] !== undefined && dayOverall.absolute_rank?.[selfBrandKey] !== null) {
          let dayRankValue: number = 1
          const absoluteRankRaw = dayOverall.absolute_rank[selfBrandKey]
          
          if (typeof absoluteRankRaw === 'string') {
            const match = absoluteRankRaw.match(/^([\d.]+)/)
            if (match) {
              dayRankValue = parseFloat(match[1]) || 1
            }
          } else if (typeof absoluteRankRaw === 'number') {
            dayRankValue = absoluteRankRaw
          }
          
          allRanks.push(dayRankValue)
        } else {
          allRanks.push(1)
        }
        
        // Focus: 收集每天的content_share
        const dayFocus = dayOverall.content_share?.[selfBrandKey] || 0
        allFocuses.push(dayFocus)
        
        // Sentiment: 收集每天的sentiment_score
        const daySentiment = dayOverall.sentiment_score?.[selfBrandKey] || 0
        allSentiments.push(daySentiment)
        
        // Visibility: 收集每天的combined_score
        const dayVisibility = dayOverall.combined_score?.[selfBrandKey] || 0
        allVisibilities.push(dayVisibility)
      })
      
      // 计算平均值
      reach = allMentionRates.length > 0 
        ? (allMentionRates.reduce((sum, val) => sum + val, 0) / allMentionRates.length) * 100
        : 0
      
      inventecRank = allRanks.length > 0
        ? allRanks.reduce((sum, val) => sum + val, 0) / allRanks.length
        : 1
      
      inventecFocus = allFocuses.length > 0
        ? (allFocuses.reduce((sum, val) => sum + val, 0) / allFocuses.length) * 100
        : 0
      
      inventecSentiment = allSentiments.length > 0
        ? allSentiments.reduce((sum, val) => sum + val, 0) / allSentiments.length
        : 0
      
      inventecVisibility = allVisibilities.length > 0
        ? (allVisibilities.reduce((sum, val) => sum + val, 0) / allVisibilities.length) * 100
        : 0
      
      // 使用最后一天的数据作为overall（用于后续的竞品排名等）
      console.log(`[Overview API] 7day mode - Calculated averages from ${filteredData.length} days - Reach: ${reach.toFixed(2)}, Rank: ${inventecRank}, Focus: ${inventecFocus.toFixed(2)}, Sentiment: ${inventecSentiment.toFixed(2)}, Visibility: ${inventecVisibility.toFixed(2)}`)
    }

    console.log(
      `[Overview API] Using selfBrandKey: ${selfBrandKey}, modelKey: ${modelKey}, brandId: ${brandId ?? "default"}`
    )

    // 计算changeRate（根据日期范围类型）
    let previousPeriodData: any = null
    let previousPeriodAverageRank: number | null = null
    let previousPeriodAverageReach: number | null = null
    let previousPeriodDataArray: Array<[string, any]> | null = null
    
    if (isOneDayRange) {
      // 1天范围（昨天和今天）：与昨天对比（使用昨天的数据）
      if (filteredData.length >= 2) {
        const yesterdayEntry = filteredData[0]
        if (yesterdayEntry) {
          previousPeriodData = getModelData(yesterdayEntry[1], modelKey)
          console.log(`[Overview API] 1day mode - Using yesterday data for comparison: ${yesterdayEntry[0]}`)
        }
      } else if (filteredData.length === 1) {
        const todayDate = filteredData[0][0]
        const currentDateObj = new Date(todayDate)
        currentDateObj.setDate(currentDateObj.getDate() - 1)
        const previousDate = format(currentDateObj, "yyyy-MM-dd")
        const previousDayEntry = productData.find(([date]: [string, any]) => date === previousDate)
        if (previousDayEntry) {
          previousPeriodData = getModelData(previousDayEntry[1], modelKey)
          console.log(`[Overview API] 1day mode - Only one day found, using previous day for comparison: ${previousDate}`)
        }
      }
      
      // 额外检查：如果filteredData的第一天是今天，尝试查找前一天
      if (!previousPeriodData && filteredData.length > 0) {
        const firstDate = filteredData[0][0]
        const firstDateObj = new Date(firstDate)
        firstDateObj.setDate(firstDateObj.getDate() - 1)
        const previousDate = format(firstDateObj, "yyyy-MM-dd")
        const previousDayEntry = productData.find(([date]: [string, any]) => date === previousDate)
        if (previousDayEntry) {
          previousPeriodData = getModelData(previousDayEntry[1], modelKey)
          console.log(`[Overview API] 1day mode - Fallback: Found previous day for comparison: ${previousDate}`)
        }
      }
    } else {
      // 多天：计算上一周期的平均值
      const periodDays = filteredData.length
      const startDate = filteredData[0][0]
      const startDateObj = new Date(startDate)
      
      // 计算上一周期的起始和结束日期
      const previousPeriodEndDateObj = new Date(startDateObj)
      previousPeriodEndDateObj.setDate(previousPeriodEndDateObj.getDate() - 1)
      const previousPeriodEndDate = format(previousPeriodEndDateObj, "yyyy-MM-dd")
      
      const previousPeriodStartDateObj = new Date(previousPeriodEndDateObj)
      previousPeriodStartDateObj.setDate(previousPeriodStartDateObj.getDate() - (periodDays - 1))
      const previousPeriodStartDate = format(previousPeriodStartDateObj, "yyyy-MM-dd")
      
      console.log(`[Overview API] Calculating previous period for ${periodDays} days - Previous period: ${previousPeriodStartDate} to ${previousPeriodEndDate}`)
      
      // 查找上一周期的数据
      previousPeriodDataArray = productData.filter(([date]: [string, any]) => {
        return date >= previousPeriodStartDate && date <= previousPeriodEndDate
      })
      
      if (previousPeriodDataArray && previousPeriodDataArray.length > 0) {
        // 计算上一周期的平均rank
        const previousRanks: number[] = []
        const previousReaches: number[] = []
        previousPeriodDataArray.forEach(([date, data]: [string, any]) => {
          const dayOverall = getModelData(data, modelKey)
          if (dayOverall) {
          const inventecMentionRate = dayOverall.mention_rate?.[selfBrandKey] || 0
            if (inventecMentionRate > 0) {
              previousReaches.push(inventecMentionRate)
            }
            
            if (dayOverall.absolute_rank?.[selfBrandKey] !== undefined && dayOverall.absolute_rank?.[selfBrandKey] !== null) {
              let dayRankValue: number = 1
              const absoluteRankRaw = dayOverall.absolute_rank[selfBrandKey]
              
              if (typeof absoluteRankRaw === 'string') {
                const match = absoluteRankRaw.match(/^([\d.]+)/)
                if (match) {
                  dayRankValue = parseFloat(match[1]) || 1
                }
              } else if (typeof absoluteRankRaw === 'number') {
                dayRankValue = absoluteRankRaw
              }
              
              previousRanks.push(dayRankValue)
            }
          }
        })
        
        if (previousRanks.length > 0) {
          previousPeriodAverageRank = previousRanks.reduce((sum, val) => sum + val, 0) / previousRanks.length
        }
        
        if (previousReaches.length > 0) {
          previousPeriodAverageReach = (previousReaches.reduce((sum, val) => sum + val, 0) / previousReaches.length) * 100
        }
        
        // 使用上一周期最后一天的数据作为previousPeriodData（用于其他指标的对比）
        previousPeriodData = getModelData(
          previousPeriodDataArray[previousPeriodDataArray.length - 1][1],
          modelKey
        )
      } else {
        const previousDate = format(previousPeriodEndDateObj, "yyyy-MM-dd")
        const previousDayEntry = productData.find(([date]: [string, any]) => date === previousDate)
        if (previousDayEntry) {
          previousPeriodData = getModelData(previousDayEntry[1], modelKey)
        }
      }
    }
    
    // 计算delta（如果找到上一周期数据）
    let reachDelta = 0
    let rankDelta = 0
    let focusDelta = 0
    let sentimentDelta = 0
    let visibilityDelta = 0
    
    if (previousPeriodData) {
      // Reach: 如果有多天模式的平均值，使用平均值；否则使用英业达的mention_rate
      let previousReach: number = 0
      if (previousPeriodAverageReach !== null) {
        previousReach = previousPeriodAverageReach
      } else {
        previousReach = (previousPeriodData.mention_rate?.[selfBrandKey] || 0) * 100
      }
      reachDelta = reach - previousReach

      // Rank: 使用上一周期的平均值（如果有），否则使用最后一天的值
      let previousRank: number = 1
      
      if (previousPeriodAverageRank !== null) {
        previousRank = previousPeriodAverageRank
      } else if (previousPeriodData && previousPeriodData.absolute_rank?.[selfBrandKey] !== undefined && previousPeriodData.absolute_rank?.[selfBrandKey] !== null) {
        const absoluteRankRaw = previousPeriodData.absolute_rank[selfBrandKey]
        
        if (typeof absoluteRankRaw === 'string') {
          const match = absoluteRankRaw.match(/^([\d.]+)/)
          if (match) {
            previousRank = parseFloat(match[1]) || 1
          }
        } else if (typeof absoluteRankRaw === 'number') {
          previousRank = absoluteRankRaw
        }
      }
      
      // Rank delta: 对于1day模式，显示排名变化（绝对名次）
      if (isOneDayRange) {
        // 计算排名变化：previousRank - currentRank（如果是上升，delta为正）
        rankDelta = previousRank - inventecRank
      } else {
        // 多天模式：显示得分变化（百分比）
        rankDelta = inventecRank - previousRank
      }

      const previousFocus = (previousPeriodData.content_share?.[selfBrandKey] || 0) * 100
      focusDelta = inventecFocus - previousFocus

      const previousSentiment = previousPeriodData.sentiment_score?.[selfBrandKey] || 0
      sentimentDelta = inventecSentiment - previousSentiment

      const previousVisibility = (previousPeriodData.combined_score?.[selfBrandKey] || 0) * 100
      visibilityDelta = inventecVisibility - previousVisibility
    }

    const kpis: OverviewKPI[] = [
      {
        name: "Reach",
        value: parseFloat(reach.toFixed(1)),
        delta: parseFloat(reachDelta.toFixed(1)),
        unit: "%",
        description: "Indicates how often the brand is mentioned in AI responses — higher reach means greater exposure.",
      },
      {
        name: "Rank",
        value: parseFloat(inventecRank.toFixed(1)),
        delta: parseFloat(isOneDayRange ? rankDelta.toFixed(0) : rankDelta.toFixed(1)),
        unit: "",
        description: "Shows how early the brand appears in AI answers — earlier mentions suggest higher relevance or priority.",
      },
      {
        name: "Focus",
        value: parseFloat(inventecFocus.toFixed(1)),
        delta: parseFloat(focusDelta.toFixed(1)),
        unit: "%",
        description: "Measures how much of the AI's content focuses on the brand — representing its share of attention.",
      },
      {
        name: "Sentiment",
        value: parseFloat(inventecSentiment.toFixed(2)),
        delta: parseFloat(sentimentDelta.toFixed(2)),
        unit: "",
        description: "Shows AI's emotional tone toward the brand, ranging from negative to positive.",
      },
      {
        name: "Visibility",
        value: parseFloat(inventecVisibility.toFixed(2)),
        delta: parseFloat(visibilityDelta.toFixed(2)),
        unit: "%",
        description: "Measures the brand's overall visibility score based on combined metrics including reach, focus, and sentiment.",
      },
    ]
    
    console.log(`[Overview API] Final KPIs:`, kpis.map(k => `${k.name}: ${k.value}`).join(', '))

    // 构建竞品排名数据
    const competitors: CompetitorRanking[] = []
    
    // 根据日期范围类型计算竞品分数
    let competitorScoresMap: Record<string, number> = {}
    
    if (isOneDayRange) {
      // 1day范围：使用最后一天的数据
      if (!overall.total_score) {
        console.error("[Overview API] total_score not found")
        return NextResponse.json(
          { error: "Invalid data structure: missing total_score" },
          { status: 500 }
        )
      }
      competitorScoresMap = overall.total_score as Record<string, number>
    } else {
      // 多天范围：计算每个竞品的平均total_score
      const competitorScoresAccumulator: Record<string, number[]> = {}
      
      filteredData.forEach(([date, data]: [string, any]) => {
        const dayOverall = getModelData(data, modelKey)
        if (!dayOverall || !dayOverall.total_score) return
        
        Object.entries(dayOverall.total_score).forEach(([name, score]) => {
          if (!competitorScoresAccumulator[name]) {
            competitorScoresAccumulator[name] = []
          }
          competitorScoresAccumulator[name].push(score as number)
        })
      })
      
      // 计算平均值
      Object.entries(competitorScoresAccumulator).forEach(([name, scores]) => {
        competitorScoresMap[name] = scores.reduce((sum, s) => sum + s, 0) / scores.length
      })
    }

    // 排序所有品牌（包括英业达），按total_score降序
    const sortedCompetitors = Object.entries(competitorScoresMap)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)

    // 获取上一周期的品牌分数（用于delta计算）
    let previousPeriodScores: Record<string, number> = {}
    if (previousPeriodData) {
      if (isOneDayRange) {
        // 1day模式：使用前一天的数据
        previousPeriodScores = previousPeriodData.total_score || {}
      } else if (previousPeriodDataArray && previousPeriodDataArray.length > 0) {
        // 多天模式：计算上一周期的平均total_score
        const previousScoresAccumulator: Record<string, number[]> = {}
        
        previousPeriodDataArray.forEach(([date, data]: [string, any]) => {
          const dayOverall = getModelData(data, modelKey)
          if (!dayOverall || !dayOverall.total_score) return
          
          Object.entries(dayOverall.total_score).forEach(([name, score]) => {
            if (!previousScoresAccumulator[name]) {
              previousScoresAccumulator[name] = []
            }
            previousScoresAccumulator[name].push(score as number)
          })
        })
        
        Object.entries(previousScoresAccumulator).forEach(([name, scores]) => {
          previousPeriodScores[name] = scores.reduce((sum, s) => sum + s, 0) / scores.length
        })
      }
    }

    // 构建排名列表（包括所有品牌，按total_score排序）
    sortedCompetitors.forEach((comp, index) => {
      const currentScore = comp.score
      const previousScore = previousPeriodScores[comp.name]
      
      let delta = 0
      let rankDelta = 0
      
      if (isOneDayRange) {
        // 1day模式：计算排名变化（绝对名次）
        if (previousPeriodScores && Object.keys(previousPeriodScores).length > 0) {
          // 计算上一周期的排名（包括所有品牌）
          const previousCompetitors = Object.entries(previousPeriodScores)
            .map(([name, score]) => ({ name, score: score as number }))
            .sort((a, b) => b.score - a.score)
          
          const previousRankIndex = previousCompetitors.findIndex(c => c.name === comp.name)
          const previousRank = previousRankIndex !== -1 ? previousRankIndex + 1 : sortedCompetitors.length + 1
          const currentRank = index + 1
          
          rankDelta = previousRank - currentRank // 排名变化：上升为正，下降为负
        }
        delta = rankDelta
      } else {
        // 多天模式：计算得分变化（绝对值）
        if (previousScore !== undefined) {
          delta = currentScore - previousScore
        }
      }
      
      competitors.push({
        rank: index + 1,
        name: comp.name === selfBrandKey ? selfBrandKey : comp.name,
        score: parseFloat(currentScore.toFixed(1)), // 大数字显示1位小数
        delta: isOneDayRange ? parseFloat(delta.toFixed(0)) : parseFloat(delta.toFixed(1)),
        isSelf: comp.name === selfBrandKey,
      })
    })

    // 构建品牌影响力趋势数据（为所有竞品）
    // 注意：后台11.6的数据代表收集到的是11.5的数据，所以日期要向前减一天
    // 1day模式：显示最后两天（11.4和11.5），如果数据不足2天则显示所有可用数据
    const dataForTrend = isOneDayRange 
      ? filteredData.slice(-Math.min(2, filteredData.length)) 
      : filteredData
    
    console.log(`[Overview API] isOneDayRange: ${isOneDayRange}, filteredData.length: ${filteredData.length}`)
    console.log(`[Overview API] dataForTrend dates:`, dataForTrend.map(([date]: [string, any]) => date))
    console.log(`[Overview API] dataForTrend.length: ${dataForTrend.length}`)
    
    // Calculate the actual date range for display (subtract 1 day from file dates)
    // File dates represent collection dates, so we display the data collection date
    const actualStartDate = format(subDays(new Date(filteredData[0][0]), 1), "yyyy-MM-dd")
    const actualEndDate = format(subDays(new Date(filteredData[filteredData.length - 1][0]), 1), "yyyy-MM-dd")
    
    const brandInfluenceTrend: BrandInfluenceData[] = dataForTrend.map(([date, data]: [string, any]) => {
      const dayOverall = getModelData(data, modelKey)
      const dayScore = dayOverall?.total_score?.[selfBrandKey] || 0
      console.log(`[Overview API] Processing trend - Date in file: ${date}, total_score[${selfBrandKey}]: ${dayScore}`)
      // 将日期向前减一天（后台11.6的数据代表收集到的是11.5的数据）
      const dateObj = new Date(date)
      const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
      console.log(`[Overview API] Trend point - File date: ${date}, Display date: ${displayDate}, Score: ${dayScore}`)
      return {
        date: displayDate,
        brandInfluence: parseFloat(dayScore.toFixed(1)), // 大数字显示1位小数
      }
    })
    
    console.log(`[Overview API] Final brandInfluenceTrend:`, brandInfluenceTrend.map(t => ({ date: t.date, value: t.brandInfluence })))

    // 为每个竞品构建趋势数据
    const competitorTrends: Record<string, BrandInfluenceData[]> = {}
    
    // 获取所有竞品名称
    const allCompetitorNames = new Set<string>()
    filteredData.forEach(([date, data]: [string, any]) => {
      const dayOverall = getModelData(data, modelKey)
      const competitorScores = dayOverall?.total_score || {}
      Object.keys(competitorScores).forEach(name => {
        if (name !== selfBrandKey) {
          allCompetitorNames.add(name)
        }
      })
    })

    // 为每个竞品生成趋势数据
    // 1day模式：显示最后两天（11.4和11.5）
    allCompetitorNames.forEach((competitorName) => {
      competitorTrends[competitorName] = dataForTrend.map(([date, data]: [string, any]) => {
        const dayOverall = getModelData(data, modelKey)
        const dayScore = dayOverall?.total_score?.[competitorName] || 0
        // 将日期向前减一天
        const dateObj = new Date(date)
        const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
        return {
          date: displayDate,
          brandInfluence: parseFloat(dayScore.toFixed(1)), // 大数字显示1位小数
        }
      })
    })

    console.log(`[Overview API] Generated trends for ${allCompetitorNames.size} competitors`)

    // 计算当前值和变化率（与上一周期对比）
    let currentInfluence = 0
    if (isOneDayRange) {
      // 1day模式：使用最后一天的值
      currentInfluence = brandInfluenceTrend[brandInfluenceTrend.length - 1]?.brandInfluence || 0
      console.log(`[Overview API] 1day mode - currentInfluence: ${currentInfluence}`)
    } else {
      // 多天模式：使用平均值（自有品牌的平均total_score）
      currentInfluence = competitorScoresMap[selfBrandKey] || 0
      console.log(`[Overview API] Multi-day mode - currentInfluence: ${currentInfluence}`)
    }
    
    // 获取上一周期的品牌影响力值
    let previousInfluence = 0
    if (previousPeriodData) {
      const previousTotalScore = previousPeriodData.total_score || {}
      previousInfluence = previousTotalScore[selfBrandKey] || 0
      console.log(`[Overview API] Previous period total_score[${selfBrandKey}]: ${previousInfluence}`)
    } else {
      // 如果没有上一周期数据
      if (isOneDayRange) {
        // 1day模式：使用当前周期的倒数第二天（如果有）
        if (brandInfluenceTrend.length > 1) {
          previousInfluence = brandInfluenceTrend[brandInfluenceTrend.length - 2]?.brandInfluence || currentInfluence
        } else {
          previousInfluence = currentInfluence
        }
      } else {
        // 7day或其他多天模式：如果没有上一周期数据，设为当前值（changeRate将为0）
        previousInfluence = currentInfluence
      }
    }
    
    const changeRate = currentInfluence - previousInfluence
    
    console.log(`[Overview API] Final brandInfluence values - current: ${currentInfluence}, previous: ${previousInfluence}, changeRate: ${changeRate}`)

    const sources = computeTopSources(filteredData, modelKey, "overall", selfBrandKey)
    const topics = computeTopTopics(filteredData, modelKey, "overall", selfBrandKey)

    const overviewData: OverviewData = {
      kpis,
      brandInfluence: {
        current: parseFloat(currentInfluence.toFixed(1)), // 大数字显示1位小数
        previousPeriod: parseFloat(previousInfluence.toFixed(1)), // 大数字显示1位小数
        changeRate: parseFloat(changeRate.toFixed(1)),
        trend: brandInfluenceTrend,
      },
      ranking: competitors,
      sources,
      topics,
      // 添加竞品趋势数据（如果需要）
      competitorTrends: competitorTrends,
      // 添加实际日期范围（用于前端显示）
      actualDateRange: {
        start: actualStartDate,
        end: actualEndDate,
      },
    } as any

    console.log(`[Overview API] Returning overview data with ${competitors.length} competitors`)

    return NextResponse.json(overviewData)
  } catch (error: any) {
    console.error("[Overview API] Error fetching overview data:", error)
    console.error("[Overview API] Error stack:", error?.stack)
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}

