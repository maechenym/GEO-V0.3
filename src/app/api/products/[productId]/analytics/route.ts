import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * GET /api/products/:productId/analytics
 * 获取指定产品的分析数据
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    
    // 根据productId获取产品名称
    // 这里需要从数据库或存储中获取产品名称
    // 目前使用productId作为产品名称（假设productId就是产品名称）
    const productName = decodeURIComponent(params.productId)
    
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
    
    let productData = data[productName]
    
    // 如果指定了日期范围，过滤数据
    if (startDate && endDate) {
      productData = productData.filter(([date]: [string, any]) => {
        return date >= startDate && date <= endDate
      })
    }
    
    return NextResponse.json({
      productName,
      data: productData,
    })
  } catch (error) {
    console.error("Error fetching product analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

