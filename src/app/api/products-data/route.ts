import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * GET /api/products-data
 * 提供所有产品的分析数据（用于MSW mock和前端访问）
 */
export async function GET() {
  try {
    const jsonPath = join(process.cwd(), "..", "all_brands_results_20251106_075334.json")
    const fileContent = readFileSync(jsonPath, "utf-8")
    const data = JSON.parse(fileContent)
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=3600", // 缓存1小时
      },
    })
  } catch (error) {
    console.error("Error reading products data:", error)
    return NextResponse.json(
      { error: "Failed to load products data" },
      { status: 500 }
    )
  }
}

