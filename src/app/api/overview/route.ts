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
import { toTraditional } from "@/lib/i18n"

const MODEL_KEY_MAP: Record<string, string> = {
  all: "overall",
  gpt: "chatgpt",
  gemini: "gemini",
  claude: "claude",
}

const SELF_BRAND_CANDIDATES = ["英业达", "Inventec"]

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
  selfBrandKey: string,
  language: string = "en"
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
    if (!brandDomains || typeof brandDomains !== "object") return

    Object.entries(brandDomains).forEach(([brand, domains]) => {
      if (!Array.isArray(domains)) return
      const translatedBrand = language === "zh-TW" ? toTraditional(brand) : brand
      domains.forEach((rawDomain) => {
        if (!rawDomain || typeof rawDomain !== "string") return
        const trimmedDomain = rawDomain.trim()
        if (!trimmedDomain) return
        
        // 去重：使用小写域名作为key，但保留原始域名格式
        const key = trimmedDomain.toLowerCase()
        const existing = domainMap.get(key)
        if (existing) {
          // 域名已存在，增加计数
          existing.mentionCount += 1
          // 如果当前品牌是本品牌，标记为提及本品牌
          if (brand === selfBrandKey || translatedBrand === selfBrandKey) {
            existing.mentionsSelf = true
          }
        } else {
          // 新域名，添加到map
          domainMap.set(key, {
            domain: trimmedDomain, // 保留原始格式（包括大小写）
            mentionCount: 1,
            mentionsSelf: brand === selfBrandKey || translatedBrand === selfBrandKey,
          })
        }
        // 总提及次数（用于计算比例）
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
  // 从数据中真实提取主题（从所有品牌的aspects中提取）
  const topicMap = new Map<string, number>()
  let totalAspects = 0

  // 从数据中提取所有aspects，统计每个aspect的出现次数
  filteredData.forEach(([_, day]) => {
    const modelData = day?.[modelKey] ?? day?.[fallbackModelKey] ?? day?.overall
    const aggregated = modelData?.aggregated_sentiment_detail
    if (!aggregated || typeof aggregated !== "object") return

    // 遍历所有品牌的aspects
    Object.values(aggregated).forEach((brandData: any) => {
      if (!brandData || typeof brandData !== "object") return
      
      const positiveAspects = Array.isArray(brandData.positive_aspects) ? brandData.positive_aspects : []
      const negativeAspects = Array.isArray(brandData.negative_aspects) ? brandData.negative_aspects : []

      // 统计每个aspect的出现次数（作为主题）
      ;[...positiveAspects, ...negativeAspects].forEach((aspect) => {
        if (!aspect || typeof aspect !== "string") return
        const trimmed = aspect.trim()
        if (!trimmed) return
        
        // 使用aspect本身作为主题名
        const topicName = trimmed
        topicMap.set(topicName, (topicMap.get(topicName) || 0) + 1)
        totalAspects += 1
      })
    })
  })

  // 如果没有任何数据，返回空数组
  if (topicMap.size === 0) {
    return []
  }

  // 构建topics数组，按提及次数从高到低排序
  const topicsWithData = Array.from(topicMap.entries())
    .map(([topic, mentionCount]) => ({
      topic,
      mentionCount,
    }))
    .sort((a, b) => b.mentionCount - a.mentionCount) // 按提及次数从高到低排序

  // 计算总提及次数（用于计算占比）
  const finalTotalMentions = topicsWithData.reduce((sum, item) => sum + item.mentionCount, 0)

  // 返回热门topics：按占比从高到低排序，最多返回前5个最热门的
  return topicsWithData
    .map((item) => ({
      topic: item.topic,
      mentionCount: item.mentionCount,
      mentionShare: finalTotalMentions > 0 ? item.mentionCount / finalTotalMentions : 0,
    }))
    .slice(0, 5) // 只返回前5个最热门的topics
}

// 翻译函数：根据语言参数翻译数据
const translateData = (data: any, language: string): any => {
  if (language !== "zh-TW") {
    return data // 如果不是繁体中文，直接返回
  }
  
  if (typeof data === "string") {
    return toTraditional(data)
  }
  
  if (Array.isArray(data)) {
    return data.map(item => translateData(item, language))
  }
  
  if (data && typeof data === "object") {
    const translated: any = {}
    for (const [key, value] of Object.entries(data)) {
      // 翻译键名（如果是品牌名等）
      const translatedKey = toTraditional(key)
      translated[translatedKey] = translateData(value, language)
    }
    return translated
  }
  
  return data
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || "2025-11-08"
    const endDate = searchParams.get("endDate") || "2025-11-14"
    const productId = searchParams.get("productId")
    const brandId = searchParams.get("brandId")
    const modelParam = searchParams.get("model")
    const language = searchParams.get("language") || "en"
    const modelKey = getModelKey(modelParam)

    // 读取JSON文件 - 只使用新文件
    const projectRoot = process.cwd()
    const dataPath = path.resolve(projectRoot, "data", "all_products_results_20251114_021851.json")
    
    let fileContents: string = ""
    
    try {
      fileContents = await fs.readFile(dataPath, "utf8")
      console.log(`[Overview API] Successfully loaded JSON from: ${dataPath}`)
    } catch (error: any) {
      console.error(`[Overview API] Error reading JSON file from: ${dataPath}`, error)
      return NextResponse.json(
        { error: "Failed to read data file" },
        { status: 500 }
      )
    }

    const allData = JSON.parse(fileContents)
    
    // 确定要使用的产品名称
    // 新格式: "品牌名 (英文名) | 产品名"
    let productName = "英业达 (Inventec) | 笔记本电脑代工" // 默认产品
    
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
            // 从产品名称构建JSON键名格式
            // 假设产品名称格式可能是 "机架解决方案" 或 "英业达 (Inventec) 机架解决方案"
            const productNameFromAPI = productData.product.name
            const brandName = productData.product.brand?.name || "英业达 (Inventec)"
            
            // 构建新格式的键名: "品牌名 | 产品名"
            if (productNameFromAPI.includes("|")) {
              // 如果已经包含 |，直接使用
              productName = productNameFromAPI
            } else if (productNameFromAPI.includes(brandName)) {
              // 如果包含品牌名，替换空格为 |
              productName = productNameFromAPI.replace(/\s+/, " | ")
            } else {
              // 如果只有产品名，添加品牌名
              productName = `${brandName} | ${productNameFromAPI}`
            }
            
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
    
    // 如果直接匹配失败，尝试查找包含该产品名的键
    let productData = allData[productName]
    
    if (!productData && productName.includes("|")) {
      // 尝试模糊匹配：查找包含品牌和产品名的键
      const [brandPart, productPart] = productName.split("|").map(s => s.trim())
      const matchingKey = Object.keys(allData).find(key => {
        return key.includes(brandPart) && key.includes(productPart)
      })
      if (matchingKey) {
        productName = matchingKey
        productData = allData[matchingKey]
        console.log(`[Overview API] Found matching product key: ${matchingKey}`)
      }
    }

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
      
      // 品牌名显示逻辑：本品牌根据语言显示不同名称，其他品牌保持原样
      let displayName = comp.name
      if (comp.name === selfBrandKey) {
        // 本品牌：保持原始名称，前端会根据语言显示"英业达"或"Inventec"
        displayName = selfBrandKey
      }
      
      competitors.push({
        rank: index + 1,
        name: displayName,
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

    const sources = computeTopSources(filteredData, modelKey, "overall", selfBrandKey, language)
    const topics = computeTopTopics(filteredData, modelKey, "overall", selfBrandKey)

    // 根据语言参数翻译数据
    const translatedRanking = competitors.map((item) => ({
      ...item,
      name: language === "zh-TW" ? toTraditional(item.name) : item.name,
    }))
    
    const translatedSources = sources.map((source) => ({
      ...source,
      domain: language === "zh-TW" ? toTraditional(source.domain) : source.domain,
    }))
    
    const translatedTopics = topics.map((topic) => ({
      ...topic,
      topic: language === "zh-TW" ? toTraditional(topic.topic) : topic.topic,
    }))
    
    // 翻译competitorTrends的键名
    const translatedCompetitorTrends: Record<string, BrandInfluenceData[]> = {}
    Object.entries(competitorTrends).forEach(([key, value]) => {
      const translatedKey = language === "zh-TW" ? toTraditional(key) : key
      translatedCompetitorTrends[translatedKey] = value
    })

    const overviewData: OverviewData = {
      kpis,
      brandInfluence: {
        current: parseFloat(currentInfluence.toFixed(1)), // 大数字显示1位小数
        previousPeriod: parseFloat(previousInfluence.toFixed(1)), // 大数字显示1位小数
        changeRate: parseFloat(changeRate.toFixed(1)),
        trend: brandInfluenceTrend,
      },
      ranking: translatedRanking,
      sources: translatedSources,
      topics: translatedTopics,
      // 添加竞品趋势数据（如果需要）
      competitorTrends: translatedCompetitorTrends,
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

