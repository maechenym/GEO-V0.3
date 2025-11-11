import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * POST /api/products/:id/import-competitors
 * 从JSON文件导入指定产品的竞品数据
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both sync and async params (Next.js 15+ uses Promise)
    const resolvedParams = await Promise.resolve(params)
    const productName = decodeURIComponent(resolvedParams.id)
    
    // 读取JSON文件（优先从项目 data 目录）
    const projectRoot = process.cwd()
    const projectDataPath = join(projectRoot, "data", "all_brands_results_20251106_075334.json")
    const jsonPath = join(projectRoot, "..", "all_brands_results_20251106_075334.json")
    const downloadsPath = "/Users/yimingchen/Downloads/all_brands_results_20251106_075334.json"
    
    let fileContent: string = ""
    const pathsToTry = [projectDataPath, downloadsPath, jsonPath]
    
    for (const tryPath of pathsToTry) {
      try {
        fileContent = readFileSync(tryPath, "utf-8")
        break
      } catch {
        continue
      }
    }
    
    if (!fileContent) {
      return NextResponse.json(
        { error: "Data file not found" },
        { status: 500 }
      )
    }
    
    const data = JSON.parse(fileContent)
    
    if (!data[productName]) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }
    
    // 获取第一个日期的数据
    const productData = data[productName]
    if (!productData || productData.length === 0) {
      return NextResponse.json(
        { error: "No data available for this product" },
        { status: 404 }
      )
    }
    
    const firstDayData = productData[0][1]
    const overall = firstDayData.overall
    
    if (!overall || !overall.mention_rate) {
      return NextResponse.json(
        { error: "No competitor data available" },
        { status: 404 }
      )
    }
    
    // 提取竞品列表
    const competitors = Object.keys(overall.mention_rate)
      .filter(name => name !== "英业达") // 排除自己
      .slice(0, 20) // 限制为前20个
    
    return NextResponse.json({
      productName,
      competitors: competitors.map(name => ({
        name,
        // 可以包含其他信息如score等
        mentionRate: overall.mention_rate[name],
        contentShare: overall.content_share[name],
        sentimentScore: overall.sentiment_score[name],
        totalScore: overall.total_score[name],
      })),
    })
  } catch (error) {
    console.error("Error importing competitors:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

