import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"
import { format, subDays } from "date-fns"
import type { IntentKpis, TopicRow, PromptItem } from "@/types/intent"

const SELF_BRAND_CANDIDATES = ["英业达", "Inventec"]

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

// 固定的6个主题（与Overview和Visibility保持一致）
const FIXED_TOPICS = [
  "Performance and Architecture",
  "Cooling, Power Efficiency and High-Density Deployment",
  "Data Center-Grade Stability and High Availability",
  "AI, Deep Learning and High-Performance Computing Applications",
  "Edge Computing and Private Cloud / Hybrid Cloud Deployment",
  "Security, Maintenance and Remote Management",
]

// 将aspect映射到固定主题
const mapAspectToTopic = (aspect: string): string | null => {
  const normalized = aspect.toLowerCase()
  
  if (normalized.includes("performance") || normalized.includes("architecture") || normalized.includes("架构") || normalized.includes("性能") || normalized.includes("效能")) {
    return FIXED_TOPICS[0]
  } else if (normalized.includes("cooling") || normalized.includes("power") || normalized.includes("density") || normalized.includes("散热") || normalized.includes("能耗") || normalized.includes("高密度") || normalized.includes("功耗") || normalized.includes("效率")) {
    return FIXED_TOPICS[1]
  } else if (normalized.includes("stability") || normalized.includes("availability") || normalized.includes("reliability") || normalized.includes("稳定性") || normalized.includes("高可用") || normalized.includes("可靠性") || normalized.includes("数据中心")) {
    return FIXED_TOPICS[2]
  } else if (normalized.includes("ai") || normalized.includes("deep learning") || normalized.includes("hpc") || normalized.includes("gpu") || normalized.includes("人工智能") || normalized.includes("深度学习") || normalized.includes("高性能计算") || normalized.includes("机器学习")) {
    return FIXED_TOPICS[3]
  } else if (normalized.includes("edge") || normalized.includes("cloud") || normalized.includes("hybrid") || normalized.includes("边缘计算") || normalized.includes("私有云") || normalized.includes("混合云") || normalized.includes("云端")) {
    return FIXED_TOPICS[4]
  } else if (normalized.includes("security") || normalized.includes("maintenance") || normalized.includes("remote") || normalized.includes("management") || normalized.includes("安全性") || normalized.includes("维护") || normalized.includes("远程管理") || normalized.includes("管理")) {
    return FIXED_TOPICS[5]
  }
  
  return null
}

// 推断意图类型
const inferIntent = (text: string): "Information" | "Advice" | "Evaluation" | "Comparison" | "Other" => {
  const normalized = text.toLowerCase()
  
  if (normalized.includes("compare") || normalized.includes("vs") || normalized.includes("versus") || normalized.includes("比较") || normalized.includes("对比")) {
    return "Comparison"
  } else if (normalized.includes("best") || normalized.includes("recommend") || normalized.includes("should") || normalized.includes("建议") || normalized.includes("推荐")) {
    return "Advice"
  } else if (normalized.includes("evaluate") || normalized.includes("assess") || normalized.includes("rate") || normalized.includes("评估") || normalized.includes("评价")) {
    return "Evaluation"
  } else if (normalized.includes("what") || normalized.includes("how") || normalized.includes("which") || normalized.includes("什么") || normalized.includes("如何") || normalized.includes("哪个")) {
    return "Information"
  }
  
  return "Other"
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || "2025-11-08"
    const endDate = searchParams.get("endDate") || "2025-11-14"
    const productId = searchParams.get("productId")
    const modelParam = searchParams.get("model")
    const modelKey = getModelKey(modelParam)

    // 读取JSON文件
    const dataDir = path.join(process.cwd(), "data")
    const dataFilePath = path.join(dataDir, "all_products_results_20251114_021851.json")
    
    let fileContents: string
    try {
      fileContents = await fs.readFile(dataFilePath, "utf-8")
    } catch (error) {
      console.error(`[Intent API] Failed to read data file: ${dataFilePath}`, error)
      return NextResponse.json(
        { error: "Data file not found" },
        { status: 404 }
      )
    }

    const allData = JSON.parse(fileContents)
    
    // 确定要使用的产品名称
    let productName = "英业达 (Inventec) | 笔记本电脑代工" // 默认产品
    
    // 如果提供了productId，尝试从产品数据中获取产品名称
    if (productId) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const productResponse = await fetch(`${baseUrl}/api/products/${productId}`, {
          headers: {
            "Authorization": request.headers.get("Authorization") || "",
          },
        })
        
        if (productResponse.ok) {
          const productData = await productResponse.json()
          if (productData.product && productData.product.name) {
            const productNameFromAPI = productData.product.name
            const brandName = productData.product.brand?.name || "英业达 (Inventec)"
            
            if (productNameFromAPI.includes("|")) {
              productName = productNameFromAPI
            } else if (productNameFromAPI.includes(brandName)) {
              productName = productNameFromAPI.replace(/\s+/, " | ")
            } else {
              productName = `${brandName} | ${productNameFromAPI}`
            }
            
            console.log(`[Intent API] Using product: ${productName} for productId: ${productId}`)
          }
        }
      } catch (error) {
        console.warn(`[Intent API] Error fetching product ${productId}:`, error)
      }
    }
    
    // 如果直接匹配失败，尝试模糊匹配
    let productData = allData[productName]
    
    if (!productData && productName.includes("|")) {
      const [brandPart, productPart] = productName.split("|").map(s => s.trim())
      const matchingKey = Object.keys(allData).find(key => {
        return key.includes(brandPart) && key.includes(productPart)
      })
      if (matchingKey) {
        productName = matchingKey
        productData = allData[matchingKey]
        console.log(`[Intent API] Found matching product key: ${matchingKey}`)
      }
    }

    if (!productData || productData.length === 0) {
      console.error(`[Intent API] Product data not found: ${productName}`)
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

    // 收集所有查询和响应数据
    const topicMap = new Map<string, {
      queries: Array<{ prompt: string; answer: string; intent: string; date: string }>
      reach: number[]
      rank: number[]
      focus: number[]
      sentiment: number[]
      mentions: number[]
    }>()

    // 初始化所有固定主题
    FIXED_TOPICS.forEach(topic => {
      topicMap.set(topic, {
        queries: [],
        reach: [],
        rank: [],
        focus: [],
        sentiment: [],
        mentions: [],
      })
    })

    let totalQueries = 0
    let coreQueries = 0

    filteredData.forEach(([date, data]: [string, any]) => {
      const dayModelData = getModelData(data, modelKey)
      if (!dayModelData) return

      // 1. 优先使用 overall.topics, overall.queries, overall.response
      const topics = Array.isArray(dayModelData.topics) ? dayModelData.topics : []
      const queries = Array.isArray(dayModelData.queries) ? dayModelData.queries : []
      const responses = Array.isArray(dayModelData.response) ? dayModelData.response : []

      // 如果queries和responses有数据，直接使用
      if (queries.length > 0 && responses.length > 0) {
        const minLength = Math.min(queries.length, responses.length)
        for (let i = 0; i < minLength; i++) {
          const query = queries[i]
          const response = responses[i]
          const topic = topics[i] || mapAspectToTopic(query) || FIXED_TOPICS[0]
          
          if (typeof query === "string" && typeof response === "string" && query.trim() && response.trim()) {
            const intent = inferIntent(query)
            const mappedTopic = mapAspectToTopic(query) || topic
            
            if (topicMap.has(mappedTopic)) {
              const topicData = topicMap.get(mappedTopic)!
              topicData.queries.push({
                prompt: query,
                answer: response,
                intent,
                date,
              })
              
              // 从mention_rate获取reach
              const mentionRate = dayModelData.mention_rate || {}
              const selfBrandKey = SELF_BRAND_CANDIDATES.find(b => mentionRate[b] !== undefined) || SELF_BRAND_CANDIDATES[0]
              topicData.reach.push(mentionRate[selfBrandKey] || 0)
              
              // 从absolute_rank获取rank
              const absoluteRank = dayModelData.absolute_rank || {}
              topicData.rank.push(typeof absoluteRank[selfBrandKey] === "number" ? absoluteRank[selfBrandKey] : 999)
              
              // 从content_share获取focus
              const contentShare = dayModelData.content_share || {}
              topicData.focus.push(contentShare[selfBrandKey] || 0)
              
              // 从sentiment_score获取sentiment
              const sentimentScore = dayModelData.sentiment_score || {}
              topicData.sentiment.push(sentimentScore[selfBrandKey] || 0.5)
              
              // 计算mentions（提及的品牌数量）
              const brandCount = Object.keys(mentionRate).length
              topicData.mentions.push(brandCount)
              
              totalQueries++
            }
          }
        }
      } else {
        // 2. 如果没有queries/response数据，从aspects和sentiment_detail中推理补充
        const aggregated = dayModelData.aggregated_sentiment_detail || {}
        const mentionRate = dayModelData.mention_rate || {}
        const absoluteRank = dayModelData.absolute_rank || {}
        const contentShare = dayModelData.content_share || {}
        const sentimentScore = dayModelData.sentiment_score || {}
        const selfBrandKey = SELF_BRAND_CANDIDATES.find(b => mentionRate[b] !== undefined) || SELF_BRAND_CANDIDATES[0]

        Object.entries(aggregated).forEach(([brandName, brandData]: [string, any]) => {
          if (!brandData || typeof brandData !== "object") return

          const positiveAspects = Array.isArray(brandData.positive_aspects) ? brandData.positive_aspects : []
          const negativeAspects = Array.isArray(brandData.negative_aspects) ? brandData.negative_aspects : []
          
          ;[...positiveAspects, ...negativeAspects].forEach((aspect: string) => {
            if (!aspect || typeof aspect !== "string") return
            
            const mappedTopic = mapAspectToTopic(aspect)
            if (!mappedTopic) return

            const topicData = topicMap.get(mappedTopic)!
            
            // 将aspect转换为query格式（不添加"关于"前缀）
            const prompt = aspect.includes("?") || aspect.includes("？") ? aspect : aspect
            const answer = aspect // 使用aspect作为answer
            
            topicData.queries.push({
              prompt,
              answer,
              intent: inferIntent(prompt),
              date,
            })
            
            topicData.reach.push(mentionRate[brandName] || 0)
            topicData.rank.push(typeof absoluteRank[brandName] === "number" ? absoluteRank[brandName] : 999)
            topicData.focus.push(contentShare[brandName] || 0)
            topicData.sentiment.push(sentimentScore[brandName] || 0.5)
            topicData.mentions.push(Object.keys(mentionRate).length)
            
            totalQueries++
          })
        })
      }
    })

    // 构建TopicRow数组
    const topicRows: TopicRow[] = []
    
    topicMap.forEach((topicData, topicName) => {
      if (topicData.queries.length === 0) return

      // 计算平均值
      const avgReach = topicData.reach.length > 0 
        ? topicData.reach.reduce((sum, r) => sum + r, 0) / topicData.reach.length 
        : 0
      const avgRank = topicData.rank.length > 0
        ? topicData.rank.reduce((sum, r) => sum + r, 0) / topicData.rank.length
        : 999
      const avgFocus = topicData.focus.length > 0
        ? topicData.focus.reduce((sum, f) => sum + f, 0) / topicData.focus.length
        : 0
      const avgSentiment = topicData.sentiment.length > 0
        ? topicData.sentiment.reduce((sum, s) => sum + s, 0) / topicData.sentiment.length
        : 0.5
      const avgMentions = topicData.mentions.length > 0
        ? Math.round(topicData.mentions.reduce((sum, m) => sum + m, 0) / topicData.mentions.length)
        : 0

      // 构建PromptItem数组（取前5个）
      const prompts: PromptItem[] = topicData.queries.slice(0, 5).map((q, index) => ({
        id: `${topicName}_${index}_${q.date}`,
        text: q.prompt,
        platform: modelKey === "chatgpt" ? "ChatGPT" : modelKey === "gemini" ? "Gemini" : modelKey === "claude" ? "Claude" : "All Models",
        role: "User",
        rank: avgRank,
        mentionsBrand: SELF_BRAND_CANDIDATES.some(b => q.answer.includes(b)),
        sentiment: avgSentiment,
        aiResponse: q.answer,
        mentions: avgMentions,
        citation: Math.max(1, Math.floor(avgMentions * 0.6)), // 估算citation
        focus: avgFocus * 100, // 转换为百分比
        intent: q.intent as any,
      }))

      // 确定主要意图
      const intentCounts = new Map<string, number>()
      topicData.queries.forEach(q => {
        intentCounts.set(q.intent, (intentCounts.get(q.intent) || 0) + 1)
      })
      const mainIntent = Array.from(intentCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "Information"

      topicRows.push({
        id: topicName.replace(/\s+/g, "_").toLowerCase(),
        topic: topicName,
        intent: mainIntent as any,
        promptCount: topicData.queries.length,
        visibility: avgReach * 100, // 转换为百分比
        mentionRate: avgReach * 100,
        sentiment: avgSentiment,
        rank: Math.round(avgRank),
        prompts,
      })
      
      coreQueries += topicData.queries.length
    })

    // 按promptCount排序
    topicRows.sort((a, b) => b.promptCount - a.promptCount)

    // 计算KPIs
    const kpis: IntentKpis = {
      topicCount: topicRows.length,
      promptCount: totalQueries,
      compositeRank: topicRows.length > 0 
        ? Math.round(topicRows.reduce((sum, t) => sum + t.rank, 0) / topicRows.length)
        : 0,
      avgVisibility: topicRows.length > 0
        ? topicRows.reduce((sum, t) => sum + t.visibility, 0) / topicRows.length
        : 0,
      avgMentionRate: topicRows.length > 0
        ? topicRows.reduce((sum, t) => sum + t.mentionRate, 0) / topicRows.length
        : 0,
      avgSentiment: topicRows.length > 0
        ? topicRows.reduce((sum, t) => sum + t.sentiment, 0) / topicRows.length
        : 0.5,
    }

    // 计算实际日期范围（减去1天）
    const actualStartDate = format(subDays(new Date(filteredData[0][0]), 1), "yyyy-MM-dd")
    const actualEndDate = format(subDays(new Date(filteredData[filteredData.length - 1][0]), 1), "yyyy-MM-dd")

    return NextResponse.json({
      kpis,
      topics: topicRows,
      actualDateRange: {
        start: actualStartDate,
        end: actualEndDate,
      },
    })
  } catch (error: any) {
    console.error("[Intent API] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

