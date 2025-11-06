import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * GET /api/products-data
 * 提供所有产品的分析数据（用于MSW mock和前端访问）
 */
export async function GET() {
  try {
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
        { error: "Failed to load products data" },
        { status: 500 }
      )
    }
    
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

